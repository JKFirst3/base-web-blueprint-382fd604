import { useMemo, useState } from "react";
type Ad = {
  id: string;
  name: string;
  campaignId: string;
  spend: number;
  impressions: number;
  linkClicks: number;
  headline: string;
  primaryText: string;
  cta: string;
  source: string | null;
  variant?: string | null;
  landingUrl: string | null;
  mapping: string;
  product: string | null;
};
type Finding = {
  id: string;
  title: string;
  severity: "high" | "medium" | "info";
  evidence: string;
  recommendation: string;
  adId: string | null;
};
type Snapshot = {
  database: {
    status: string;
    sourceStats: Array<{
      source: string;
      product: string;
      variant: string | null;
      requests: number;
      confirmed: number;
      qualified: number;
    }>;
  };
  meta: { status: string; ads: Ad[]; metrics: null | { currency: string } };
  posthog: {
    status: string;
    breakdown: Array<{
      event: string;
      campaign: string | null;
      product: string | null;
      variant: string | null;
      events: number;
      visitors: number;
      sessions: number;
    }>;
  };
  experiments: {
    status: string;
    experiments: Array<{
      id: number;
      name: string;
      startedAt: string | null;
      endedAt: string | null;
    }>;
  };
  attribution: { coverage: number; reason: string | null };
  audits: Finding[];
  period: { timezone: string; since: string; until: string };
};
export function FunnelMetaAudit({ snapshot }: { snapshot: unknown }) {
  const data = snapshot as Snapshot;
  const [product, setProduct] = useState("all");
  const ads = useMemo(
    () => data.meta.ads.filter((x) => product === "all" || x.product === product),
    [data.meta.ads, product],
  );
  const fmt = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(n);
  const spend = (n: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: data.meta.metrics?.currency || "EUR",
    }).format(n);
  const grouped = useMemo(() => {
    const sums = new Map<string, { requests: number; starts: number; views: number }>();
    for (const r of data.posthog.breakdown) {
      const key =
        (r.product || "ohne Produkt") + " / Variante " + (r.variant?.toUpperCase() || "unbekannt");
      const v = sums.get(key) || { requests: 0, starts: 0, views: 0 };
      if (r.event === "purchase_interest_submitted") v.requests += r.sessions;
      if (r.event === "purchase_interest_started") v.starts += r.sessions;
      if (r.event === "product_area_viewed") v.views += r.sessions;
      sums.set(key, v);
    }
    return [...sums.entries()];
  }, [data.posthog.breakdown]);
  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Meta Ads → Landingpage</h2>
            <p className="mt-1 text-sm text-stone-500">
              Ad-Level-Insights, Copy und Ziel-URLs, unveränderte lv_campaign-Kennungen
            </p>
          </div>
          <label className="text-sm">
            Produkt{" "}
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="ml-2 rounded border border-stone-300 p-2"
            >
              <option value="all">Alle</option>
              <option value="mobile">Mobile</option>
              <option value="cabinet">Cabinet</option>
              <option value="one">One</option>
            </select>
          </label>
        </div>
        <p className="mt-4 rounded-lg bg-stone-100 p-3 text-sm">
          Meta-Status: <strong>{data.meta.status}</strong> · Zuordnungsabdeckung nach Ausgaben:{" "}
          <strong>{fmt(data.attribution.coverage * 100)} %</strong> · {data.period.since} bis{" "}
          {data.period.until} ({data.period.timezone}).
        </p>
        {data.attribution.reason && (
          <p className="mt-2 text-xs text-amber-800">{data.attribution.reason}</p>
        )}
        {!ads.length && (
          <p className="mt-4 text-sm text-stone-500">Keine Anzeigen mit auslesbaren Insights.</p>
        )}
        <div className="mt-5 grid gap-3">
          {ads.map((ad) => (
            <article key={ad.id} className="rounded-xl border border-stone-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{ad.name || ad.id}</h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${ad.mapping === "matched" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}
                >
                  {ad.mapping}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Ad-ID {ad.id} · Campaign-ID {ad.campaignId}
              </p>
              <p className="mt-3 text-sm">
                <strong>{spend(ad.spend)}</strong> · {fmt(ad.impressions)} Impressions ·{" "}
                {fmt(ad.linkClicks)} Klicks
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-stone-50 p-3">
                  <strong className="text-sm">{ad.headline || "Headline nicht auslesbar"}</strong>
                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {ad.primaryText || "Primärtext nicht verfügbar"}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">CTA {ad.cta || "—"}</p>
                </div>
                <div className="rounded-lg bg-stone-50 p-3">
                  <p className="text-xs text-stone-500">Landingpage</p>
                  {ad.landingUrl ? (
                    <a
                      className="mt-2 block break-all text-sm underline"
                      href={ad.landingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ad.landingUrl}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm">Nicht aus Meta auslesbar</p>
                  )}
                  <p className="mt-3 text-xs">lv_campaign: {ad.source || "—"}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">CRO Audit-Backlog</h2>
        <p className="mt-1 text-sm text-stone-500">
          Regelbasierte Befunde mit Evidenz; keine automatischen Änderungen an Anzeigen oder
          Budgets.
        </p>
        <div className="mt-4 space-y-3">
          {data.audits.map((x) => (
            <article className="rounded-xl border border-stone-200 p-4" key={x.id}>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-1 text-xs ${x.severity === "high" ? "bg-rose-100 text-rose-800" : x.severity === "medium" ? "bg-amber-100 text-amber-800" : "bg-stone-100"}`}
                >
                  {x.severity}
                </span>
                <strong className="text-sm">{x.title}</strong>
              </div>
              <p className="mt-2 text-sm">{x.evidence}</p>
              <p className="mt-2 text-sm text-stone-500">Maßnahme: {x.recommendation}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Consent-basierte Produktsessions</h2>
        <p className="mt-1 text-sm text-stone-500">
          Sessions pro Event; keine exakten Funnel-Transitions, da Session-Überschneidungen
          unbekannt.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-500">
                <th>Produkt</th>
                <th>Ansicht</th>
                <th>Interesse</th>
                <th>Anfrage</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([name, v]) => (
                <tr key={name} className="border-t border-stone-200">
                  <td className="py-2">{name}</td>
                  <td>{fmt(v.views)}</td>
                  <td>{fmt(v.starts)}</td>
                  <td>{fmt(v.requests)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">A/B/C → qualifizierte Produktanfragen</h2>
        <p className="mt-1 text-sm text-stone-500">
          Supabase-Anfragekohorten nach tatsächlicher lv_variant. Historische Werte bleiben
          unbekannt; die Zuordnung über Meta-Ad-Creatives ist nicht automatisch randomisiert.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2">Produkt / Variante</th>
                <th>Anfragen</th>
                <th>DOI</th>
                <th>Qualifiziert</th>
              </tr>
            </thead>
            <tbody>
              {data.database.sourceStats
                .filter((x) => product === "all" || x.product === product)
                .map((row, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="py-2">
                      {row.product} / {row.variant?.toUpperCase() || "unbekannt"}{" "}
                      <span className="block text-xs text-stone-400">{row.source}</span>
                    </td>
                    <td>{fmt(row.requests)}</td>
                    <td>{fmt(row.confirmed)}</td>
                    <td>{fmt(row.qualified)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">PostHog Experiments</h2>
        <p className="mt-1 text-sm text-stone-500">
          Read-only-Übersicht, keine automatischen Aktivierungen.
        </p>
        {data.experiments.experiments.length ? (
          <div className="mt-4 space-y-2">
            {data.experiments.experiments.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap justify-between gap-2 border-t border-stone-100 py-2 text-sm"
              >
                <span>{e.name}</span>
                <span className="text-stone-500">
                  {e.startedAt ? "Gestartet " + e.startedAt.slice(0, 10) : "Entwurf"} ·{" "}
                  {e.endedAt ? "Beendet" : "Offen"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-500">
            Keine Experimente oder keine API-Daten ({data.experiments.status}).
          </p>
        )}
      </section>
    </div>
  );
}
