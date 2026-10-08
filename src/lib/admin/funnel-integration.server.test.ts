import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateCpql, creativeInfo, type CreativeAudit } from "./funnel-attribution.server.ts";
import { generateAudits } from "./funnel-audit.server.ts";
import {
  readMetaInsights,
  readPostHogEvents,
  reportingPeriod,
} from "./funnel-connectors.server.ts";

function withEnv<T>(vars: Record<string, string>, task: () => Promise<T>): Promise<T> {
  const prior = Object.fromEntries(Object.keys(vars).map((x) => [x, process.env[x]]));
  for (const [k, v] of Object.entries(vars)) process.env[k] = v;
  return task().finally(() => {
    for (const [k, v] of Object.entries(prior)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
}
const ad = (over: Partial<CreativeAudit> = {}): CreativeAudit => ({
  id: "101",
  name: "Mobile Test",
  adsetId: "20",
  campaignId: "30",
  spend: 50,
  impressions: 900,
  linkClicks: 33,
  headline: "Textilpflege",
  primaryText: "Schonend und bequem",
  cta: "LEARN_MORE",
  imageUrl: null,
  landingUrl: "https://lavidro.com/Konfigurator?lv_campaign=smoke_google_mobile_v1",
  mapping: "matched",
  source: "smoke_google_mobile_v1",
  product: "mobile",
  ...over,
});
test("campaign attribution handles Meta url_tags without inventing new source classes", () => {
  const result = creativeInfo({
    url_tags: "lv_campaign=smoke_google_mobile_v1",
    object_story_spec: {
      link_data: { link: "https://lavidro.com/Konfigurator", name: "Mobile", message: "Copy" },
    },
  });
  assert.equal(result.source, "smoke_google_mobile_v1");
  assert.equal(result.mapping, "matched");
  assert.equal(result.product, "mobile");
  const variantInfo = creativeInfo({
    url_tags: "lv_campaign=smoke_google_one_v1&lv_variant=c",
    object_story_spec: {
      link_data: { link: "https://lavidro.com/Konfigurator?product=one&fbclid=private" },
    },
  });
  assert.equal(variantInfo.variant, "c");
  assert.equal(variantInfo.product, "one");
  assert.equal(
    variantInfo.landingUrl,
    "https://lavidro.com/Konfigurator?product=one&lv_campaign=smoke_google_one_v1&lv_variant=c",
  );
  assert.equal(variantInfo.landingUrl?.includes("fbclid"), false);
  assert.match(result.landingUrl ?? "", /lv_campaign=smoke_google_mobile_v1/);
  const ambiguous = creativeInfo({
    url_tags: "lv_campaign=smoke_google_mobile_v1",
    object_story_spec: {
      link_data: { link: "https://lavidro.com/Konfigurator?lv_campaign=smoke_google_one_v1" },
    },
  });
  assert.equal(ambiguous.mapping, "ambiguous");
  assert.equal(
    creativeInfo({
      object_story_spec: {
        link_data: { link: "https://evil.test/?lv_campaign=smoke_google_mobile_v1" },
      },
    }).mapping,
    "other_domain",
  );
});
test("CPQL fails closed on unknown spend and computes only complete joined cohort", () => {
  const stats = [
    {
      source: "smoke_google_mobile_v1",
      product: "mobile",
      requests: 10,
      confirmed: 7,
      qualified: 2,
    },
  ];
  assert.equal(calculateCpql([ad()], stats, "EUR", true).value, 25);
  assert.equal(
    calculateCpql(
      [ad(), ad({ id: "999", spend: 20, source: null, mapping: "missing" })],
      stats,
      "EUR",
      true,
    ).value,
    null,
  );
  assert.equal(calculateCpql([ad()], stats, "USD", true).value, null);
  assert.equal(calculateCpql([ad()], stats, "EUR", false).value, null);
});
test("deterministic audit identifies missing source with attributable spend", () => {
  const issues = generateAudits(
    [ad({ source: null, mapping: "missing" })],
    { status: "unconfigured", breakdown: [] },
    true,
  );
  assert.ok(issues.some((x) => x.severity === "high" && x.id === "missing-attribution"));
});
test("Meta fetches currency and zone, ad Insights and creative by ID with read-only Bearer requests", async () => {
  await withEnv(
    {
      META_ACCESS_TOKEN: "mock-access-token",
      META_AD_ACCOUNT_ID: "123456789",
      META_GRAPH_API_VERSION: "v26.0",
    },
    async () => {
      const paths: string[] = [];
      const fetcher = async (
        input: RequestInfo | URL,
        options?: RequestInit,
      ): Promise<Response> => {
        const u = new URL(String(input));
        paths.push(u.pathname);
        assert.equal(
          options?.headers && (options.headers as Record<string, string>).Authorization,
          "Bearer mock-access-token",
        );
        assert.equal(u.hostname, "graph.facebook.com");
        if (u.pathname.endsWith("act_123456789"))
          return Response.json({ currency: "EUR", timezone_name: "Europe/Berlin" });
        if (u.pathname.endsWith("/insights"))
          return Response.json({
            data: [
              {
                ad_id: "101",
                ad_name: "Ad mobile",
                adset_id: "20",
                campaign_id: "30",
                spend: "50.00",
                impressions: "900",
                inline_link_clicks: "33",
              },
            ],
          });
        if (u.pathname.endsWith("/ads"))
          return Response.json({
            data: [
              {
                id: "101",
                creative: {
                  object_story_spec: {
                    link_data: {
                      link: "https://lavidro.com/Konfigurator?lv_campaign=smoke_google_mobile_v1",
                      message: "Copy",
                      name: "Mobile",
                    },
                  },
                },
              },
            ],
          });
        return Response.json({ error: "unexpected" }, { status: 500 });
      };
      const result = await readMetaInsights(7, fetcher as typeof fetch);
      assert.equal(result.status, "ok");
      assert.equal(result.metrics?.currency, "EUR");
      assert.equal(result.metrics?.timezone, "Europe/Berlin");
      assert.equal(result.ads[0].source, "smoke_google_mobile_v1");
      assert.equal(result.ads[0].spend, 50);
      assert.equal(paths.length, 3);
    },
  );
});
test("Meta fails closed for paginated results that could be silently truncated", async () => {
  await withEnv({ META_ACCESS_TOKEN: "mock", META_AD_ACCOUNT_ID: "123456789" }, async () => {
    const mock = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      if (url.includes("fields=id%2Ccurrency"))
        return Response.json({ currency: "EUR", timezone_name: "Europe/Amsterdam" });
      if (url.includes("/insights"))
        return Response.json({ data: [], paging: { next: "https://untrusted.invalid/ads" } });
      return Response.json({ data: [] });
    };
    const out = await readMetaInsights(30, mock as typeof fetch);
    assert.equal(out.status, "error");
    assert.equal(out.metrics, null);
  });
});
test("PostHog reports event, visitor and session counts independently, with UTC bounds", async () => {
  await withEnv({ POSTHOG_PERSONAL_API_KEY: "mock-phx", POSTHOG_PROJECT_ID: "12345" }, async () => {
    let q = "";
    const mock = async (_url: RequestInfo | URL, opts?: RequestInit): Promise<Response> => {
      q = JSON.parse(String(opts?.body)).query.query;
      return Response.json({
        results: [
          ["landing_page_viewed", "smoke_google_mobile_v1", "mobile", "a", 100, 65, 70],
          ["purchase_interest_submitted", "smoke_google_mobile_v1", "mobile", "b", 12, 9, 10],
        ],
      });
    };
    const out = await readPostHogEvents(
      7,
      mock as typeof fetch,
      reportingPeriod(7, "Europe/Berlin", new Date("2026-10-08T12:00:00Z")),
    );
    assert.equal(out.status, "ok");
    assert.equal(out.events.landing_page_viewed, 100);
    assert.equal(out.breakdown[0].visitors, 65);
    assert.equal(out.breakdown[0].sessions, 70);
    assert.equal(out.breakdown[0].variant, "a");
    assert.match(q, /site_environment/);
    assert.match(q, /parseDateTimeBestEffort/);
  });
});
test("calendar period handles daylight-saving transitions without UTC midnight shortcuts", () => {
  const october = reportingPeriod(7, "Europe/Berlin", new Date("2026-10-27T12:00:00Z"));
  assert.equal(october.since, "2026-10-21");
  assert.equal(october.until, "2026-10-27");
  assert.equal(october.from, "2026-10-20T22:00:00.000Z");
  assert.equal(october.to, "2026-10-27T23:00:00.000Z");
});
