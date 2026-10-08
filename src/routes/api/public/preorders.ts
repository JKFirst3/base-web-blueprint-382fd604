import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  allowedPreorderOrigin,
  createOrFindSubmission,
  deliveryStatus,
  isPreorderRateLimited,
} from "@/lib/preorder-request.server";

import { PREORDER_SOURCES } from "@/lib/campaign";
import { salePrices } from "@/lib/sale-pricing";

const valueOptions = [
  "Weniger Zeit für Wäsche aufwenden",
  "Wiederkehrende Hausarbeit reduzieren",
  "Möglichst lange selbständig im eigenen Zuhause leben",
  "Weniger Abhängigkeit von Haushaltshilfen",
  "Schonender und zuverlässigere Textilpflege",
  "Sonstige",
] as const;
const answersSchema = z
  .object({
    household_size: z.enum(["1", "2", "3-4", "5+"]).nullish(),
    job_title: z.string().trim().min(1).max(100).nullish(),
    greatest_value: z.enum(valueOptions).nullish(),
    greatest_value_other: z.string().trim().min(1).max(300).nullish(),
  })
  .refine((answers) =>
    answers.greatest_value === "Sonstige"
      ? !!answers.greatest_value_other
      : !answers.greatest_value_other,
  );

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
          const parsed: unknown = JSON.parse(text);
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return Response.json({ error: "Invalid request" }, { status: 400 });
          }
          body = parsed as Record<string, unknown>;
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const name = cleanText(body.name, 100);
        const answers = answersSchema.safeParse({
          household_size:
            body.household_size === undefined || body.household_size === ""
              ? null
              : body.household_size,
          job_title: body.job_title === undefined || body.job_title === "" ? null : body.job_title,
          greatest_value:
            body.greatest_value === undefined || body.greatest_value === ""
              ? null
              : body.greatest_value,
          greatest_value_other:
            body.greatest_value_other === undefined || body.greatest_value_other === ""
              ? null
              : body.greatest_value_other,
        });
        const clientSubmissionId = z.string().uuid().safeParse(body.client_submission_id);
        const email = cleanText(body.email, 255)?.toLowerCase() ?? "";
        const requestedSolutionId = cleanText(body.solution_id, 100);
        const requestedTier = cleanText(body.tier, 50);
        const size = cleanText(body.size, 50) ?? "Standard";
        const payment_type = cleanText(body.payment_type, 20);
        const parsedSource = z.enum(PREORDER_SOURCES).safeParse(body.source ?? "configurator");
        if (!parsedSource.success)
          return Response.json({ error: "Invalid preorder" }, { status: 400 });
        const source = parsedSource.data;
        const experimentVariant =
          body.variant_id == null ? null : z.enum(["a", "b", "c"]).safeParse(body.variant_id);
        if (experimentVariant !== null && !experimentVariant.success)
          return Response.json({ error: "Invalid variant" }, { status: 400 });

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
        const offer = salePrices(solution_id, source);
        const price_eur = offer?.price ?? catalogEntry.price;
        const monthly_eur =
          normalizedPaymentType === "monthly" ? (offer?.monthly ?? catalogEntry.monthly) : null;
        if (!answers.success) return Response.json({ error: "Invalid answers" }, { status: 400 });

        const marketingConsent = body.marketing_consent;
        const nowIso = new Date().toISOString();

        let supabaseAdmin;
        try {
          ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
        } catch {
          console.error("[preorders] Backend configuration is unavailable");
          return Response.json({ error: "Service unavailable" }, { status: 503 });
        }

        // Preserve the active A/B/C copy variant with the inquiry (never retroactively infer it).
        // The migration adds this nullable metadata column; legacy submissions keep null.
        const untypedBackend =
          supabaseAdmin as unknown as import("@supabase/supabase-js").SupabaseClient;
        // Saved first: this is the submitted inquiry (funnel step 5), independent of DOI.
        const submission = await createOrFindSubmission(
          async () => {
            const { data, error } = await untypedBackend
              .from("preorders")
              .insert({
                variant_id: experimentVariant?.data ?? null,
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
                occupation_group: null, // retired field; existing records remain intact
                consent: true,
                // Requested only; becomes active solely through confirm_preorder_doi.
                marketing_consent: marketingConsent,
                marketing_consent_at: marketingConsent ? nowIso : null,
                marketing_consent_active: false,
                transfer_consent: false, // no consent is requested or inferred
                transfer_consent_at: null,
                doi_status: "pending",
                source,
              })
              .select("id")
              .single();
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

        try {
          const { startDoi, confirmBaseUrl } = await import("@/lib/preorder-doi.server");
          const { sendLoggedTemplateEmail } = await import("@/lib/email/send-logged.server");
          const id = submission.row.id;
          const doiStatus = await startDoi(
            id,
            confirmBaseUrl(request.url),
            {
              name,
              product: solution_name,
              paymentMode:
                normalizedPaymentType === "monthly" ? "Monatliche Zahlung" : "Einmalzahlung",
              price:
                normalizedPaymentType === "monthly" && monthly_eur
                  ? `${monthly_eur.toLocaleString("de-DE")} € / Monat, inkl. 19 % MwSt. und Versand`
                  : `${price_eur.toLocaleString("de-DE")} €, inkl. 19 % MwSt. und Versand`,
              marketingRequested: marketingConsent,
            },
            {
              now: () => Date.now(),
              setPending: async (rowId, doi_token_hash, doi_expires_at) => {
                const { error: e } = await supabaseAdmin
                  .from("preorders")
                  .update({ doi_token_hash, doi_expires_at, doi_status: "pending" })
                  .eq("id", rowId);
                if (e) throw new Error(e.code);
              },
              markSent: async (rowId, doi_sent_at) => {
                await supabaseAdmin.from("preorders").update({ doi_sent_at }).eq("id", rowId);
              },
              markSendFailed: async (rowId) => {
                await supabaseAdmin
                  .from("preorders")
                  .update({ doi_status: "send_failed", doi_token_hash: null })
                  .eq("id", rowId);
              },
              sendMail: ({ idempotencyKey, templateData }) =>
                sendLoggedTemplateEmail({
                  templateName: "preorder-doi",
                  recipientEmail: email,
                  idempotencyKey,
                  templateData,
                }),
            },
            source,
          );

          return Response.json({
            saved: true,
            email_status: doiStatus === "pending" ? "sent" : "send_failed",
          });
        } catch {
          // Saving the inquiry is step 5; a DOI setup failure must not turn it into a failed submission.
          console.error("[preorders] DOI setup unavailable");
          await Promise.resolve(
            supabaseAdmin
              .from("preorders")
              .update({ doi_status: "send_failed" })
              .eq("id", submission.row.id),
          ).catch(() => undefined);
          return Response.json({ saved: true, email_status: "send_failed" });
        }
      },
    },
  },
});
