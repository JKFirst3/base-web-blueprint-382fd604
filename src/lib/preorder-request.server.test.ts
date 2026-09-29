import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  allowedPreorderOrigin,
  createOrFindSubmission,
  deliveryStatus,
  isPreorderRateLimited,
} from "./preorder-request.server.ts";

describe("preorder request security", () => {
  test("accepts only the exact request origin", () => {
    assert.equal(allowedPreorderOrigin("https://preview.example", "https://preview.example/api/public/preorders"), true);
    assert.equal(allowedPreorderOrigin("https://foreign.lovable.app", "https://base-web-blueprint.lovable.app/api/public/preorders"), false);
    assert.equal(allowedPreorderOrigin(null, "https://lavidro.com/api/public/preorders"), false);
  });

  test("never uses a shared bucket without a trusted platform IP", () => {
    for (let i = 0; i < 20; i += 1) assert.equal(isPreorderRateLimited(null, 1_800_000_000_000), false);
  });

  test("limits a supplied platform IP and ignores spoofable forwarded values", () => {
    const ip = `198.51.100.${Math.floor(Math.random() * 100) + 1}`;
    for (let i = 0; i < 5; i += 1) assert.equal(isPreorderRateLimited(ip, 1_800_000_000_000), false);
    assert.equal(isPreorderRateLimited(ip, 1_800_000_000_000), true);
  });
});

describe("preorder idempotency", () => {
  test("creates once and does not look up an existing row", async () => {
    let lookups = 0;
    const result = await createOrFindSubmission(
      async () => ({ data: { id: "new" }, error: null }),
      async () => { lookups += 1; return null; },
    );
    assert.deepEqual(result, { kind: "created", row: { id: "new" } });
    assert.equal(lookups, 0);
  });

  test("returns the original row after a unique-key retry", async () => {
    const row = { id: "existing", doi_status: "pending", doi_sent_at: null };
    const result = await createOrFindSubmission(
      async () => ({ data: null, error: { code: "23505" } }),
      async () => row,
    );
    assert.deepEqual(result, { kind: "existing", row });
    assert.equal(deliveryStatus(row), "processing");
    assert.equal(deliveryStatus({ ...row, doi_sent_at: "2026-09-29T12:00:00.000Z" }), "sent");
    assert.equal(deliveryStatus({ ...row, doi_status: "send_failed" }), "send_failed");
  });

  test("does not hide unrelated storage failures", async () => {
    const result = await createOrFindSubmission(
      async () => ({ data: null, error: { code: "42501" } }),
      async () => ({ id: "wrong", doi_status: "pending", doi_sent_at: null }),
    );
    assert.deepEqual(result, { kind: "failed" });
  });
});