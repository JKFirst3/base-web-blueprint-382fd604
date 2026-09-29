// Consent + first-party cookie helpers for Lavidro analytics.
// Zero PII. All cookies are first-party.

export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = "lavidro_consent";
export const VISITOR_COOKIE = "lavidro_visitor";
export const SESSION_COOKIE = "lavidro_session";

const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 30 * 6;

export type ConsentState = {
  v: number;
  analytics: boolean;
  ts: number;
};

// ---------- cookie primitives ----------

function isSecure(): boolean {
  if (typeof window === "undefined") return true;
  return window.location.protocol === "https:";
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const target = name + "=";
  for (const raw of document.cookie.split(";")) {
    const c = raw.trim();
    if (c.startsWith(target)) return decodeURIComponent(c.slice(target.length));
  }
  return null;
}

export function writeCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === "undefined") return;
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (isSecure()) parts.push("Secure");
  document.cookie = parts.join("; ");
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  const parts = [
    `${name}=`,
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (isSecure()) parts.push("Secure");
  document.cookie = parts.join("; ");
}

// ---------- consent ----------

export function readConsent(): ConsentState | null {
  const raw = readCookie(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.analytics !== "boolean" || parsed.v !== CONSENT_VERSION) return null;
    return {
      v: CONSENT_VERSION,
      analytics: parsed.analytics,
      ts: typeof parsed.ts === "number" ? parsed.ts : Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): ConsentState {
  const state: ConsentState = { v: CONSENT_VERSION, analytics, ts: Date.now() };
  writeCookie(CONSENT_COOKIE, JSON.stringify(state), SIX_MONTHS_SECONDS);
  // Legacy first-party analytics cookies are no longer used; always remove them.
  deleteCookie(VISITOR_COOKIE);
  deleteCookie(SESSION_COOKIE);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lavidro:consent-changed", { detail: state }));
  }
  return state;
}

export function analyticsAllowed(): boolean {
  return readConsent()?.analytics === true;
}

export function openConsentSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("lavidro:open-consent"));
}
