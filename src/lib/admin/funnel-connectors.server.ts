// Server-only, aggregate-only marketing connector layer. No PII or credentials leave this API.
export const POSTHOG_EVENTS = [
  "website_visited", "landing_page_viewed", "product_area_viewed",
  "purchase_interest_started", "purchase_interest_submitted",
  "purchase_interest_email_confirmed",
] as const;
export type DataStatus = "ok" | "unconfigured" | "error";

export async function readPostHogEvents(days: number, fetcher: typeof fetch = fetch) {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!apiKey || !projectId) return { status: "unconfigured" as DataStatus, events: {} as Record<string, number> };
  if (!/^\d+$/.test(projectId)) return { status: "error" as DataStatus, events: {} as Record<string, number> };
  const query = `SELECT event, count() FROM events WHERE timestamp >= now() - INTERVAL ${days} DAY AND properties.site_environment = 'production' AND event IN (${POSTHOG_EVENTS.map(x => `'${x}'`).join(",")}) GROUP BY event LIMIT 50`;
  try {
    const res = await fetcher(`https://eu.posthog.com/api/projects/${projectId}/query/`, {
      method: "POST", signal: AbortSignal.timeout(9000),
      headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query }, name: "Lavidro Funnel Admin counts" }),
    });
    if (!res.ok) throw new Error("PostHog status " + res.status);
    const data = await res.json() as { results?: unknown };
    if (!Array.isArray(data.results)) throw new Error("Missing PostHog results");
    const events: Record<string, number> = {};
    for (const row of data.results) {
      if (!Array.isArray(row) || !POSTHOG_EVENTS.includes(row[0] as typeof POSTHOG_EVENTS[number])) continue;
      const n = Number(row[1]);
      if (Number.isFinite(n) && n >= 0) events[String(row[0])] = n;
    }
    return { status: "ok" as DataStatus, events };
  } catch {
    return { status: "error" as DataStatus, events: {} as Record<string, number> };
  }
}

export async function readMetaInsights(days: number, fetcher: typeof fetch = fetch) {
  const token = process.env.META_ACCESS_TOKEN;
  const account = process.env.META_AD_ACCOUNT_ID?.replace(/^act_/, "") ?? "";
  if (!token || !account) return { status: "unconfigured" as DataStatus, metrics: null };
  const version = process.env.META_GRAPH_API_VERSION || "v26.0";
  if (!/^\d{4,20}$/.test(account) || !/^v\d+\.\d+$/.test(version)) return { status: "error" as DataStatus, metrics: null };
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const dateString = (d: Date) => d.toISOString().slice(0, 10);
  const u = new URL(`https://graph.facebook.com/${version}/act_${account}/insights`);
  u.searchParams.set("fields", "spend,impressions,inline_link_clicks");
  u.searchParams.set("level", "account");
  u.searchParams.set("time_range", JSON.stringify({ since: dateString(start), until: dateString(end) }));
  try {
    const res = await fetcher(u.toString(), { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(9000) });
    if (!res.ok) throw new Error("Meta status " + res.status);
    const response = await res.json() as { data?: Record<string, unknown>[] };
    const data = response.data?.[0];
    const numeric = (x: unknown) => {
      const n = Number(x ?? 0);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    };
    return { status: "ok" as DataStatus, metrics: {
      spend: numeric(data?.spend), impressions: numeric(data?.impressions), linkClicks: numeric(data?.inline_link_clicks), currency: process.env.META_AD_ACCOUNT_CURRENCY || "EUR",
    } };
  } catch {
    return { status: "error" as DataStatus, metrics: null };
  }
}
