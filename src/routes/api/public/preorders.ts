import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  OCCUPATION_GROUPS,
  allowedPreorderOrigin,
  createOrFindSubmission,
  deliveryStatus,
  isPreorderRateLimited,
} from "@/lib/preorder-request.server";

const valueOptions = ["Weniger Zeit für Wäsche aufwenden", "Wiederkehrende Hausarbeit reduzieren", "Möglichst lange selbständig im eigenen Zuhause leben", "Weniger Abhängigkeit von Haushaltshilfen", "Schonender und zuverlässigere Textilpflege", "Sonstige"] as const;
const answersSchema = z.object({
  household_size: z.enum(["1", "2", "3-4", "5+"]).nullish(),
  job_title: z.string().trim().min(1).max(100).nullish(),
  greatest_value: z.enum(valueOptions).nullish(),
  greatest_value_other: z.string().trim().min(1).max(300).nullish(),
  occupation_group: z.enum(OCCUPATION_GROUPS).nullish(),
}).refine((answers) => answers.greatest_value === "Sonstige" ? !!answers.greatest_value_other : !answers.greatest_value_other);

type CatalogEntry = { name: string; price: number; monthly: number };

// Only currently offered configurations are accepted. Internal tier keys stay
// compatible with existing records and the database insert rule.
const PREORDER_CATALOG: Record<string, Record<string, CatalogEntry>> = {
  mobile: {
    premium: { name: "Lavidro Mobile", price: 22990, monthly: 469 },
  },
  cabinet: {
    premium: { name: "Lavidro Cabinet", price: 20449, monthly: 390 },
  },
  one: {
    standard: { name: "Lavidro One", price: 8990, monthly: 199 },
  },
} as const;

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t ? t.slice(0, max) : null;
}

export const Route = createFileRoute("/api/public/preorders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!allowedPreorderOrigin(request.headers.get("origin"), request.url)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        if (isPreorderRateLimited(request.headers.get("cf-connecting-ip"))) {
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
        const answers = answersSchema.safeParse({
          household_size: body.household_size === undefined || body.household_size === "" ? null : body.household_size,
          job_title: body.job_title === undefined || body.job_title === "" ? null : body.job_title,
          greatest_value: body.greatest_value === undefined || body.greatest_value === "" ? null : body.greatest_value,
          greatest_value_other: body.greatest_value_other === undefined || body.greatest_value_other === "" ? null : body.greatest_value_other,
          occupation_group: body.occupation_group === undefined || body.occupation_group === "" ? null : body.occupation_group,
        });
        const clientSubmissionId = z.string().uuid().safeParse(body.client_submission_id);
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
          !answers.success ||
          !name ||
          !email ||
          !email.includes("@") ||
          !requestedSolutionId ||
          !requestedTier ||
          !catalogEntry ||
          !["upfront", "monthly"].includes(payment_type ?? "") ||
          body.consent !== true ||
          typeof body.marketing_consent !== "boolean" ||
          !clientSubmissionId.success
        ) {
          return Response.json({ error: "Invalid preorder" }, { status: 400 });
        }

        const normalizedPaymentType = payment_type === "monthly" ? "monthly" : "upfront";
        const solution_id = requestedSolutionId;
        const solution_name = catalogEntry.name;
        const tier = requestedTier;
        const price_eur = catalogEntry.price;
        const monthly_eur = normalizedPaymentType === "monthly" ? catalogEntry.monthly : null;
        if (!answers.success) return Response.json({ error: "Invalid answers" }, { status: 400 });

        if (typeof body.transfer_consent !== "boolean") {
          return Response.json({ error: "Invalid preorder" }, { status: 400 });
        }
        const transferConsent = body.transfer_consent;
        const nowIso = new Date().toISOString();

        let supabaseAdmin;
        try {
          ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
        } catch {
          console.error("[preorders] Backend configuration is unavailable");
          return Response.json({ error: "Service unavailable" }, { status: 503 });
        }

        // Saved first: this is the submitted inquiry (funnel step 5), independent of DOI.
        const submission = await createOrFindSubmission(
          async () => {
            const { data, error } = await supabaseAdmin.from("preorders").insert({
            client_submission_id: clientSubmissionId.data,
            name,
            email,
            solution_id,
            solution_name,
            tier,
            size,
            payment_type: normalizedPaymentType,
            price_eur,
            monthly_eur,
            household_size: answers.data.household_size ?? null,
            job_title: answers.data.job_title ?? null,
            greatest_value: answers.data.greatest_value ?? null,
            greatest_value_other: answers.data.greatest_value_other ?? null,
            occupation_group: answers.data.occupation_group ?? null,
            consent: true,
            // Requested only; becomes active solely through confirm_preorder_doi.
            marketing_consent: body.marketing_consent,
            marketing_consent_at: body.marketing_consent ? nowIso : null,
            marketing_consent_active: false,
            transfer_consent: transferConsent,
            transfer_consent_at: transferConsent ? nowIso : null,
            doi_status: "pending",
            source,
            }).select("id").single();
            return { data, error };
          },
          async () => {
            const { data } = await supabaseAdmin
              .from("preorders")
              .select("id, doi_status, doi_sent_at")
              .eq("client_submission_id", clientSubmissionId.data)
              .maybeSingle();
            return data;
          },
        );

        if (submission.kind === "failed") {
          console.error("[preorders] Insert failed");
          return Response.json({ error: "Could not save preorder" }, { status: 500 });
        }
        if (submission.kind === "existing") {
          return Response.json({ saved: true, email_status: deliveryStatus(submission.row) });
        }

        const { startDoi, confirmBaseUrl } = await import("@/lib/preorder-doi.server");
        const { sendLoggedTemplateEmail } = await import("@/lib/email/send-logged.server");
        const id = submission.row.id;
        const doiStatus = await startDoi(
          id,
          confirmBaseUrl(request.url),
          {
            name,
            product: solution_name,
            paymentMode: normalizedPaymentType === "monthly" ? "Monatliche Zahlung" : "Einmalzahlung",
            price:
              normalizedPaymentType === "monthly" && monthly_eur
                ? `${monthly_eur.toLocaleString("de-DE")} € / Monat, inkl. 19 % MwSt. und Versand`
                : `${price_eur.toLocaleString("de-DE")} €, inkl. 19 % MwSt. und Versand`,
            marketingRequested: body.marketing_consent === true,
          },
          {
            now: () => Date.now(),
            setPending: async (rowId, doi_token_hash, doi_expires_at) => {
              const { error: e } = await supabaseAdmin
                .from("preorders").update({ doi_token_hash, doi_expires_at, doi_status: "pending" }).eq("id", rowId);
              if (e) throw new Error(e.code);
            },
            markSent: async (rowId, doi_sent_at) => {
              await supabaseAdmin.from("preorders").update({ doi_sent_at }).eq("id", rowId);
            },
            markSendFailed: async (rowId) => {
              await supabaseAdmin
                .from("preorders").update({ doi_status: "send_failed", doi_token_hash: null }).eq("id", rowId);
            },
            sendMail: ({ idempotencyKey, templateData }) =>
              sendLoggedTemplateEmail({ templateName: "preorder-doi", recipientEmail: email, idempotencyKey, templateData }),
          },
        );

        return Response.json({ saved: true, email_status: doiStatus === "pending" ? "sent" : "send_failed" });

      },
    },
  },
});
