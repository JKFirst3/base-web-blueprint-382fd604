import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { startDoi, tokenFromLocationHash } from "./preorder-doi.server.ts";

describe("DOI token transport", () => {
  test("reads a token from the fragment", () => {
    assert.equal(tokenFromLocationHash("#token=abc_123"), "abc_123");
  });

  test("a query-only link never provides a token", () => {
    assert.equal(tokenFromLocationHash(""), null);
  });
});

describe("DOI pending failure", () => {
  test("best-effort marks send_failed and never sends mail", async () => {
    let markedFailed = 0;
    let sent = 0;
    const status = await startDoi("row-1", "https://lavidro.com", {}, {
      now: () => 1_800_000_000_000,
      setPending: async () => { throw new Error("database failure"); },
      markSent: async () => undefined,
      markSendFailed: async () => { markedFailed += 1; },
      sendMail: async () => { sent += 1; return { success: true }; },
    });
    assert.equal(status, "send_failed");
    assert.equal(markedFailed, 1);
    assert.equal(sent, 0);
  });
});