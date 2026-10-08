import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Activity, ArrowLeft, Database, ExternalLink, LockKeyhole, Megaphone, RefreshCw, ShieldCheck, Workflow } from "lucide-react";

type SourceStatus = "ok" | "unconfigured" | "error";
type FunnelData = {
  generatedAt: string; days: number;
  meta: { status: SourceStatus; metrics: null | { spend: number; impressions: number; linkClicks: number; currency: string } };
  posthog: { status: SourceStatus; events: Record<string, number> };
  database: { status: "ok" | "error"; leads: number | null; interviews: number | null; preorders: number | null; doiConfirmed: number | null; qualified: number | null;
    bySource: Array<{ source: string; count: number }>;
    recent: Array<{ id: string; date: string; product: string; source: string; doi: string; qualified: boolean }> };
  cpql: null; cpqlReason: string; notes: string[];
};
type Tab = "funnel" | "sources" | "leads" | "agent";
const SOURCE_NAMES: Record<SourceStatus, string> = { ok: "Verbunden", unconfigured: "Nicht konfiguriert", error: "Fehler" };
const date = (value: string) => new Date(value).toLocaleDateString("de-DE");
const number = (n: number | null | undefined) => typeof n === "number" ? n.toLocaleString("de-DE") : "—";
const money = (n: number | undefined, currency = "EUR") => n === undefined ? "—" : new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(n);
const ERROR_COPY: Record<string, string> = { not_configured: "Admin-Zugang noch nicht auf dem Server konfiguriert.", invalid_credentials: "Passwort nicht korrekt.", rate_limited: "Zu viele Anmeldeversuche. Bitte später erneut versuchen.", forbidden: "Anmeldung von dieser Herkunft verweigert." };

export const Route = createFileRoute("/admin/funnel")({
  ssr: false,
  head: () => ({ meta: [ { title: "Funnel Admin — Lavidro" }, { name: "robots", content: "noindex,nofollow,noarchive" }, { name: "referrer", content: "no-referrer" } ] }),
  component: FunnelAdmin,
});

