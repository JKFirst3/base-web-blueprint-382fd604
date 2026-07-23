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
        const solution_id = cleanText(body.solution_id, 100);
        const solution_name = cleanText(body.solution_name, 200);
        const tier = cleanText(body.tier, 50);
        const size = cleanText(body.size, 50) ?? "Standard";
        const payment_type = cleanText(body.payment_type, 20);
        const price_eur = typeof body.price_eur === "number" ? body.price_eur : null;
        const monthly_eur = typeof body.monthly_eur === "number" ? body.monthly_eur : null;
        const source = cleanText(body.source, 50) ?? "configurator";

        if (
          !name ||
          !email ||
          !email.includes("@") ||
          !solution_id ||
          !solution_name ||
          !tier ||
          !payment_type ||
          price_eur === null ||
          body.consent !== true
        ) {
          return Response.json({ error: "Invalid preorder" }, { status: 400 });
        }

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
          payment_type,
          price_eur,
          monthly_eur,
          consent: true,
          source,
        });

        if (error) {
          console.error("[preorders] Insert failed", error.code, error.message);
          return Response.json({ error: "Could not save preorder" }, { status: 500 });
        }

        return new Response(null, { status: 204 });
      },
    },
  },
});
