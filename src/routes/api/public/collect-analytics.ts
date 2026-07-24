import { createFileRoute } from "@tanstack/react-router";

// Allowed catalog. Keep in sync with src/routes/Konfigurator.tsx.
const ALLOWED_EVENTS = new Set([
  "page_view",
  "navigation_click",
  "product_click",
  "configurator_open",
  "configurator_tier_selected",
  "configurator_financing_selected",
  "configurator_comparison_open",
  "preorder_open",
  "preorder_success",
  "live_experience_click",
  "live_experience_success",
  "faq_open",
  "cta_click",
]);

const ALLOWED_PRODUCTS = new Set(["mobile", "cabinet", "humanoid"]);
const ALLOWED_TIERS = new Set(["basic", "premium", "pro", "ultimate"]);
const ALLOWED_PAYMENT = new Set(["upfront", "monthly"]);

const ALLOWED_KEYS = new Set([
  "path",
  "product_id",
  "product_name",
  "tier",
  "payment_type",
  "cta_label",
  "faq_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "device",
]);

const ALLOWED_ORIGINS = [
  "https://lavidro.com",
  "https://www.lavidro.com",
  "https://base-web-blueprint.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // same-origin fetch/sendBeacon may omit Origin
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.hostname.endsWith(".lovable.app") || u.hostname.endsWith(".lovableproject.com"))
      return true;
  } catch {
    /* ignore */
  }
  return false;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function safeUuid(v: unknown): string | null {
  return typeof v === "string" && UUID_RE.test(v) ? v : null;
}
function clip(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

// naive in-memory rate limit (best-effort per worker instance)
const RATE = new Map<string, { n: number; reset: number }>();
const LIMIT = 60; // events / minute / ip
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = RATE.get(ip);
  if (!rec || rec.reset < now) {
    RATE.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  rec.n += 1;
  if (rec.n > LIMIT) return true;
  return false;
}

function sanitizeProps(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string> = {};
  let count = 0;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") continue;
    out[k] = String(v).slice(0, 200);
    if (++count >= 16) break;
  }
  return out;
}

export const Route = createFileRoute("/api/public/collect-analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (!isAllowedOrigin(origin)) {
          return new Response("Forbidden", { status: 403 });
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (rateLimited(ip)) {
          return new Response("Too Many Requests", { status: 429 });
        }

        let body: unknown;
        try {
          const text = await request.text();
          if (!text || text.length > 8_000) return new Response("Bad Request", { status: 400 });
          body = JSON.parse(text);
        } catch {
          return new Response("Bad Request", { status: 400 });
        }
        if (!body || typeof body !== "object") return new Response("Bad Request", { status: 400 });

        const b = body as Record<string, unknown>;
        const eventName = clip(b.event_name, 64);
        if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
          return new Response("Invalid event", { status: 400 });
        }

        const productId = clip(b.product_id, 32);
        const tier = clip(b.tier, 32);
        const paymentType = clip(b.payment_type, 32);
        if (productId && !ALLOWED_PRODUCTS.has(productId)) {
          return new Response("Invalid product", { status: 400 });
        }
        if (tier && !ALLOWED_TIERS.has(tier)) {
          return new Response("Invalid tier", { status: 400 });
        }
        if (paymentType && !ALLOWED_PAYMENT.has(paymentType)) {
          return new Response("Invalid payment_type", { status: 400 });
        }

        const record = {
          visitor_id: safeUuid(b.visitor_id),
          session_id: safeUuid(b.session_id),
          event_name: eventName,
          path: clip(b.path, 200),
          product_id: productId,
          tier,
          payment_type: paymentType,
          properties: sanitizeProps(b.properties),
        };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("analytics_events").insert(record);
        if (error) {
          console.error("[collect-analytics] insert failed", error.message);
          return new Response("Error", { status: 500 });
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
