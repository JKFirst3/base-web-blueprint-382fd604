import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const ALLOWED_ORIGINS = new Set([
  "https://lavidro.com",
  "https://www.lavidro.com",
  "https://base-web-blueprint.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
]);

const RATE_LIMIT = new Map<string, { count: number; resetsAt: number }>();

type CatalogEntry = { name: string; price: number; monthly: number };

const PREORDER_CATALOG: Record<string, Record<string, CatalogEntry>> = {
  mobile: {
    basic: { name: "Lavidro Mobile", price: 9000, monthly: 270 },
    premium: { name: "Lavidro Mobile", price: 14000, monthly: 420 },
  },
  cabinet: {
    basic: { name: "Lavidro Cabinet", price: 12500, monthly: 375 },
    premium: { name: "Lavidro Cabinet", price: 21500, monthly: 645 },
  },
  one: {
    standard: { name: "Lavidro One", price: 10000, monthly: 300 },
  },
} as const;

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin || ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com");
  } catch {
    return false;
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = RATE_LIMIT.get(ip);
  if (!current || current.resetsAt <= now) {
    RATE_LIMIT.set(ip, { count: 1, resetsAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t ? t.slice(0, max) : null;
}

export const Route = createFileRoute("/api/public/preorders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAllowedOrigin(request.headers.get("origin"))) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (isRateLimited(ip)) {
          return Response.json({ error: "Too many requests" }, { status: 429 });
        }

        let body: Record<string, unknown>;
        try {
          const text = await request.text();
          if (!text || text.length > 4_000) {
            return Response.json({ error: "Invalid request" }, { status: 400 });
          }
          body = JSON.parse(text) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const name = cleanText(body.name, 100);
        const email = cleanText(body.email, 255)?.toLowerCase() ?? "";
        const requestedSolutionId = cleanText(body.solution_id, 100);
        const requestedTier = cleanText(body.tier, 50);
        const size = cleanText(body.size, 50) ?? "Standard";
        const payment_type = cleanText(body.payment_type, 20);
        // Only the two known sources are accepted; anything else is rejected.
        const rawSource = body.source === undefined || body.source === null ? "configurator" : body.source;
        if (rawSource !== "configurator" && rawSource !== "smoke_google_v1") {
          return Response.json({ error: "Invalid preorder" }, { status: 400 });
        }
        const source: "configurator" | "smoke_google_v1" = rawSource;

        const product =
          requestedSolutionId && requestedSolutionId in PREORDER_CATALOG
            ? PREORDER_CATALOG[requestedSolutionId as keyof typeof PREORDER_CATALOG]
            : null;
        const catalogEntry =
          product && requestedTier && requestedTier in product
            ? product[requestedTier as keyof typeof product]
            : null;

        if (
          !name ||
          !email ||
          !email.includes("@") ||
          !requestedSolutionId ||
          !requestedTier ||
          !catalogEntry ||
          !["upfront", "monthly"].includes(payment_type ?? "") ||
          body.consent !== true ||
          typeof body.marketing_consent !== "boolean"
        ) {
          return Response.json({ error: "Invalid preorder" }, { status: 400 });
        }

        const normalizedPaymentType = payment_type === "monthly" ? "monthly" : "upfront";
        const solution_id = requestedSolutionId;
        const solution_name = catalogEntry.name;
        const tier = requestedTier;
        const price_eur = catalogEntry.price;
        const monthly_eur = normalizedPaymentType === "monthly" ? catalogEntry.monthly : null;

        const url = process.env.SUPABASE_URL;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!url || !publishableKey) {
          console.error("[preorders] Backend configuration is unavailable");
          return Response.json({ error: "Service unavailable" }, { status: 503 });
        }

        const backend = createClient<Database>(url, publishableKey, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const { error } = await backend.from("preorders").insert({
          name,
          email,
          solution_id,
          solution_name,
          tier,
          size,
          payment_type: normalizedPaymentType,
          price_eur,
          monthly_eur,
          consent: true,
           marketing_consent: body.marketing_consent,
           marketing_consent_at: body.marketing_consent ? new Date().toISOString() : null,
          source,
        });

        if (error) {
          console.error("[preorders] Insert failed", error.code, error.message);
          return Response.json({ error: "Could not save preorder" }, { status: 500 });
        }

        try {
          const { enqueueTransactionalEmail } = await import("@/lib/email/enqueue.server");
          await enqueueTransactionalEmail({
            templateName: "preorder-confirmation",
            recipientEmail: email,
            idempotencyKey: `preorder-${email}-${solution_id}-${tier}-${normalizedPaymentType}`,
            templateData: {
              name,
              email,
              product: solution_name,
              tier,
              paymentMode:
                normalizedPaymentType === "monthly" ? "Monatliche Zahlung" : "Einmalzahlung",
              price:
                normalizedPaymentType === "monthly" && monthly_eur
                   ? `${monthly_eur.toLocaleString("de-DE")} € / Monat, inkl. 19 % MwSt. und Versand`
                   : `${price_eur.toLocaleString("de-DE")} €, inkl. 19 % MwSt. und Versand`,
            },
          });
        } catch (mailError) {
          console.error("[preorders] Confirmation email failed", mailError);
        }

        return new Response(null, { status: 204 });

      },
    },
  },
});
