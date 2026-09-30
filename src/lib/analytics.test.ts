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
      location: { origin: "http://localhost", hostname: "localhost", pathname: "/other" },
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
    const props = { occupation_group: "Bildung/Forschung" as const, job_title_provided: true };
    await captureFunnel("purchase_interest_submitted", props, "no-consent");
    await captureEmailConfirmed();
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
    assert.equal(captured[0].properties.occupation_group, "Bildung/Forschung");
    assert.equal("job_title" in captured[0].properties, false);
    assert.equal("email" in captured[0].properties, false);
    await captureFunnel("purchase_interest_submitted", {}, "second-submission");
    assert.equal(captured.length, 2);
    await captureEmailConfirmed();
    assert.equal(captured[2].event, "purchase_interest_email_confirmed");
    allowed = false;
    consentTs++;
    listeners.get("lavidro:consent-changed")?.();
    await captureFunnel("purchase_interest_submitted", props, "after-withdrawal");
    assert.equal(captured.length, 3);
    assert.equal(beforeSend!({ event: "purchase_interest_submitted", properties: props }), null);
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    mock.restoreAll();
  }
});
