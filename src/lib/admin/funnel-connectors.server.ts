import { creativeInfo, type CreativeAudit } from "./funnel-attribution.server.ts";

export const POSTHOG_EVENTS = [
  "website_visited",
  "landing_page_viewed",
  "product_area_viewed",
  "purchase_model_selected",
  "purchase_interest_started",
  "purchase_interest_submitted",
  "purchase_interest_email_confirmed",
  "product_comparison_opened",
  "product_comparison_product_selected",
  "page_engagement",
] as const;
export type DataStatus = "ok" | "unconfigured" | "error";
export type Period = {
  days: number;
  from: string;
  to: string;
  since: string;
  until: string;
  timezone: string;
};
export type PostHogStage = {
  event: string;
  campaign: string | null;
  product: string | null;
  events: number;
  visitors: number;
  sessions: number;
};
export type MetaData = {
  status: DataStatus;
  metrics: null | {
    spend: number;
    impressions: number;
    linkClicks: number;
    currency: string;
    timezone: string;
  };
  ads: CreativeAudit[];
  period: Period | null;
  errorCode?: string;
};
const timeout = () => AbortSignal.timeout(9000);
const num = (x: unknown) => {
  const n = Number(x ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
const raw = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const safe = (v: unknown, max = 100) => (typeof v === "string" ? v.slice(0, max) : "");
function zonedDate(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const obj = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return `${obj.year}-${obj.month}-${obj.day}`;
}
function zonedMidnight(day: string, timeZone: string) {
  // Iteratively resolve UTC offset, robust across CET/CEST changes.
  const base = Date.parse(day + "T00:00:00.000Z");
  let guess = base;
  for (let n = 0; n < 4; n++) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date(guess));
    const obj = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    const represented = Date.UTC(
      +obj.year,
      +obj.month - 1,
      +obj.day,
      +obj.hour,
      +obj.minute,
      +obj.second,
    );
    guess += base - represented;
  }
  return new Date(guess).toISOString();
}
export function reportingPeriod(
  days: number,
  timezone = "Europe/Amsterdam",
  now = new Date(),
): Period {
  // Exact calendar days, including today, in the Meta ad-account timezone.
  const today = zonedDate(now, timezone);
  const since = new Date(Date.parse(today + "T00:00:00.000Z") - (days - 1) * 86400000)
    .toISOString()
    .slice(0, 10);
  const tomorrow = new Date(Date.parse(today + "T00:00:00.000Z") + 86400000)
    .toISOString()
    .slice(0, 10);
  return {
    days,
    timezone,
    since,
    until: today,
    from: zonedMidnight(since, timezone),
    to: zonedMidnight(tomorrow, timezone),
  };
}
function endpoint(apiVersion: string, account: string, part: string) {
  return `https://graph.facebook.com/${apiVersion}/act_${account}/${part}`;
}
async function metaJson(
  url: string,
  token: string,
  fetcher: typeof fetch,
): Promise<Record<string, unknown>> {
  const u = new URL(url);
  if (u.protocol !== "https:" || u.hostname !== "graph.facebook.com")
    throw Error("untrusted Meta pagination URL");
  const res = await fetcher(u.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    signal: timeout(),
  });
  if (!res.ok) throw Error("meta " + res.status);
  return raw(await res.json());
}
async function metaPages(url: string, token: string, fetcher: typeof fetch, limit = 15) {
  const all: Record<string, unknown>[] = [];
  const visited = new Set<string>();
  for (let page = 0; page < limit; page++) {
    if (visited.has(url)) throw Error("Meta pagination loop");
    visited.add(url);
    const json = await metaJson(url, token, fetcher);
    if (!Array.isArray(json.data)) throw Error("Meta malformed page");
    all.push(...json.data.map(raw));
    if (all.length > 1500) throw Error("Meta result too large");
    const next = safe(raw(json.paging).next, 2000);
    if (!next) return all;
    url = next;
  }
  throw Error("Meta pagination incomplete");
}
export async function readMetaInsights(
  days: number,
  fetcher: typeof fetch = fetch,
): Promise<MetaData> {
  const token = process.env.META_ACCESS_TOKEN;
  const account = process.env.META_AD_ACCOUNT_ID?.replace(/^act_/, "") ?? "";
  const none: MetaData = { status: "unconfigured", metrics: null, ads: [], period: null };
  if (!token || !account) return none;
  const version = process.env.META_GRAPH_API_VERSION || "v26.0";
  if (!/^\d{4,20}$/.test(account) || !/^v\d+\.\d+$/.test(version))
    return { ...none, status: "error", errorCode: "configuration" };
  try {
    const config = await metaJson(
      `https://graph.facebook.com/${version}/act_${account}?fields=id,currency,timezone_name`,
      token,
      fetcher,
    );
    const currency = safe(config.currency, 10),
      timezone = safe(config.timezone_name, 100);
    if (!/^[A-Z]{3}$/.test(currency) || !timezone)
      throw Error("Meta missing account currency/timezone");
    const period = reportingPeriod(days, timezone);
    const insightsUrl = new URL(endpoint(version, account, "insights"));
    insightsUrl.searchParams.set(
      "fields",
      "ad_id,ad_name,adset_id,campaign_id,spend,impressions,inline_link_clicks",
    );
    insightsUrl.searchParams.set("level", "ad");
    insightsUrl.searchParams.set("limit", "200");
    insightsUrl.searchParams.set(
      "time_range",
      JSON.stringify({ since: period.since, until: period.until }),
    );
    const insights = await metaPages(insightsUrl.toString(), token, fetcher);
    const adsUrl = new URL(endpoint(version, account, "ads"));
    adsUrl.searchParams.set(
      "fields",
      "id,name,adset_id,campaign_id,creative{id,name,body,title,call_to_action_type,image_url,url_tags,object_story_spec,asset_feed_spec}",
    );
    adsUrl.searchParams.set("limit", "200");
    const adDetails = await metaPages(adsUrl.toString(), token, fetcher);
    const details = new Map(adDetails.map((x) => [safe(x.id, 80), x]));
    const ads: CreativeAudit[] = insights.map((x) => {
      const id = safe(x.ad_id, 80),
        ad = details.get(id);
      const creative = creativeInfo(raw(ad?.creative));
      return {
        id,
        name: safe(x.ad_name || ad?.name, 150),
        adsetId: safe(x.adset_id || ad?.adset_id, 80),
        campaignId: safe(x.campaign_id || ad?.campaign_id, 80),
        spend: num(x.spend),
        impressions: num(x.impressions),
        linkClicks: num(x.inline_link_clicks),
        ...creative,
        mapping: ad ? creative.mapping : "not_found",
      };
    });
    return {
      status: "ok",
      metrics: {
        spend: ads.reduce((a, x) => a + x.spend, 0),
        impressions: ads.reduce((a, x) => a + x.impressions, 0),
        linkClicks: ads.reduce((a, x) => a + x.linkClicks, 0),
        currency,
        timezone,
      },
      ads,
      period,
    };
  } catch {
    return { ...none, status: "error", errorCode: "api" };
  }
}
export async function readPostHogEvents(
  days: number,
  fetcher: typeof fetch = fetch,
  period = reportingPeriod(days),
) {
  const key = process.env.POSTHOG_PERSONAL_API_KEY,
    project = process.env.POSTHOG_PROJECT_ID;
  const none = {
    status: "unconfigured" as DataStatus,
    events: {} as Record<string, number>,
    breakdown: [] as PostHogStage[],
    period,
  };
  if (!key || !project) return none;
  if (!/^\d+$/.test(project)) return { ...none, status: "error" as DataStatus };
  // Event cardinality and unique visitors/sessions are *different* measures.
  const names = POSTHOG_EVENTS.map((x) => `'${x}'`).join(",");
  const query = `SELECT event, properties.campaign_id, properties.product_id, count(), count(DISTINCT distinct_id), count(DISTINCT properties['$session_id']) FROM events WHERE timestamp >= parseDateTimeBestEffort('${period.from}') AND timestamp < parseDateTimeBestEffort('${period.to}') AND properties.site_environment = 'production' AND event IN (${names}) GROUP BY event, properties.campaign_id, properties.product_id ORDER BY event LIMIT 250`;
  try {
    const res = await fetcher(`https://eu.posthog.com/api/projects/${project}/query/`, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${key}` },
      signal: timeout(),
      body: JSON.stringify({
        query: { kind: "HogQLQuery", query },
        name: "LAVIDRO funnel stage aggregates",
      }),
    });
    if (!res.ok) throw Error("PostHog " + res.status);
    const json = raw(await res.json());
    if (!Array.isArray(json.results) || json.results.length >= 250)
      throw Error("PostHog missing/truncated results");
    const breakdown: PostHogStage[] = json.results
      .filter(Array.isArray)
      .map((x: unknown) => {
        const row = x as unknown[];
        return {
          event: safe(row[0], 90),
          campaign: safe(row[1], 100) || null,
          product: safe(row[2], 40) || null,
          events: num(row[3]),
          visitors: num(row[4]),
          sessions: num(row[5]),
        };
      })
      .filter((x) => (POSTHOG_EVENTS as readonly string[]).includes(x.event));
    const events: Record<string, number> = {};
    for (const row of breakdown) events[row.event] = (events[row.event] || 0) + row.events;
    return { status: "ok" as DataStatus, events, breakdown, period };
  } catch {
    return { ...none, status: "error" as DataStatus };
  }
}
export async function readPostHogExperiments(fetcher: typeof fetch = fetch) {
  const key = process.env.POSTHOG_PERSONAL_API_KEY,
    project = process.env.POSTHOG_PROJECT_ID;
  const none = {
    status: "unconfigured" as DataStatus,
    experiments: [] as Array<{
      id: number;
      name: string;
      startedAt: string | null;
      endedAt: string | null;
    }>,
  };
  if (!key || !project) return none;
  if (!/^\d+$/.test(project)) return { ...none, status: "error" as DataStatus };
  try {
    const r = await fetcher(
      `https://eu.posthog.com/api/projects/${project}/experiments/?limit=50`,
      { headers: { Authorization: `Bearer ${key}` }, signal: timeout() },
    );
    if (!r.ok) throw Error("Experiment API " + r.status);
    const data = raw(await r.json());
    if (!Array.isArray(data.results)) throw Error("invalid experiments");
    return {
      status: "ok" as DataStatus,
      experiments: data.results
        .map(raw)
        .filter((x) => Number.isInteger(x.id))
        .map((x) => ({
          id: Number(x.id),
          name: safe(x.name, 140),
          startedAt: safe(x.start_date, 40) || null,
          endedAt: safe(x.end_date, 40) || null,
        })),
    };
  } catch {
    return { ...none, status: "error" as DataStatus };
  }
}
