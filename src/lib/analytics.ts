// Consent-gated PostHog funnel tracking (5 manual events only). No PII.
// PostHog JS is loaded dynamically only after explicit analytics consent.
import type { PostHog } from "posthog-js";
import { analyticsAllowed, deleteCookie, readCookie } from "./consent";

const INGEST_HOSTS = new Set(["https://eu.i.posthog.com", "https://us.i.posthog.com"]);

/** Same-origin public config fetch (no auth middleware). Logs only non-sensitive diagnostics. */
async function fetchPosthogConfig(): Promise<{ token: string; host: string } | null> {
  try {
    const res = await fetch("/api/public/posthog-config", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[analytics] config request failed (HTTP ${res.status})`);
      return null;
    }
    const data = (await res.json()) as { token?: unknown; host?: unknown; reason?: unknown };
    const token = typeof data.token === "string" && data.token.startsWith("phc_") ? data.token : null;
    const host = typeof data.host === "string" && INGEST_HOSTS.has(data.host) ? data.host : null;
    if (!token || !host) {
      console.warn(`[analytics] config unavailable (${typeof data.reason === "string" ? data.reason : "invalid_config"})`);
      return null;
    }
    return { token, host };
  } catch (e) {
    console.warn(`[analytics] config request error (${e instanceof Error ? e.name : "unknown"})`);
    return null;
  }
}

export type FunnelEvent =
  | "landing_page_viewed"
  | "product_area_viewed"
  | "purchase_model_selected"
  | "purchase_interest_started"
  | "purchase_interest_submitted";

export type BusinessModel = "purchase" | "subscription";
type Props = {
  product_id?: string;
  business_model?: BusinessModel;
  entry_type?: "scroll" | "direct";
};

const ALLOWED_PROPS = ["product_id", "business_model", "entry_type"] as const;
// Explicit allow-list of outgoing properties. Everything else is dropped.
const KEEP_PROPS = new Set<string>([
  ...ALLOWED_PROPS,
  "site_environment",
  "site_host",
  "token", // project routing (required by ingestion)
  "distinct_id", // pseudonymous visitor ID for the funnel
  "$session_id", // groups a visit (session-based funnels)
  "$window_id", // paired with $session_id by the SDK
  "$device_id", // stable anonymous device ID for the same visitor
  "$insert_id", // server-side dedupe of retried sends
  "$time", // client event time
  "$lib", // SDK identification (ingestion handling)
  "$lib_version",
  "$current_url", // query/fragment stripped below
  "$geoip_disable", // forced true below
  "$process_person_profile", // forced false below
  // page_engagement diagnostics only (whitelisted path, numeric seconds)
  "page_path",
  "visible_seconds",
]);
const FUNNEL_EVENTS = new Set<FunnelEvent>([
  "landing_page_viewed",
  "product_area_viewed",
  "purchase_model_selected",
  "purchase_interest_started",
  "purchase_interest_submitted",
]);
// Diagnostic (not part of the 5-step funnel): visible time per page and per session.
const ENGAGEMENT_EVENT = "page_engagement";
const OUTGOING_EVENTS = new Set<string>([...FUNNEL_EVENTS, ENGAGEMENT_EVENT]);
const ONCE_PER_VISIT: FunnelEvent[] = ["landing_page_viewed", "product_area_viewed"];
const FIRED_KEY = "lv_ph_fired";

let ph: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
let listening = false;
const firedInMemory = new Set<FunnelEvent>();
const inFlight = new Set<FunnelEvent>();
// Once-events that failed to send AFTER consent; retried on the next successful load.
const retry = new Map<FunnelEvent, Props>();
// Incremented on every consent withdrawal; aborts loads started under an older consent.
let consentEpoch = 0;

export function toBusinessModel(paymentType: string | null | undefined): BusinessModel | undefined {
  if (paymentType === "upfront" || paymentType === "cash" || paymentType === "purchase") return "purchase";
  if (paymentType === "monthly" || paymentType === "subscription") return "subscription";
  return undefined;
}

function siteEnvironment(host: string): "preview" | "production" {
  const prod = ["lavidro.com", "www.lavidro.com", "base-web-blueprint.lovable.app"];
  return prod.includes(host) ? "production" : "preview";
}

function stripQuery(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    const u = new URL(value);
    return `${u.origin}${u.pathname}`;
  } catch {
    return value.split(/[?#]/)[0];
  }
}

function wasFired(event: FunnelEvent) {
  if (firedInMemory.has(event)) return true;
  try {
    return (JSON.parse(sessionStorage.getItem(FIRED_KEY) || "[]") as string[]).includes(event);
  } catch {
    return false;
  }
}

function markFired(event: FunnelEvent) {
  firedInMemory.add(event);
  try {
    const list = JSON.parse(sessionStorage.getItem(FIRED_KEY) || "[]") as string[];
    if (!list.includes(event)) sessionStorage.setItem(FIRED_KEY, JSON.stringify([...list, event]));
  } catch {
    /* ignore */
  }
}

async function load(): Promise<PostHog | null> {
  if (ph) return ph;
  if (loading) return loading;
  const epoch = consentEpoch;
  const stillAllowed = () => epoch === consentEpoch && analyticsAllowed();
  loading = (async () => {
    const cfg = await fetchPosthogConfig();
    if (!cfg || !stillAllowed()) return null;
    let posthog: PostHog;
    try {
      posthog = (await import("posthog-js")).default;
    } catch {
      return null;
    }
    // Re-check right before init: consent may have been withdrawn while waiting.
    if (!stillAllowed()) return null;
    const host = window.location.hostname;
    posthog.init(cfg.token, {
      api_host: cfg.host,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_dead_clicks: false,
      capture_exceptions: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
      person_profiles: "identified_only",
      mask_personal_data_properties: true,
      // Also mask the campaign tag in URLs PostHog keeps in its local persistence.
      custom_personal_data_properties: ["lv_campaign"],
      disable_capture_url_hashes: true,
      save_referrer: false,
      request_batching: false,
      persistence: "localStorage+cookie",
      before_send: (event) => {
        if (!event) return null;
        // Only the five funnel events may leave the browser, and only with consent.
        if (!OUTGOING_EVENTS.has(event.event) || !analyticsAllowed()) return null;
        const p = (event.properties ?? {}) as Record<string, unknown>;
        // Strict positive list: every property not explicitly listed is dropped.
        for (const k of Object.keys(p)) {
          if (!KEEP_PROPS.has(k)) delete p[k];
        }
        // Never create person profiles (no identify is used anyway).
        p.$process_person_profile = false;
        if ("$current_url" in p) p.$current_url = stripQuery(p.$current_url);
        p.$geoip_disable = true;
        event.properties = p;
        delete (event as { $set?: unknown }).$set;
        delete (event as { $set_once?: unknown }).$set_once;
        return event;
      },
    });
    if (!stillAllowed()) {
      posthog.opt_out_capturing();
      return null;
    }
    posthog.register({ site_environment: siteEnvironment(host), site_host: host });
    if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing();
    ph = posthog;
    return ph;
  })().finally(() => {
    loading = null;
  });
  return loading;
}

function cleanProps(props: Props) {
  const clean: Record<string, string> = {};
  for (const k of ALLOWED_PROPS) if (props[k]) clean[k] = String(props[k]);
  return clean;
}

export async function captureFunnel(event: FunnelEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  if (!analyticsAllowed()) return; // nothing is buffered before consent
  const once = ONCE_PER_VISIT.includes(event);
  if (once) {
    if (wasFired(event) || inFlight.has(event)) return;
    inFlight.add(event); // synchronous in-flight dedupe (StrictMode / re-renders)
  }
  try {
    const client = await load();
    if (!client || !analyticsAllowed()) {
      if (once && analyticsAllowed()) retry.set(event, props);
      return;
    }
    client.capture(event, cleanProps(props));
    if (once) {
      markFired(event);
      retry.delete(event);
    }
    // Flush once-events that previously failed after consent.
    for (const [e, p] of [...retry.entries()]) {
      if (e === event) continue;
      retry.delete(e);
      void captureFunnel(e, p);
    }
  } finally {
    if (once) inFlight.delete(event);
  }
}

function productAreaVisible() {
  const el = document.getElementById("produkt-teaser");
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
  return visible > 0 && visible >= Math.min(r.height, window.innerHeight) * 0.25;
}

/** On consent: catch up only what is true right now (no retroactive pre-consent history). */
function catchUpCurrentState() {
  const path = window.location.pathname;
  if (path === "/") void captureFunnel("landing_page_viewed");
  if (path === "/Konfigurator") {
    const product = new URLSearchParams(window.location.search).get("product") ?? undefined;
    void captureFunnel("product_area_viewed", {
      entry_type: "direct",
      product_id: product && ["mobile", "cabinet", "one"].includes(product) ? product : "mobile",
    });
  } else if (productAreaVisible()) {
    void captureFunnel("product_area_viewed", { entry_type: "scroll" });
  }
}

function wipePosthogStorage() {
  try {
    for (const store of [localStorage, sessionStorage]) {
      for (const key of Object.keys(store)) {
        if (key.startsWith("ph_") || key.startsWith("__ph") || key === FIRED_KEY) store.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
  for (const raw of document.cookie.split(";")) {
    const name = raw.split("=")[0].trim();
    if (name.startsWith("ph_") || name.startsWith("__ph")) {
      deleteCookie(name);
      document.cookie = `${name}=; Path=/; Domain=${window.location.hostname}; Max-Age=0`;
      document.cookie = `${name}=; Path=/; Domain=.${window.location.hostname.replace(/^www\./, "")}; Max-Age=0`;
    }
  }
}

export function removeLegacyAnalyticsCookies() {
  for (const name of ["lavidro_visitor", "lavidro_session"]) {
    if (readCookie(name) !== null) deleteCookie(name);
  }
}

function onConsentChanged() {
  removeLegacyAnalyticsCookies();
  if (analyticsAllowed()) {
    catchUpCurrentState();
    startEngagement();
    return;
  }
  stopEngagement();
  // Withdrawal: abort in-flight loads, stop capture, reset identity, wipe storage.
  consentEpoch++;
  retry.clear();
  firedInMemory.clear();
  if (ph) {
    ph.opt_out_capturing();
    ph.reset();
    ph = null; // a later re-consent re-inits via load()
  }
  wipePosthogStorage();
}

/** Call once on the client (from a useEffect). */
export function initAnalytics() {
  if (typeof window === "undefined" || listening) return;
  listening = true;
  removeLegacyAnalyticsCookies();
  if (!analyticsAllowed()) wipePosthogStorage();
  window.addEventListener("lavidro:consent-changed", onConsentChanged);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide);
  startEngagement();
}

// ---------------------------------------------------------------------------
// page_engagement: visible seconds per page view and running total per session.
// Only runs while analytics consent exists; nothing is measured before opt-in.
const PAGE_PATHS = new Set(["/", "/Konfigurator", "/aboutLavidro", "/kontakt", "/impressum", "/datenschutz"]);
const PRODUCT_IDS = new Set(["mobile", "cabinet", "one"]);
const FLUSH_EVERY_MS = 30_000; // periodic flush of visible time
const MAX_TICK_GAP_MS = 2_000; // ignore gaps (sleep, throttling) beyond one tick

type Engagement = { path: string; product?: string; ms: number; last: number };
let engagement: Engagement | null = null;
let engagementTimer: number | null = null;

function currentPage(): { path: string; product?: string } {
  const raw = window.location.pathname;
  const path = PAGE_PATHS.has(raw) ? raw : "other";
  if (path !== "/Konfigurator") return { path };
  const q = new URLSearchParams(window.location.search).get("product");
  return { path, product: q && PRODUCT_IDS.has(q) ? q : "mobile" };
}

function accumulate(now: number, wasVisible = document.visibilityState === "visible") {
  if (!engagement) return;
  if (wasVisible) {
    engagement.ms += Math.max(0, Math.min(now - engagement.last, MAX_TICK_GAP_MS));
  }
  engagement.last = now;
}


function flushEngagement(beacon = false) {
  if (!engagement || !analyticsAllowed()) return;
  const seconds = Math.round(engagement.ms / 1000);
  if (seconds < 1) return;
  engagement.ms -= seconds * 1000;
  const props: Record<string, string | number> = {
    page_path: engagement.path,
    visible_seconds: seconds, // session total = sum grouped by $session_id in PostHog
  };
  if (engagement.product) props.product_id = engagement.product;
  const send = (client: PostHog) =>
    client.capture(ENGAGEMENT_EVENT, props, beacon ? { transport: "sendBeacon" } : undefined);
  if (ph) send(ph);
  else if (!beacon) void load().then((c) => c && analyticsAllowed() && send(c));
}

function tickEngagement() {
  if (!analyticsAllowed()) return stopEngagement();
  const now = Date.now();
  const page = currentPage();
  if (!engagement) {
    engagement = { ...page, ms: 0, last: now };
    return;
  }
  if (page.path !== engagement.path || page.product !== engagement.product) {
    accumulate(now); // SPA route change: close the previous page view
    flushEngagement();
    engagement = { ...page, ms: 0, last: now };
    return;
  }
  accumulate(now);
  if (engagement.ms >= FLUSH_EVERY_MS) {
    flushEngagement();
  }
}

function startEngagement() {
  if (engagementTimer !== null || !analyticsAllowed()) return;
  engagement = null; // fresh start: no retroactive time before opt-in
  void load(); // SDK ready on every page so short visits can be sent on leave
  tickEngagement();
  engagementTimer = window.setInterval(tickEngagement, 1000);
}

function stopEngagement() {
  if (engagementTimer !== null) window.clearInterval(engagementTimer);
  engagementTimer = null;
  engagement = null; // discard unsent time on withdrawal
}

function onVisibilityChange() {
  if (!engagement || engagementTimer === null) return;
  const now = Date.now();
  if (document.visibilityState === "hidden") {
    accumulate(now, true); // time up to the moment the tab was hidden
    flushEngagement(true);
  } else {
    engagement.last = now;
  }
}

function onPageHide() {
  if (!engagement || engagementTimer === null) return;
  accumulate(Date.now(), document.visibilityState === "visible");
  flushEngagement(true);
}
