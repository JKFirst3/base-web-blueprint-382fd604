import assert from "node:assert/strict";
import { mock, test } from "node:test";

// Execute the real request handler. Database and email boundaries are in-memory only.
test("real preorder handler: validation, consent booleans, retired fields and concurrent retries", async () => {
  mock.module("@tanstack/react-router", {
    namedExports: { createFileRoute: () => (config: unknown) => config },
  });
  const rows = new Map<string, Record<string, unknown>>();
  let mailAttempts = 0;
  let failMail = false;
  const db = {
    from: () => ({
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            if (rows.has(String(row.client_submission_id))) return { data: null, error: { code: "23505" } };
            const saved = { ...row, id: crypto.randomUUID(), doi_sent_at: null };
            rows.set(String(row.client_submission_id), saved);
            return { data: { id: saved.id }, error: null };
          },
        }),
      }),
      select: () => ({
        eq: (_key: string, value: string) => ({
          maybeSingle: async () => ({ data: rows.get(value) ?? null, error: null }),
        }),
      }),
      update: (update: object) => ({
        eq: async (_key: string, id: string) => {
          const row = [...rows.values()].find((r) => r.id === id);
          if (row) Object.assign(row, update);
          return { error: null };
        },
      }),
    }),
  };
  mock.module("@/integrations/supabase/client.server", { namedExports: { supabaseAdmin: db } });
  mock.module("@/lib/email/send-logged.server", {
    namedExports: {
      sendLoggedTemplateEmail: async () => {
        mailAttempts++;
        if (failMail) throw new Error("simulated mail failure");
        return { success: true };
      },
    },
  });
  const { Route } = await import("./preorders.ts");
  const handler = (
    Route as unknown as {
      server: { handlers: { POST: (context: { request: Request }) => Promise<Response> } };
    }
  ).server.handlers.POST;
  const base = {
    name: "Isolated Test",
    email: "test@example.invalid",
    solution_id: "one",
    tier: "standard",
    payment_type: "upfront",
    consent: true,
    marketing_consent: false,
    client_submission_id: crypto.randomUUID(),
    job_title: "Private free text",
  };
  const post = (body: unknown, origin = "http://localhost") =>
    handler({
      request: new Request("http://localhost/api/public/preorders", {
        method: "POST",
        headers: { origin },
        body: JSON.stringify(body),
      }),
    }) as Promise<Response>;
  for (const body of [
    null,
    [],
    { ...base, marketing_consent: "true" },
    { ...base, consent: false },
    { ...base, source: "unapproved campaign" },
  ]) {
    assert.equal((await post(body)).status, 400);
  }
  assert.equal((await post(base, "https://foreign.example")).status, 403);
  assert.equal(rows.size, 0);
  const responses = await Promise.all(Array.from({ length: 6 }, () => post(base)));
  for (const response of responses) assert.equal((await response.json()).saved, true);
  assert.equal(rows.size, 1);
  assert.equal(mailAttempts, 1);
  const row = rows.get(base.client_submission_id)!;
  assert.equal(row.marketing_consent, false);
  assert.equal(row.marketing_consent_active, false);
  assert.equal(row.occupation_group, null);
  assert.equal(row.transfer_consent, false);
  assert.equal(row.transfer_consent_at, null);
  assert.equal(row.job_title, "Private free text");
  assert.equal(row.price_eur, 8990);
  failMail = true;
  const second = {
    ...base,
    client_submission_id: crypto.randomUUID(),
    occupation_group: "legacy field is ignored",
    transfer_consent: true,
    source: "smoke_google_one_v1",
    marketing_consent: true,
  };
  assert.deepEqual(await (await post(second)).json(), { saved: true, email_status: "send_failed" });
  assert.deepEqual(await (await post(second)).json(), { saved: true, email_status: "send_failed" });
  assert.equal(mailAttempts, 2);
  assert.equal(rows.size, 2);
  assert.equal(rows.get(second.client_submission_id)?.marketing_consent_active, false);
  assert.equal(rows.get(second.client_submission_id)?.source, "smoke_google_one_v1");
  assert.equal(rows.get(second.client_submission_id)?.transfer_consent, false);
  assert.equal(rows.get(second.client_submission_id)?.occupation_group, null);
});
