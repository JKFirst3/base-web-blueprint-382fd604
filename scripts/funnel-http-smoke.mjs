// Live HTTP smoke against a development server. No real data, credentials or email.
import assert from "node:assert/strict";

async function locate() {
  for (let n = 0; n < 75; n++) {
    for (const port of [5173, 8080, 3000]) {
      const origin = `http://127.0.0.1:${port}`;
      try {
        const response = await fetch(origin + "/api/admin/funnel-session", { signal: AbortSignal.timeout(700) });
        if (response.ok) return origin;
      } catch { /* server still starting */ }
    }
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  throw new Error("Funnel development server did not start");
}
const origin = await locate();
const get = (path, headers = {}) => fetch(origin + path, { headers, redirect: "manual" });
const post = (path, body, headers = {}) => fetch(origin + path, { method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body), redirect: "manual" });

const loginPage = await get("/admin/funnel");
assert.equal(loginPage.status, 200, "admin HTML route");
const home = await get("/");
assert.equal(home.status, 200, "site home route");
assert.match(await home.text(), /\/admin\/funnel/, "footer links to funnel admin");

const state = await get("/api/admin/funnel-session");
assert.equal(state.status, 200);
const initial = await state.json();
assert.equal(initial.configured, true);
assert.equal(initial.authenticated, false);
assert.equal((await get("/api/admin/funnel")).status, 401, "anonymous access must fail");
assert.equal((await post("/api/admin/funnel-session", { password: "ci-test-password" }, { origin: "https://hostile.invalid" })).status, 403);
assert.equal((await post("/api/admin/funnel-session", { password: "bad-secret" })).status, 401);

const loggedIn = await post("/api/admin/funnel-session", { password: process.env.FUNNEL_ADMIN_PASSWORD });
assert.equal(loggedIn.status, 200, "server-side password must succeed");
const cookie = loggedIn.headers.get("set-cookie");
assert.ok(cookie?.includes("HttpOnly"), "session should be HttpOnly");
assert.ok(cookie?.includes("SameSite=Strict"), "session should be Strict");
const cookiePair = cookie.split(";")[0];
assert.equal((await get("/api/admin/funnel", { cookie: cookiePair })).status, 200, "signed cookie should authorize");
const metrics = await (await get("/api/admin/funnel", { cookie: cookiePair })).json();
assert.ok(metrics.meta && metrics.posthog && metrics.database);
assert.equal(metrics.cpql, null, "cross-source CPQL must not be fabricated");
assert.equal((await post("/api/admin/funnel-qualification", { id: "invalid", qualified: true }, { cookie: cookiePair, origin: "https://hostile.invalid" })).status, 403);
assert.equal((await post("/api/admin/funnel-qualification", { id: "invalid", qualified: true })).status, 401);
const logout = await fetch(origin + "/api/admin/funnel-session", { method: "DELETE", headers: { origin, cookie: cookiePair } });
assert.equal(logout.status, 200);
assert.ok(logout.headers.get("set-cookie")?.includes("Max-Age=0"));
console.log("PASS HTTP funnel smoke:", origin, "footer, anonymous 401, origin 403, login, signed session, empty connectors, CSRF, logout");
