import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { allowedOrigin, isRateLimited } from "../../../lib/preorder-confirm.security.ts";

describe("preorder confirmation request checks", () => {
  test("accepts the exact request origin", () => {
    assert.equal(
      allowedOrigin(
        "https://preview.example",
        "https://preview.example/api/public/preorder-confirm",
      ),
      true,
    );
  });

  test("rejects another Lovable origin", () => {
    assert.equal(
      allowedOrigin(
        "https://foreign-project.lovable.app",
        "https://base-web-blueprint.lovable.app/api/public/preorder-confirm",
      ),
      false,
    );
  });

  test("rejects a missing origin", () => {
    assert.equal(allowedOrigin(null, "https://lavidro.com/api/public/preorder-confirm"), false);
  });

  test("does not share a rate-limit bucket when Cloudflare IP is absent", () => {
    for (let index = 0; index < 20; index += 1) {
      assert.equal(isRateLimited(null, 1_800_000_000_000), false);
    }
  });

  test("limits a supplied Cloudflare IP after ten attempts", () => {
    const ip = `198.51.100.${Math.floor(Math.random() * 100) + 1}`;
    for (let index = 0; index < 10; index += 1) {
      assert.equal(isRateLimited(ip, 1_800_000_000_000), false);
    }
    assert.equal(isRateLimited(ip, 1_800_000_000_000), true);
  });
});
