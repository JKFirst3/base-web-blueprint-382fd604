import assert from "node:assert/strict";
import { test } from "node:test";
import { requestPreorder } from "./preorder-client.ts";
import { createOrFindSubmission, deliveryStatus } from "./preorder-request.server.ts";
import { startDoi } from "./preorder-doi.server.ts";

test("timeout after saving and concurrent retries create one row and attempt DOI once", async () => {
  const rows = new Map<string, { id: string; doi_status: string; doi_sent_at: string | null }>();
  let mailAttempts = 0;
  let releaseMail!: () => void;
  let notifyMailStarted!: () => void;
  const mailStarted = new Promise<void>((resolve) => {
    notifyMailStarted = resolve;
  });
  const waiting = new Promise<void>((resolve) => {
    releaseMail = resolve;
  });
  const fakeFetch: typeof fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    const submission = await createOrFindSubmission(
      async () => {
        if (rows.has(body.client_submission_id)) return { data: null, error: { code: "23505" } };
        const row = { id: "row-1", doi_status: "pending", doi_sent_at: null };
        rows.set(body.client_submission_id, row);
        return { data: row, error: null };
      },
      async () => rows.get(body.client_submission_id) ?? null,
    );
    if (submission.kind === "failed") return Response.json({}, { status: 500 });
    if (submission.kind === "existing")
      return Response.json({ saved: true, email_status: deliveryStatus(submission.row) });
    const status = await startDoi(
      submission.row.id,
      "http://localhost",
      {},
      {
        now: () => Date.now(),
        setPending: async () => {},
        markSent: async () => {},
        markSendFailed: async () => {},
        sendMail: async () => {
          mailAttempts++;
          notifyMailStarted();
          await waiting;
          return { success: true };
        },
      },
    );
    return Response.json({
      saved: true,
      email_status: status === "pending" ? "sent" : "send_failed",
    });
  };
  const payload = { client_submission_id: crypto.randomUUID() };
  await assert.rejects(requestPreorder(payload, fakeFetch, 20), { name: "AbortError" });
  // Hashing may finish after the browser deadline; wait for the simulated server, not a timer.
  await mailStarted;
  const retries = await Promise.all(
    Array.from({ length: 4 }, () => requestPreorder(payload, fakeFetch)),
  );
  assert.ok(retries.every((r) => r.saved && r.email_status === "processing"));
  assert.equal(rows.size, 1);
  assert.equal(mailAttempts, 1);
  releaseMail();
});

test("timeout covers stalled JSON body and aborts transport", async () => {
  let signal: AbortSignal | null | undefined;
  const fakeFetch: typeof fetch = async (_url, options) => {
    signal = options?.signal;
    return { ok: true, json: () => new Promise(() => {}) } as unknown as Response;
  };
  await assert.rejects(requestPreorder({}, fakeFetch, 10), { name: "AbortError" });
  assert.equal(signal?.aborted, true);
});

test("requires explicit saved=true and a known mail status", async () => {
  for (const body of [
    null,
    {},
    { saved: false, email_status: "sent" },
    { saved: true, email_status: "unknown" },
  ]) {
    await assert.rejects(requestPreorder({}, async () => Response.json(body)));
  }
  for (const email_status of ["sent", "processing", "send_failed"]) {
    assert.deepEqual(
      await requestPreorder({}, async () => Response.json({ saved: true, email_status })),
      { saved: true, email_status },
    );
  }
});
