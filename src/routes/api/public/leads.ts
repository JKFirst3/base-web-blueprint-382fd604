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

function cleanOptionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

export const Route = createFileRoute("/api/public/leads")({
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
          if (!text || text.length > 2_000) {
            return Response.json({ error: "Invalid request" }, { status: 400 });
          }
          body = JSON.parse(text) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const name = cleanOptionalText(body.name, 100);
        const email = cleanOptionalText(body.email, 255)?.toLowerCase() ?? "";
        const painPoint = cleanOptionalText(body.pain_point, 100);
        const requestType = body.request_type === "interview" ? "interview" : "termin";
        // Template mode only (DB value stays "termin" for the existing RLS rule).
        const templateMode =
          requestType === "termin" && body.form_mode === "newsletter" ? "newsletter" : requestType;
        const phone = cleanOptionalText(body.phone, 40);
        const availability = cleanOptionalText(body.availability, 500);
        if (!email || !email.includes("@") || body.consent !== true) {
          return Response.json({ error: "Invalid lead" }, { status: 400 });
        }

        const url = process.env.SUPABASE_URL;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!url || !publishableKey) {
          console.error("[leads] Backend configuration is unavailable");
          return Response.json({ error: "Service unavailable" }, { status: 503 });
        }

        const backend = createClient<Database>(url, publishableKey, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const { error } = await backend.from("leads").insert({
          name,
          email,
          pain_point: painPoint,
          consent: true,
          request_type: requestType,
          phone,
          availability,
        });

        if (error) {
          console.error("[leads] Insert failed", error.code, error.message);
          return Response.json({ error: "Could not save lead" }, { status: 500 });
        }

        try {
          const { enqueueTransactionalEmail } = await import("@/lib/email/enqueue.server");
          await enqueueTransactionalEmail({
            templateName: "lead-confirmation",
            recipientEmail: email,
            idempotencyKey: `lead-${templateMode}-${email}-${new Date().toISOString().slice(0, 10)}`,
            templateData: {
              name: name ?? undefined,
              email,
              requestType: templateMode,
              phone: phone ?? undefined,
              availability: availability ?? undefined,
            },
          });
        } catch (mailError) {
          console.error("[leads] Confirmation email failed", mailError);
        }

        return new Response(null, { status: 204 });

      },
    },
  },
});