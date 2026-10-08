// Isolated contract test: real installed SDK and gate, simulated upstream. No .env or production events.
// Supply PLAYWRIGHT_MODULE/CHROME_BIN when using a shared browser-test runtime.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { handleIngest } from "../src/lib/ph-ingest.server.ts";
const require = createRequire(new URL("../package.json", import.meta.url));
const { build } = require("esbuild");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    contents: `import { captureFunnel, initAnalytics } from './src/lib/analytics.ts'; import { writeConsent } from './src/lib/consent.ts'; import { propagateCampaignToSiteLinks } from './src/lib/campaign.ts'; import posthog from 'posthog-js'; window.tracking = {captureFunnel, writeConsent, posthog}; initAnalytics(); propagateCampaignToSiteLinks();`,
    resolveDir: root,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
});
const forwarded = [],
  outcomes = [];
let failures = 0;
const server = createServer(async (req, res) => {
  const origin = `http://127.0.0.1:${server.address().port}`;
  if (req.url === "/bundle.js") {
    res.setHeader("content-type", "text/javascript");
    res.end(bundle.outputFiles[0].text);
    return;
  }
  if (req.url === "/api/public/posthog-config") {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ token: "phc_testtoken1234567890", host: "/api/public/ph-ingest" }));
    return;
  }
  if (req.url.startsWith("/api/public/ph-ingest/e")) {
    let body = "";
    for await (const chunk of req) body += chunk;
    if (failures-- > 0) {
      res.writeHead(502);
      res.end("{}");
      return;
    }
    const result = await handleIngest(
      new Request(origin + req.url, { method: "POST", headers: req.headers, body }),
      "e",
      {
        token: "phc_testtoken1234567890",
        fetchUpstream: async (_url, init) => {
          forwarded.push(...JSON.parse(init.body).batch);
          return Response.json({ status: 1 });
        },
      },
    );
    outcomes.push(result.outcome);
    res.writeHead(result.response.status, Object.fromEntries(result.response.headers));
    res.end(await result.response.text());
    return;
  }
  res.setHeader("content-type", "text/html");
  res.end(
    `<html><body><a id="product" href="/Konfigurator?product=cabinet#details">Product</a><a id="hash" href="#details">Hash</a><a id="absolute" href="${origin}/kontakt">Contact</a><a id="doi" href="/anfrage-bestaetigen">DOI</a><script src="/bundle.js"></script></body></html>`,
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({
    ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
    headless: true,
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  });
  await context.addInitScript(() =>
    Object.defineProperty(navigator, "webdriver", { get: () => false }),
  );
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));

  await page.goto(origin + "/Konfigurator?product=mobile&lv_campaign=smoke_google_mobile_v1");
  await page.evaluate(async () => {
    await window.tracking.captureFunnel("website_visited");
  });
  assert.equal(forwarded.length, 0);
  await page.evaluate(async () => {
    window.tracking.writeConsent(true);
    await window.tracking.captureFunnel("website_visited");
  });
  await page.waitForFunction(() => sessionStorage.getItem("lv_ph_fired_v2"), null, {
    timeout: 5000,
  });
  assert.ok(forwarded.some((e) => e.event === "website_visited"));
  assert.ok(
    forwarded.some(
      (e) => e.event === "product_area_viewed" && e.properties.product_id === "mobile",
    ),
  );
  const visits = () => forwarded.filter((e) => e.event === "website_visited").length;
  const before = visits();
  await page.evaluate(async () => {
    await Promise.all([
      window.tracking.captureFunnel("website_visited"),
      window.tracking.captureFunnel("website_visited"),
    ]);
  });
  assert.equal(visits(), before);
  await page.evaluate(async () => {
    await window.tracking.captureFunnel("product_area_viewed", { product_id: "cabinet" });
    await window.tracking.captureFunnel("product_area_viewed", { product_id: "cabinet" });
  });
  assert.equal(
    forwarded.filter(
      (e) => e.event === "product_area_viewed" && e.properties.product_id === "cabinet",
    ).length,
    1,
  );
  await page.reload();
  await page.evaluate(async () => {
    await window.tracking.captureFunnel("website_visited");
  });
  assert.equal(visits(), before);
  await page.clock.install();
  await page.clock.setSystemTime(new Date(Date.now() + 31 * 60 * 1000));
  await page.evaluate(async () => {
    await window.tracking.captureFunnel("website_visited");
  });
  assert.equal(visits(), before + 1);
  failures = 1;
  await page.evaluate(async () => {
    await window.tracking.captureFunnel("purchase_interest_submitted", {}, "sdk-contract-test");
  });
  const submitted = forwarded.filter((e) => e.event === "purchase_interest_submitted");
  assert.equal(submitted.length, 1);
  assert.ok(submitted[0].uuid);
  assert.equal(submitted[0].properties.campaign_id, "smoke_google_mobile_v1");
  assert.equal(submitted[0].properties.$process_person_profile, false);
  assert.ok(submitted[0].properties.$session_id);
  await page.locator("#hash").click();
  await page.waitForURL(
    "**/Konfigurator?product=mobile&lv_campaign=smoke_google_mobile_v1#details",
  );
  await page.locator("#product").click();
  await page.waitForURL(
    "**/Konfigurator?product=cabinet&lv_campaign=smoke_google_mobile_v1#details",
  );
  await page.locator("#absolute").click();
  await page.waitForURL("**/kontakt?lv_campaign=smoke_google_mobile_v1");
  await page.locator("#doi").click();
  await page.waitForURL("**/anfrage-bestaetigen?lv_campaign=smoke_google_mobile_v1");
  const beforeReject = forwarded.length;
  await page.evaluate(async () => {
    window.tracking.writeConsent(false);
    await window.tracking.captureFunnel("purchase_interest_started");
  });
  assert.equal(forwarded.length, beforeReject);
  assert.ok(!outcomes.includes("dropped_invalid"));
  console.log(
    "PASS: real installed PostHog SDK → real consent gate (stub upstream); consent, reload dedupe, 31-minute session expiry, per-product counts, transient retry, SDK UUID/session fields, campaign on relative/absolute/hash/DOI links, withdrawal. No production events sent.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
