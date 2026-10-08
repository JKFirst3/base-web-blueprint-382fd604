import { validCampaign } from "@/lib/campaign";

export type SourceSummary = { variant?: string | null;
  source: string;
  product: string;
  requests: number;
  confirmed: number;
  qualified: number;
};
export type CreativeAudit = {
  id: string;
  name: string;
  adsetId: string;
  campaignId: string;
  spend: number;
  impressions: number;
  linkClicks: number;
  headline: string;
  primaryText: string;
  cta: string;
  imageUrl: string | null;
  landingUrl: string | null;
  source: string | null;
  product: string | null;
  mapping: "matched" | "missing" | "ambiguous" | "other_domain" | "not_found";
};
export type CpqlResult = {
  value: number | null;
  spend: number;
  qualified: number;
  coveredSpend: number;
  coverage: number;
  reason: string | null;
};

/** Do not trust Meta creative destinations as freely downloadable URLs. Return only LAVIDRO links. */
const HOSTS = new Set(["lavidro.com", "www.lavidro.com", "base-web-blueprint.lovable.app"]);
const PRODUCTS = ["mobile", "cabinet", "one"] as const;
export function productFromSource(source: string): string | null {
  return PRODUCTS.find((x) => source.includes(`_${x}_`)) ?? null;
}
function string(value: unknown, max = 280): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}
function record(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
export function creativeInfo(raw: unknown) {
  const cr = record(raw);
  const spec = record(cr.object_story_spec);
  const link = record(spec.link_data);
  const video = record(spec.video_data);
  const videoCta = record(video.call_to_action);
  const feed = record(cr.asset_feed_spec);
  const links = Array.isArray(feed.link_urls) ? feed.link_urls : [];
  const urls = [
    link.link,
    record(link.call_to_action).value && record(record(link.call_to_action).value).link,
    record(videoCta.value).link,
    ...links.map((x) => record(x).website_url),
    ...links.map((x) => record(x).url),
  ].filter((x): x is string => typeof x === "string" && !!x);
  const parsed = urls.map((x) => {
    try {
      const u = new URL(x);
      return u.protocol === "https:" && HOSTS.has(u.hostname) ? u : null;
    } catch {
      return null;
    }
  });
  // Meta can append final URL parameters through creative.url_tags.
  const tags = string(cr.url_tags, 700);
  const param = new URLSearchParams(tags.startsWith("?") ? tags.slice(1) : tags);
  const tagCampaign = validCampaign(param.get("lv_campaign"));
  const sources = new Set([
    ...parsed
      .filter((x): x is URL => !!x)
      .map((x) => validCampaign(x.searchParams.get("lv_campaign")))
      .filter((x): x is NonNullable<typeof x> => !!x),
    ...(tagCampaign ? [tagCampaign] : []),
  ]);
  const matching = parsed.find((x) => !!x) ?? null;
  const source = sources.size === 1 ? [...sources][0] : null;
  const mapping: CreativeAudit["mapping"] =
    sources.size > 1
      ? "ambiguous"
      : !matching
        ? urls.length
          ? "other_domain"
          : "not_found"
        : source
          ? "matched"
          : "missing";
  const headline = string(
    cr.title || link.name || video.title || record(record(feed.titles).data).text,
    180,
  );
  const primaryText = string(
    cr.body ||
      link.message ||
      video.message ||
      record((Array.isArray(feed.bodies) ? feed.bodies : [])[0]).text,
    600,
  );
  const cta = string(
    cr.call_to_action_type || record(link.call_to_action).type || videoCta.type,
    70,
  );
  // Do not return query parameters besides the audited campaign tag, or arbitrary external images.
  const landingUrl = matching
    ? `${matching.origin}${matching.pathname}${source ? `?lv_campaign=${source}` : ""}`
    : null;
  const imageUrlRaw = string(cr.image_url, 700);
  const imageUrl = /^https:\/\//.test(imageUrlRaw) ? imageUrlRaw : null;
  return {
    source,
    mapping,
    headline,
    primaryText,
    cta,
    landingUrl,
    imageUrl,
    product: source ? productFromSource(source) : null,
  };
}
export function calculateCpql(
  ads: CreativeAudit[],
  sourceStats: SourceSummary[],
  currency: string,
  compatibleWindow: boolean,
): CpqlResult {
  const spend = ads.reduce((sum, ad) => sum + ad.spend, 0);
  const matched = ads.filter((x) => x.mapping === "matched" && x.source);
  const coveredSpend = matched.reduce((sum, x) => sum + x.spend, 0);
  const coverage = spend > 0 ? coveredSpend / spend : 0;
  const sourceSet = new Set(matched.map((x) => x.source));
  const qualified = sourceStats
    .filter((x) => sourceSet.has(x.source))
    .reduce((sum, x) => sum + x.qualified, 0);
  // A rate based on partial ad coverage would be misleading. Preserve the unavailable state.
  const base = { spend, qualified, coveredSpend, coverage, value: null, reason: "" };
  if (!compatibleWindow)
    return { ...base, reason: "Account-Zeitzone und Anfrage-Kohorte nicht vergleichbar." };
  if (currency !== "EUR") return { ...base, reason: "Werbekonto rechnet nicht in EUR ab." };
  if (spend <= 0) return { ...base, reason: "Keine zuordenbaren Werbeausgaben im Zeitraum." };
  if (coverage < 1 - 1e-9)
    return {
      ...base,
      reason: "Nicht sämtliche Meta-Ausgaben haben eine eindeutige lv_campaign-Zuordnung.",
    };
  if (!qualified)
    return { ...base, reason: "Keine qualifizierten Anfragen der zugeordneten Kohorte." };
  return { ...base, value: Math.round((spend / qualified) * 100) / 100, reason: null };
}
