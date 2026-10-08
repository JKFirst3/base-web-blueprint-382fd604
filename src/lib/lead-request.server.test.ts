import assert from "node:assert/strict";
import { test } from "node:test";
import { allowedLeadOrigin, isLeadRateLimited } from "./lead-request.server.ts";

test("lead origin is required, exact and same-origin", () => {
  assert.equal(allowedLeadOrigin(null, "https://lavidro.com/api/public/leads"), false);
  assert.equal(allowedLeadOrigin("https://evil.example", "https://lavidro.com/api/public/leads"), false);
  assert.equal(allowedLeadOrigin("https://lavidro.com.attacker.test", "https://lavidro.com/api/public/leads"), false);
  assert.equal(allowedLeadOrigin("https://lavidro.com", "https://lavidro.com/api/public/leads"), true);
});

test("lead limiter trusts only platform-provided ip and resets", () => {
  assert.equal(isLeadRateLimited(null, 100), false);
  for (let i = 0; i < 5; i++) assert.equal(isLeadRateLimited("203.0.113.24", 100), false);
  assert.equal(isLeadRateLimited("203.0.113.24", 100), true);
  assert.equal(isLeadRateLimited("203.0.113.24", 60_101), false);
});
