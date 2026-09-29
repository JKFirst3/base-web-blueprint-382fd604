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
    const { result, calls } = await send(event({
      household_size: "3-4",
      greatest_value: "Sonstige",
      job_title_provided: true,
      occupation_group: "Gesundheit/Pflege/Soziales",
    }));
    assert.equal(result.outcome, "forwarded");
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.url, UPSTREAM_URL);
    const sent = JSON.parse(String(calls[0]?.init.body));
    assert.deepEqual(
      {
        household_size: sent.batch[0].properties.household_size,
        greatest_value: sent.batch[0].properties.greatest_value,
        job_title_provided: sent.batch[0].properties.job_title_provided,
        occupation_group: sent.batch[0].properties.occupation_group,
      },
      {
      household_size: "3-4",
      greatest_value: "Sonstige",
      job_title_provided: true,
      occupation_group: "Gesundheit/Pflege/Soziales",
      },
    );
    assert.equal(JSON.stringify(sent).includes("job_title\""), false);
    assert.equal(JSON.stringify(sent).includes("greatest_value_other"), false);
  });

  const invalidCases: Array<Record<string, unknown>> = [
    { household_size: "sechs" },
    { greatest_value: "mein freier Text" },
    { job_title_provided: "yes" },
    { job_title: "Geschäftsführer" },
    { occupation_group: "Geschäftsführung bei Firma X" },
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
    const { result, calls } = await send(event({ household_size: "2" }, "purchase_interest_started"));
    assert.equal(result.outcome, "dropped_invalid");
    assert.equal(calls.length, 0);
  });

  test("does not forward without analytics consent", async () => {
    const { result, calls } = await send(event({ household_size: "1" }), false);
    assert.equal(result.outcome, "dropped_no_consent");
    assert.equal(calls.length, 0);
  });

  test("keeps exactly five funnel steps and separate diagnostics", () => {
    assert.deepEqual(FUNNEL_EVENT_NAMES, [
      "landing_page_viewed",
      "product_area_viewed",
      "purchase_model_selected",
      "purchase_interest_started",
      "purchase_interest_submitted",
    ]);
    assert.deepEqual(DIAGNOSTIC_EVENT_NAMES, [
      "page_engagement",
      "purchase_interest_email_confirmed",
    ]);
    assert.equal(FUNNEL_EVENT_NAMES.includes("purchase_interest_email_confirmed" as never), false);
  });
});