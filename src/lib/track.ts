// Consent-gated first-party analytics. No PII allowed.
import {
  analyticsAllowed,
  ensureAnalyticsCookies,
  readCookie,
  VISITOR_COOKIE,
  SESSION_COOKIE,
} from "./consent";

// Allow-list of event names accepted by the collector.
export const ALLOWED_EVENTS = [
  "page_view",
  "navigation_click",
  "product_click",
  "configurator_open",
  "configurator_tier_selected",
  "configurator_financing_selected",
  "configurator_comparison_open",
  "preorder_open",
  "preorder_success",
  "live_experience_click",
  "live_experience_success",
  "faq_open",
  "cta_click",
] as const;
export type AllowedEvent = (typeof ALLOWED_EVENTS)[number];

// Allow-list of property keys forwarded to the collector.
const ALLOWED_KEYS = new Set([
  "path",
  "product_id",
  "product_name",
  "tier",
  "payment_type",
  "cta_label",
  "faq_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "device",
]);

type EventProps = Record<string, string | number | boolean | undefined | null>;

function deviceClass(): "desktop" | "tablet" | "mobile" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
      const v = p.get(k);
      if (v) out[k] = v.slice(0, 120);
    }
    return out;
  } catch {
    return {};
  }
}

function sanitize(props?: EventProps): Record<string, string> {
  const clean: Record<string, string> = {};
  if (!props) return clean;
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    if (v === undefined || v === null) continue;
    if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") continue;
    clean[k] = String(v).slice(0, 200);
  }
  return clean;
}

function isAllowedEvent(name: string): name is AllowedEvent {
  return (ALLOWED_EVENTS as readonly string[]).includes(name);
}

/**
 * Track a first-party analytics event. Silently no-ops without consent.
 * Legacy callers may pass event names outside the allow-list — those are dropped.
 */
export function track(event: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  if (!analyticsAllowed()) return;
  if (!isAllowedEvent(event)) return;

  const ids = ensureAnalyticsCookies();
  const visitorId = ids?.visitorId ?? readCookie(VISITOR_COOKIE) ?? undefined;
  const sessionId = ids?.sessionId ?? readCookie(SESSION_COOKIE) ?? undefined;

  const merged = { ...readUtm(), device: deviceClass(), ...sanitize(props) };
  const payload = {
    event_name: event,
    path: window.location.pathname.slice(0, 200),
    visitor_id: visitorId,
    session_id: sessionId,
    product_id: merged.product_id,
    tier: merged.tier,
    payment_type: merged.payment_type,
    properties: merged,
  };

  try {
    const body = JSON.stringify(payload);
    const url = "/api/public/collect-analytics";
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* swallow */
    });
  } catch {
    /* swallow */
  }
}
