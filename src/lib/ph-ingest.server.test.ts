import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  DIAGNOSTIC_EVENT_NAMES,
  FUNNEL_EVENT_NAMES,
  UPSTREAM_URL,
  handleIngest,
} from "./ph-ingest.server.ts";

const TOKEN = "phc_testtoken1234567890";
const CONSENT_TS = 1_800_000_000_000;
const ORIGIN = "http://localhost:8080";
const cookie = encodeURIComponent(JSON.stringify({ v: 1, analytics: true, ts: CONSENT_TS }));

function event(properties: Record<string, unknown> = {}, name = "purchase_interest_submitted") {
  return {
    event: name,
    distinct_id: "visitor-1",
    properties: {
      token: TOKEN,
      consent_ts: CONSENT_TS,
      distinct_id: "visitor-1",
      $process_person_profile: false,
      ...properties,
    },
  };
}

async function send(payload: unknown, withConsent = true) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const request = new Request(`${ORIGIN}/api/public/ph-ingest/e`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: ORIGIN,
      "sec-fetch-site": "same-origin",
      ...(withConsent ? { cookie: `lavidro_consent=${cookie}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const result = await handleIngest(request, "e", {
    token: TOKEN,
    now: () => CONSENT_TS,
    fetchUpstream: async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ status: 1 }), { status: 200 });
    },
  });
  return { result, calls };
}

describe("PostHog consent gate demographics", () => {
  test("forwards only the validated submitted categories", async () => {
    const { result, calls } = await send(
      event({
        household_size: "3-4",
        greatest_value: "Sonstige",
        job_title_provided: true,
      }),
    );
    assert.equal(result.outcome, "forwarded");
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.url, UPSTREAM_URL);
    const sent = JSON.parse(String(calls[0]?.init.body));
    assert.deepEqual(
      {
        household_size: sent.batch[0].properties.household_size,
        greatest_value: sent.batch[0].properties.greatest_value,
        job_title_provided: sent.batch[0].properties.job_title_provided,
      },
      {
        household_size: "3-4",
        greatest_value: "Sonstige",
        job_title_provided: true,
      },
    );
    assert.equal(JSON.stringify(sent).includes('job_title"'), false);
    assert.equal(JSON.stringify(sent).includes("greatest_value_other"), false);
  });

  const invalidCases: Array<Record<string, unknown>> = [
    { household_size: "sechs" },
    { greatest_value: "mein freier Text" },
    { job_title_provided: "yes" },
    { job_title: "Geschäftsführer" },
    { occupation_group: "Geschäftsführung bei Firma X" },
    { occupation_group: "Bildung/Forschung" },
    { greatest_value_other: "private Antwort" },
    { unknown_property: "nicht erlaubt" },
  ];
  for (const [index, properties] of invalidCases.entries()) {
    test(`rejects unknown or free-form input ${index + 1}`, async () => {
      const { result, calls } = await send(event(properties));
      assert.equal(result.outcome, "dropped_invalid");
      assert.equal(calls.length, 0);
    });
  }

  test("rejects demographics on another funnel event", async () => {
    const { result, calls } = await send(
      event({ household_size: "2" }, "purchase_interest_started"),
    );
    assert.equal(result.outcome, "dropped_invalid");
    assert.equal(calls.length, 0);
  });

  test("does not forward without analytics consent", async () => {
    const { result, calls } = await send(event({ household_size: "1" }), false);
    assert.equal(result.outcome, "dropped_no_consent");
    assert.equal(calls.length, 0);
  });

  test("keeps supported journey events and DOI separate", () => {
    assert.deepEqual(FUNNEL_EVENT_NAMES, [
      "website_visited",
      "landing_page_viewed",
      "product_area_viewed",
      "purchase_model_selected",
      "purchase_interest_started",
      "purchase_interest_submitted",
      "product_comparison_opened",
      "product_comparison_product_selected",
    ]);
    assert.deepEqual(DIAGNOSTIC_EVENT_NAMES, [
      "page_engagement",
      "purchase_interest_email_confirmed",
    ]);
    assert.equal(FUNNEL_EVENT_NAMES.includes("purchase_interest_email_confirmed" as never), false);
  });
});
for (const [name, consent, stamp, outcome] of [
  [
    "explicit rejection",
    { v: 1, analytics: false, ts: CONSENT_TS },
    CONSENT_TS,
    "dropped_no_consent",
  ],
  [
    "withdrawn and renewed consent",
    { v: 1, analytics: true, ts: CONSENT_TS + 1 },
    CONSENT_TS,
    "dropped_stale_consent",
  ],
] as const) {
  test(`does not forward campaign after ${name}`, async () => {
    let upstream = 0;
    const result = await handleIngest(
      new Request(`${ORIGIN}/api/public/ph-ingest/e`, {
        method: "POST",
        headers: {
          origin: ORIGIN,
          cookie: `lavidro_consent=${encodeURIComponent(JSON.stringify(consent))}`,
        },
        body: JSON.stringify(event({ campaign_id: "smoke_google_one_v1", consent_ts: stamp })),
      }),
      "e",
      {
        token: TOKEN,
        fetchUpstream: async () => {
          upstream++;
          return new Response();
        },
      },
    );
    assert.equal(result.outcome, outcome);
    assert.equal(upstream, 0);
  });
}

test("SDK retries retain all PostHog deduplication fields", async () => {
  const payload = {
    ...event({ $insert_id: "sdk-insert-id" }),
    uuid: "12345678-1234-4123-8123-123456789abc",
    timestamp: new Date(CONSENT_TS).toISOString(),
  };
  const first = await send(payload);
  const retry = await send(payload);
  const a = JSON.parse(String(first.calls[0].init.body)).batch[0];
  const b = JSON.parse(String(retry.calls[0].init.body)).batch[0];
  assert.equal(a.uuid, payload.uuid);
  assert.equal(a.timestamp, payload.timestamp);
  for (const key of ["uuid", "event", "timestamp", "distinct_id"]) assert.equal(a[key], b[key]);
  assert.deepEqual(first.calls[0].init.headers, { "content-type": "application/json" });
});

describe("campaign attribution", () => {
  test("forwards the fixed campaign on all funnel and diagnostic events", async () => {
    for (const name of [...FUNNEL_EVENT_NAMES, ...DIAGNOSTIC_EVENT_NAMES]) {
      const payload = event(
        {
          campaign_id: "smoke_google_v1",
          ...(name === "product_comparison_opened" ? { product_id: "mobile" } : {}),
          ...(name === "product_comparison_product_selected" ? { product_id: "one", source_product_id: "mobile" } : {}),
          ...(name === "page_engagement" ? { page_path: "/", visible_seconds: 10 } : {}),
        },
        name,
      );
      const { result, calls } = await send(payload);
      assert.equal(result.outcome, "forwarded", name);
      assert.equal(
        JSON.parse(String(calls[0].init.body)).batch[0].properties.campaign_id,
        "smoke_google_v1",
      );
      assert.equal((await send(payload, false)).calls.length, 0);
    }
  });
  test("rejects arbitrary campaign text rather than forwarding it", async () => {
    for (const campaign_id of ["private@example.invalid", "other_campaign", null, 123]) {
      const { result, calls } = await send(event({ campaign_id }));
      assert.equal(result.outcome, "dropped_invalid");
      assert.equal(calls.length, 0);
    }
  });
});

test("all three product campaigns pass the consent gate", async () => {
  for (const campaign_id of [
    "smoke_google_mobile_v1",
    "smoke_google_cabinet_v1",
    "smoke_google_one_v1",
  ]) {
    const { result, calls } = await send(event({ campaign_id }));
    assert.equal(result.outcome, "forwarded");
    assert.equal(
      JSON.parse(String(calls[0].init.body)).batch[0].properties.campaign_id,
      campaign_id,
    );
  }
});

 test("comparison events preserve validated source and target only with consent", async () => {
   const props = { product_id: "one", source_product_id: "mobile" };
   const accepted = await send(event(props, "product_comparison_product_selected"));
   assert.equal(accepted.result.outcome, "forwarded");
   const sent = JSON.parse(String(accepted.calls[0].init.body)).batch[0].properties;
   assert.equal(sent.product_id, "one");
   assert.equal(sent.source_product_id, "mobile");
   assert.equal((await send(event(props, "product_comparison_product_selected"), false)).calls.length, 0);
   for (const invalid of [{ ...props, source_product_id: "private text" }, { product_id: "one" }, { product_id: "one", source_product_id: "one" }]) {
     assert.equal((await send(event(invalid, "product_comparison_product_selected"))).result.outcome, "dropped_invalid");
   }
   assert.equal((await send(event({ product_id: "mobile" }, "product_comparison_opened"))).result.outcome, "forwarded");
   assert.equal((await send(event(props, "product_comparison_opened"))).result.outcome, "dropped_invalid");
 });

test("A/B/C variants need a valid product and explicit analytics consent", async () => {
  for (const variant_id of ["a", "b", "c"]) {
    const { result, calls } = await send(event({ product_id: "one", variant_id }, "purchase_interest_started"));
    assert.equal(result.outcome, "forwarded");
    const batch = JSON.parse(String(calls[0].init.body));
    assert.equal(batch.batch[0].properties.variant_id, variant_id);
  }
  for (const properties of [
    { product_id: "one", variant_id: "d" },
    { variant_id: "a" },
    { product_id: "nonexistent", variant_id: "b" },
  ]) {
    const { result, calls } = await send(event(properties, "purchase_interest_started"));
    assert.equal(result.outcome, "dropped_invalid");
    assert.equal(calls.length, 0);
  }
  const { result, calls } = await send(event({ product_id: "mobile", variant_id: "a" }), false);
  assert.equal(result.outcome, "dropped_no_consent");
  assert.equal(calls.length, 0);
});
