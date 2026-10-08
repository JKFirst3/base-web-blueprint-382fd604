import { createFileRoute } from "@tanstack/react-router";
import { allowedLeadOrigin, isLeadRateLimited } from "@/lib/lead-request.server";

function cleanOptionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

export const Route = createFileRoute("/api/public/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!allowedLeadOrigin(request.headers.get("origin"), request.url)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        if (isLeadRateLimited(request.headers.get("cf-connecting-ip"))) {
          return Response.json({ error: "Too many requests" }, { status: 429 });
        }

        let body: Record<string, unknown>;
        try {
          const text = await request.text();
          if (!text || text.length > 2_000) {
            return Response.json({ error: "Invalid request" }, { status: 400 });
          }
          const parsed: unknown = JSON.parse(text);
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid");
          body = parsed as Record<string, unknown>;
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

        // Service-role-only DB insert. Direct public SQL inserts are revoked by the migration.
        let backend;
        try {
          ({ supabaseAdmin: backend } = await import("@/integrations/supabase/client.server"));
        } catch {
          console.error("[leads] Backend configuration is unavailable");
          return Response.json({ error: "Service unavailable" }, { status: 503 });
        }
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
          const { sendLoggedTemplateEmail } = await import("@/lib/email/send-logged.server");
          await sendLoggedTemplateEmail({
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