import assert from "node:assert/strict";
import { mock, test } from "node:test";

test("analytics consent, concurrent saved responses, PII filtering and withdrawal", async () => {
  let allowed = false;
  let consentTs = 1;
  let configRequests = 0;
  type Event = { event: string; properties: Record<string, unknown> };
  let beforeSend!: (event: Event) => Event | null;
  const captured: Event[] = [];
  const listeners = new Map<string, () => void>();
  const storage = new Map<string, string>();
  const store = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  };
  const client = {
    init: (_token: string, options: { before_send: typeof beforeSend }) => {
      beforeSend = options.before_send;
    },
    register: () => {},
    has_opted_out_capturing: () => false,
    opt_out_capturing: () => {},
    reset: () => {},
    capture: (event: string, properties: unknown) => {
      const clean = beforeSend({
        event,
        properties: {
          ...(properties as object),
          job_title: "private job",
          email: "private@example.invalid",
        },
      });
      if (clean) captured.push(clean);
    },
  };
  mock.module("./consent.ts", {
    namedExports: {
      analyticsAllowed: () => allowed,
      readConsent: () => ({ ts: consentTs }),
      readCookie: () => null,
      deleteCookie: () => {},
    },
  });
  mock.module("posthog-js", { defaultExport: client });
  const originals = Object.fromEntries(
    ["window", "document", "sessionStorage", "localStorage", "fetch"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  Object.assign(globalThis, {
    window: {
      location: {
        origin: "http://localhost",
        hostname: "localhost",
        pathname: "/other",
        search: "?lv_campaign=smoke_google_v1",
      },
      addEventListener: (name: string, cb: () => void) => listeners.set(name, cb),
      clearInterval: () => {},
    },
    document: { cookie: "", addEventListener: () => {}, getElementById: () => null },
    sessionStorage: store,
    localStorage: store,
    fetch: async () => {
      configRequests++;
      return Response.json({ token: "phc_test", host: "/api/public/ph-ingest" });
    },
  });
  try {
    const { captureFunnel, captureEmailConfirmed, initAnalytics } = await import("./analytics.ts");
    initAnalytics();
    const props = { job_title_provided: true };
    await captureFunnel("purchase_interest_submitted", props, "no-consent");
    await captureEmailConfirmed();
    await captureFunnel("website_visited");
    await captureFunnel("product_comparison_opened", { product_id: "mobile" });
    await captureFunnel("product_comparison_product_selected", { product_id: "one", source_product_id: "mobile" });
    assert.equal(configRequests, 0);
    assert.equal(captured.length, 0);
    allowed = true;
    await Promise.all(
      Array.from({ length: 5 }, () =>
        captureFunnel("purchase_interest_submitted", props, "same-submission"),
      ),
    );
    await captureFunnel("purchase_interest_submitted", props, "same-submission");
    assert.equal(captured.length, 1);
    assert.equal(captured[0].properties.campaign_id, "smoke_google_v1");
    assert.equal("occupation_group" in captured[0].properties, false);
    assert.equal("job_title" in captured[0].properties, false);
    assert.equal("email" in captured[0].properties, false);
    await captureFunnel("purchase_interest_submitted", {}, "second-submission");
    assert.equal(captured.length, 2);
    await captureEmailConfirmed();
    assert.equal(captured[2].event, "purchase_interest_email_confirmed");
    assert.equal(captured[2].properties.campaign_id, "smoke_google_v1");
    window.location.search = "?lv_campaign=unapproved";
    await captureFunnel("purchase_interest_submitted", {}, "direct-submission");
    assert.equal("campaign_id" in captured[3].properties, false);
    // Arrival on any route is consent-gated and counted once per visit/campaign.
    await Promise.all([captureFunnel("website_visited"), captureFunnel("website_visited")]);
    await captureFunnel("website_visited");
    assert.equal(captured.filter(({ event }) => event === "website_visited").length, 1);
    await captureFunnel("product_comparison_opened", { product_id: "mobile", source_product_id: "one" });
    await captureFunnel("product_comparison_product_selected", { product_id: "one", source_product_id: "mobile" });
    assert.equal("source_product_id" in captured[5].properties, false);
    assert.equal(captured[6].properties.source_product_id, "mobile");
    assert.equal(captured[6].properties.product_id, "one");
    assert.equal("job_title" in captured[6].properties, false);
    allowed = false;
    consentTs++;
    listeners.get("lavidro:consent-changed")?.();
    await captureFunnel("purchase_interest_submitted", props, "after-withdrawal");
    assert.equal(captured.length, 7);
    assert.equal(beforeSend!({ event: "purchase_interest_submitted", properties: props }), null);
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    mock.restoreAll();
  }
});
