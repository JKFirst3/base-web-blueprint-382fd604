import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { startDoi } from "./preorder-doi.server.ts";
import { tokenFromLocationHash } from "./preorder-doi-token.ts";

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

test("DOI link keeps only the fixed campaign tag and the token stays in the fragment", async () => {
  for (const source of ["configurator", "smoke_google_v1"] as const) {
    let confirmUrl = "";
    await startDoi("row-1", "https://lavidro.com", {}, {
      now: () => 1_800_000_000_000,
      setPending: async () => undefined,
      markSent: async () => undefined,
      markSendFailed: async () => undefined,
      sendMail: async ({ templateData }) => { confirmUrl = String(templateData.confirmUrl); return { success: true }; },
    }, source);
    const url = new URL(confirmUrl);
    assert.equal(url.search, source === "configurator" ? "" : "?lv_campaign=smoke_google_v1");
    assert.match(url.hash, /^#token=[A-Za-z0-9_-]{43}$/);
  }
});
