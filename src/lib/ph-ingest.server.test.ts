import { describe, expect, test } from "bun:test";
import {
  DIAGNOSTIC_EVENT_NAMES,
  FUNNEL_EVENT_NAMES,
  UPSTREAM_URL,
  handleIngest,
} from "./ph-ingest.server";

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
  test("forwards only the three validated submitted properties", async () => {
    const { result, calls } = await send(event({
      household_size: "3-4",
      greatest_value: "Sonstige",
      job_title_provided: true,
    }));
    expect(result.outcome).toBe("forwarded");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(UPSTREAM_URL);
    const sent = JSON.parse(String(calls[0]?.init.body));
    expect(sent.batch[0].properties).toMatchObject({
      household_size: "3-4",
      greatest_value: "Sonstige",
      job_title_provided: true,
    });
    expect(JSON.stringify(sent)).not.toContain("job_title\"");
    expect(JSON.stringify(sent)).not.toContain("greatest_value_other");
  });

  test.each([
    { household_size: "sechs" },
    { greatest_value: "mein freier Text" },
    { job_title_provided: "yes" },
    { job_title: "Geschäftsführer" },
    { greatest_value_other: "private Antwort" },
    { unknown_property: "nicht erlaubt" },
  ])("rejects unknown or free-form input: %o", async (properties) => {
    const { result, calls } = await send(event(properties));
    expect(result.outcome).toBe("dropped_invalid");
    expect(calls).toHaveLength(0);
  });

  test("rejects demographics on another funnel event", async () => {
    const { result, calls } = await send(event({ household_size: "2" }, "purchase_interest_started"));
    expect(result.outcome).toBe("dropped_invalid");
    expect(calls).toHaveLength(0);
  });

  test("does not forward without analytics consent", async () => {
    const { result, calls } = await send(event({ household_size: "1" }), false);
    expect(result.outcome).toBe("dropped_no_consent");
    expect(calls).toHaveLength(0);
  });

  test("keeps exactly five funnel steps and separate diagnostics", () => {
    expect(FUNNEL_EVENT_NAMES).toEqual([
      "landing_page_viewed",
      "product_area_viewed",
      "purchase_model_selected",
      "purchase_interest_started",
      "purchase_interest_submitted",
    ]);
    expect(DIAGNOSTIC_EVENT_NAMES).toEqual([
      "page_engagement",
      "purchase_interest_email_confirmed",
    ]);
    expect(FUNNEL_EVENT_NAMES).not.toContain("purchase_interest_email_confirmed" as never);
  });
});