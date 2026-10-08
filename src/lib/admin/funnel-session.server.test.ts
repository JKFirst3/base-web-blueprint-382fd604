import assert from "node:assert/strict";
import { test } from "node:test";
import { adminSessionValid, issueFunnelSession, funnelSessionCookie, checkFunnelPassword, exactAdminOrigin } from "./funnel-session.server.ts";

test("admin session uses a server-side password and an expiring signed HttpOnly cookie", async () => {
  const oldPassword = process.env.FUNNEL_ADMIN_PASSWORD;
  const oldSecret = process.env.FUNNEL_ADMIN_SESSION_SECRET;
  process.env.FUNNEL_ADMIN_PASSWORD = "integration-test-only-secret";
  process.env.FUNNEL_ADMIN_SESSION_SECRET = "this-is-a-test-session-key-longer-than-32-characters";
  try {
    assert.equal(await checkFunnelPassword("wrong"), false);
    assert.equal(await checkFunnelPassword("integration-test-only-secret"), true);
    const now = 1_800_000_000_000;
    const token = await issueFunnelSession(now);
    const req = new Request("https://lavidro.com/api/admin/funnel", { headers: { cookie: `lavidro_funnel_admin=${token}` } });
    assert.equal(await adminSessionValid(req, now), true);
    assert.equal(await adminSessionValid(req, now + 8 * 60 * 60 * 1000), false);
    assert.equal(await adminSessionValid(new Request(req.url, { headers: { cookie: `lavidro_funnel_admin=${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}` } }), now), false);
    const cookie = funnelSessionCookie(req, token);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
    assert.match(cookie, /SameSite=Strict/);
    assert.equal(exactAdminOrigin(new Request(req.url, { method: "POST", headers: { origin: "https://attacker.test" } })), false);
  } finally {
    if (oldPassword === undefined) delete process.env.FUNNEL_ADMIN_PASSWORD;
    else process.env.FUNNEL_ADMIN_PASSWORD = oldPassword;
    if (oldSecret === undefined) delete process.env.FUNNEL_ADMIN_SESSION_SECRET;
    else process.env.FUNNEL_ADMIN_SESSION_SECRET = oldSecret;
  }
});
