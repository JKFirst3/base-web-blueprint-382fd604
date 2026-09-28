// Consent-gated PostHog funnel tracking (5 manual events only). No PII.
// PostHog JS is loaded dynamically only after explicit analytics consent.
import type { PostHog } from "posthog-js";
import { analyticsAllowed, deleteCookie, readCookie } from "./consent";
import { getPosthogConfig } from "./posthog-config.functions";

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
const ONCE_PER_VISIT: FunnelEvent[] = ["landing_page_viewed", "product_area_viewed"];
const FIRED_KEY = "lv_ph_fired";

let ph: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
let listening = false;
// In-memory only (no storage before consent): events eligible for catch-up after consent.
const pending = new Map<FunnelEvent, Props>();
const firedInMemory = new Set<FunnelEvent>();

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
  loading = (async () => {
    const cfg = await getPosthogConfig();
    if (!cfg.token || !analyticsAllowed()) return null;
    const { default: posthog } = await import("posthog-js");
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
      save_referrer: false,
      persistence: "localStorage+cookie",
      before_send: (event) => {
        if (!event) return null;
        const p = event.properties ?? {};
        for (const k of ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer"]) {
          if (k in p) p[k] = stripQuery(p[k]);
        }
        delete p.$set;
        delete p.$set_once;
        return event;
      },
    });
    posthog.register({ site_environment: siteEnvironment(host), site_host: host });
    if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing();
    ph = posthog;
    return ph;
  })().finally(() => {
    loading = null;
  });
  return loading;
}

export async function captureFunnel(event: FunnelEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  const once = ONCE_PER_VISIT.includes(event);
  if (!analyticsAllowed()) {
    if (once && !firedInMemory.has(event) && !pending.has(event)) pending.set(event, props);
    return;
  }
  if (once) {
    if (wasFired(event)) return;
    markFired(event); // mark synchronously to dedupe StrictMode / re-renders
  }
  const clean: Record<string, string> = {};
  for (const k of ALLOWED_PROPS) if (props[k]) clean[k] = String(props[k]);
  const client = await load();
  if (!client || !analyticsAllowed()) return;
  client.capture(event, clean);
}

/** Clear pending catch-up events (e.g. when navigating away from the landing page). */
export function clearPending(event: FunnelEvent) {
  pending.delete(event);
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
    const queued = [...pending.entries()];
    pending.clear();
    for (const [event, props] of queued) void captureFunnel(event, props);
    return;
  }
  // Withdrawal: stop capture, reset identity, wipe storage.
  pending.clear();
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
}