function StatusPill({ status }: { status: SourceStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status === "ok" ? "bg-emerald-100 text-emerald-800" : status === "error" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{SOURCE_NAMES[status]}</span>;
}
function Card({ title, value, foot }: { title: string; value: string; foot: string }) {
  return <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="text-sm text-stone-500">{title}</div><div className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">{value}</div><div className="mt-2 text-xs leading-relaxed text-stone-500">{foot}</div></div>;
}
function FunnelAdmin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [data, setData] = useState<FunnelData | null>(null);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [tab, setTab] = useState<Tab>("funnel");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const fetchSnapshot = useCallback(async () => {
    const res = await fetch(`/api/admin/funnel?days=${days}`, { cache: "no-store", credentials: "same-origin" });
    if (res.status === 401) { setAuthenticated(false); setData(null); return; }
    if (!res.ok) throw new Error("Die Admin-Daten konnten nicht geladen werden.");
    setAuthenticated(true);
    setData(await res.json() as FunnelData);
  }, [days]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/funnel-session", { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) throw new Error("Zugang derzeit nicht erreichbar.");
        const session = await res.json() as { authenticated: boolean; configured: boolean };
        if (!active) return;
        setConfigured(session.configured);
        setAuthenticated(session.authenticated);
        if (session.authenticated) await fetchSnapshot();
      } catch { if (active) { setAuthenticated(false); setError("Admin-Server nicht erreichbar."); } }
    })();
    return () => { active = false; };
  }, []); // Authentication bootstrap only; period refresh handled separately.
  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    setBusy(true);
    fetchSnapshot().catch(() => { if (!cancelled) setError("Datenabruf fehlgeschlagen."); }).finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [days, refresh, authenticated, fetchSnapshot]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/funnel-session", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ password }) });
      const body = await res.json() as { error?: string };
      if (!res.ok) throw new Error(ERROR_COPY[body.error ?? ""] || "Anmeldung fehlgeschlagen.");
      setPassword(""); setAuthenticated(true); setRefresh(n => n + 1);
    } catch (e) { setError(e instanceof Error ? e.message : "Anmeldung fehlgeschlagen."); }
    finally { setBusy(false); }
  }
  async function logout() {
    await fetch("/api/admin/funnel-session", { method: "DELETE", credentials: "same-origin" });
    setAuthenticated(false); setData(null); setPassword("");
  }
  async function qualify(id: string, qualified: boolean) {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/funnel-qualification", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, qualified }) });
      if (!res.ok) throw new Error("Qualifizierung konnte nicht gespeichert werden.");
      setRefresh(n => n + 1);
    } catch (e) { setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); }
    finally { setBusy(false); }
  }
  if (authenticated === null) return <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-500">Prüfe Admin-Zugang …</div>;
  if (!authenticated) return <main className="flex min-h-screen items-center justify-center bg-[#f3f2ee] px-4 py-16 text-stone-900">
    <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
      <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-stone-900 text-white"><LockKeyhole size={24}/></div>
      <p className="text-xs font-semibold tracking-[0.3em] text-stone-400">LAVIDRO / ADMIN</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Funnel Intelligence</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">Geschützter Bereich zur Analyse von Marketing, Produktinteresse und Leadqualität.</p>
      <form onSubmit={signIn} className="mt-8 space-y-4">
        <label className="block text-sm font-medium" htmlFor="funnel-password">Admin-Passwort</label>
        <input id="funnel-password" autoComplete="current-password" type="password" required minLength={1} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-500"/>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {!configured && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Der Admin-Zugang ist noch nicht auf dem Server eingerichtet. Bitte die beiden Server-Variablen konfigurieren.</p>}
        <button disabled={busy || !configured} className="w-full rounded-xl bg-stone-900 px-4 py-3 font-medium text-white disabled:opacity-50">{busy ? "Prüfe …" : "Anmelden"}</button>
      </form><a href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900"><ArrowLeft size={15}/> Zur Website</a>
    </div>
  </main>;

  const items: Array<{ id: Tab; label: string }> = [{ id: "funnel", label: "Übersicht" }, { id: "sources", label: "Datenquellen" }, { id: "leads", label: "Leadqualität" }, { id: "agent", label: "Agent-Audits" }];
  const m = data?.meta.metrics;
  const p = data?.posthog.events ?? {};
  const d = data?.database;
  const rows = [
    { label: "Meta Impressions", value: m?.impressions, source: "Meta Ads Insights" },
    { label: "Link-Klicks", value: m?.linkClicks, source: "Meta Ads Insights" },
    { label: "Landingpage besucht", value: p.landing_page_viewed, source: "PostHog mit Einwilligung" },
    { label: "Produktbereich angesehen", value: p.product_area_viewed, source: "PostHog mit Einwilligung" },
    { label: "Produktanfrage gestartet", value: p.purchase_interest_started, source: "PostHog mit Einwilligung" },
    { label: "Produktanfrage gemessen", value: p.purchase_interest_submitted, source: "PostHog mit Einwilligung" },
    { label: "Produktanfrage gespeichert", value: d?.preorders ?? undefined, source: "Supabase" },
    { label: "Double Opt-in bestätigt", value: d?.doiConfirmed ?? undefined, source: "Supabase" },
    { label: "Qualifiziert", value: d?.qualified ?? undefined, source: "Manuelle Qualifizierung (Zeitraum: Abschluss)" },
  ];
  return <main className="min-h-screen bg-[#f3f2ee] text-stone-900">
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 pb-6">
        <div><a href="/" className="text-xs font-semibold tracking-[0.3em] text-stone-500 hover:text-stone-900">LAVIDRO / GROWTH</a><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Funnel Intelligence</h1><p className="mt-1 text-sm text-stone-500">Meta → Website → Produktinteresse → qualifizierter Lead</p></div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => setRefresh(x => x + 1)} className="rounded-xl border border-stone-300 bg-white p-2.5 hover:bg-stone-50" aria-label="Daten neu laden"><RefreshCw size={19}/></button><button onClick={logout} className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm">Abmelden</button></div>
      </header>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1" aria-label="Funnel Admin"><>{items.map(item => <button key={item.id} onClick={() => setTab(item.id)} aria-current={tab === item.id ? "page" : undefined} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${tab === item.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-white"}`}>{item.label}</button>)}</></nav>
        <label className="text-sm text-stone-600">Zeitraum: <select className="ml-2 rounded-lg border border-stone-300 bg-white px-3 py-2" value={days} onChange={e => setDays(Number(e.target.value) as 7 | 30 | 90)}><option value="7">7 Tage</option><option value="30">30 Tage</option><option value="90">90 Tage</option></select></label>
      </div>
      {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
      {!data ? <div className="mt-10 text-sm text-stone-600">Lade Daten …</div> : <>
        {tab === "funnel" && <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card title="Meta-Ausgaben" value={money(m?.spend, m?.currency)} foot={data.meta.status === "ok" ? "Meta Ads, Account-Ebene" : "Meta noch nicht verfügbar"} />
            <Card title="Produktanfragen" value={number(d?.preorders)} foot="Supabase: gespeicherte unverbindliche Anfragen" />
            <Card title="Qualifizierungen" value={number(d?.qualified)} foot="Im Zeitraum als qualifiziert markiert" />
            <Card title="Cost per Qualified Lead" value="—" foot={data.cpqlReason} />
          </div>
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl font-semibold">Funnel-Stufen</h2><p className="mt-1 text-sm text-stone-500">Reale Zähler, keine synthetischen Conversion-Raten</p></div><span className="text-xs text-stone-400">Zuletzt: {new Date(data.generatedAt).toLocaleString("de-DE")}</span></div>
            <div className="space-y-3">{rows.map((row, idx) => <div key={row.label} className="grid grid-cols-[1.2fr_80px] items-center gap-3 sm:grid-cols-[210px_1fr_110px]"><div><div className="text-sm font-medium">{row.label}</div><div className="text-xs text-stone-400">{row.source}</div></div><div className="hidden h-4 rounded-full bg-stone-100 sm:block"><div className={`h-4 rounded-full ${idx === rows.length - 1 ? "bg-emerald-700" : "bg-stone-700"}`} style={{ width: `${row.value === undefined ? 0 : Math.max(2, (row.value / Math.max(...rows.map(x => x.value ?? 0), 1)) * 100)}%` }} /></div><div className="text-right text-lg font-semibold tabular-nums">{number(row.value)}</div></div>)}</div>
            <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Die Stufen stammen aus verschiedenen Messsystemen. PostHog zählt nur mit Consent; Meta und Supabase haben andere Grundgesamtheiten. Übergangsquoten und CPQL werden erst nach einer belastbaren Zuordnung angezeigt.</p>
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Bestehende Kampagnenkennungen</h2><p className="mt-1 text-sm text-stone-500">Unverändert aus dem bestehenden System</p><div className="mt-4 space-y-2">{d?.bySource.map(s => <div key={s.source} className="flex justify-between border-b border-stone-100 py-2 text-sm"><code className="break-all text-xs">{s.source}</code><strong>{number(s.count)}</strong></div>)}</div></section>
        </div>}
        {tab === "sources" && <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-stone-200 bg-white p-6"><Megaphone className="mb-4" size={26}/><h2 className="text-lg font-semibold">Meta Ads</h2><div className="mt-3"><StatusPill status={data.meta.status}/></div><p className="mt-3 text-sm text-stone-500">Account-Insights für Spend, Impressions und Link-Klicks. Nur lesender Zugriff.</p><p className="mt-3 text-xs text-stone-500">Server: META_ACCESS_TOKEN + META_AD_ACCOUNT_ID</p></section>
          <section className="rounded-2xl border border-stone-200 bg-white p-6"><Activity className="mb-4" size={26}/><h2 className="text-lg font-semibold">PostHog EU</h2><div className="mt-3"><StatusPill status={data.posthog.status}/></div><p className="mt-3 text-sm text-stone-500">Aggregierte Ereignisse aus bestehender consent-gesteuerter Trackingstrecke.</p><p className="mt-3 text-xs text-stone-500">Server: POSTHOG_PERSONAL_API_KEY + POSTHOG_PROJECT_ID</p></section>
          <section className="rounded-2xl border border-stone-200 bg-white p-6"><Database className="mb-4" size={26}/><h2 className="text-lg font-semibold">Supabase</h2><div className="mt-3"><StatusPill status={data.database.status}/></div><p className="mt-3 text-sm text-stone-500">Anfragen, DOI und admin-only Qualifizierung – ohne PII im Aggregat-Export.</p><p className="mt-3 text-xs text-stone-500">Server: bestehender Service-Role-Zugang; Admin-Migrationen ausführen</p></section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 lg:col-span-3"><ShieldCheck size={22}/><h3 className="mt-2 font-semibold">Datenschutz & Datenabgleich</h3><div className="mt-3 space-y-2 text-sm text-stone-700">{data.notes.map(x => <p key={x}>{x}</p>)}</div></section>
        </div>}
        {tab === "leads" && <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Produktanfragen qualifizieren</h2><p className="mt-2 text-sm text-stone-500">Nur IDs und fachliche Statuswerte; keine Namen oder E-Mail-Adressen. Die Qualifizierung ist eine manuelle Bewertung, keine automatische KI-Schätzung.</p><p className="mt-3 text-sm">Kontakt- und Newsletter-Leads: <strong>{number(d?.leads)}</strong> · Davon Interview: <strong>{number(d?.interviews)}</strong></p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-stone-50 text-xs text-stone-500"><tr><th className="px-3 py-3">Datum</th><th className="px-3 py-3">Produkt</th><th className="px-3 py-3">Quelle</th><th className="px-3 py-3">DOI</th><th className="px-3 py-3">Qualifiziert</th></tr></thead><tbody>{d?.recent.map(r => <tr key={r.id} className="border-t border-stone-100"><td className="px-3 py-3">{date(r.date)}</td><td className="px-3 py-3">{r.product}</td><td className="px-3 py-3 text-xs">{r.source}</td><td className="px-3 py-3">{r.doi}</td><td className="px-3 py-3"><button type="button" disabled={busy} onClick={() => qualify(r.id, !r.qualified)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${r.qualified ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{r.qualified ? "Ja ✓" : "Nein · markieren"}</button></td></tr>)}</tbody></table>{!d?.recent.length && <p className="p-4 text-sm text-stone-500">Keine Produktanfragen für diesen Zeitraum.</p>}</div></section>}
        {tab === "agent" && <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Agentic Audit – Integrationsgerüst</h2><p className="mt-2 text-sm text-stone-500">Die automatisierte Prüfung ist noch nicht aktiv. Der bestehende admin-geschützte MCP-Zugang stellt die aggregierten Daten für einen externen Coding-/CRO-Agenten bereit.</p><div className="mt-5 space-y-4">{[
          { t: "Mobile Browser-Journey", d: "Playwright: Meta-Landingpage → Produkt → Formular → DOI. Testumgebung ohne echte E-Mail." },
          { t: "Technischer QA-Audit", d: "Lighthouse, Accessibility und Regressionen; Screenshots mit klaren Fundstellen." },
          { t: "Kundenorientierte CRO-Hypothesen", d: "Ad-Copy / Landingpage-Aussage, Vertrauen, Reibung und Einwandbehandlung vergleichen." },
          { t: "Freigabe & Wirkungskontrolle", d: "Experiment als Pull Request vorschlagen, Freigabe abwarten und echte PostHog-Ergebnisse messen." },
        ].map((item, i) => <div className="flex gap-3 rounded-xl border border-stone-100 p-4" key={item.t}><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-sm font-semibold">{i + 1}</span><div><h3 className="font-semibold">{item.t}</h3><p className="mt-1 text-sm text-stone-500">{item.d}</p></div></div>)}</div><p className="mt-5 text-sm text-amber-800">Keine automatischen Änderungen an Ads, Budget oder Produktivcode ohne explizite Freigabe.</p></section>}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500"><span><Workflow size={15} className="mr-1 inline"/> LAVIDRO · Read-only-Konnektoren · Qualifizierung manuell</span><a className="inline-flex items-center gap-1 underline" href="https://github.com/JKFirst3/base-web-blueprint-382fd604" rel="noreferrer" target="_blank">Quellcode <ExternalLink size={13}/></a></footer>
      </>}
    </div>
  </main>;
}
