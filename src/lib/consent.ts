// Consent + first-party cookie helpers for Lavidro analytics.
// Zero PII. All cookies are first-party.

export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = "lavidro_consent";
export const VISITOR_COOKIE = "lavidro_visitor";
export const SESSION_COOKIE = "lavidro_session";

const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 30 * 6;
const SESSION_IDLE_MS = 30 * 60 * 1000;

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
  if (!analytics) {
    deleteCookie(VISITOR_COOKIE);
    deleteCookie(SESSION_COOKIE);
  } else {
    ensureAnalyticsCookies();
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lavidro:consent-changed", { detail: state }));
  }
  return state;
}

// ---------- visitor + session ----------

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type SessionRecord = { id: string; last: number };

export function ensureAnalyticsCookies(): { visitorId: string; sessionId: string } | null {
  const consent = readConsent();
  if (!consent?.analytics) return null;

  let visitorId = readCookie(VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = uuid();
    writeCookie(VISITOR_COOKIE, visitorId, SIX_MONTHS_SECONDS);
  }

  let sessionId: string | null = null;
  const raw = readCookie(SESSION_COOKIE);
  if (raw) {
    try {
      const rec = JSON.parse(raw) as SessionRecord;
      if (rec.id && typeof rec.last === "number" && Date.now() - rec.last < SESSION_IDLE_MS) {
        sessionId = rec.id;
      }
    } catch {
      /* ignore */
    }
  }
  if (!sessionId) sessionId = uuid();
  const rec: SessionRecord = { id: sessionId, last: Date.now() };
  writeCookie(SESSION_COOKIE, JSON.stringify(rec), SIX_MONTHS_SECONDS);

  return { visitorId, sessionId };
}

export function analyticsAllowed(): boolean {
  return readConsent()?.analytics === true;
}

export function openConsentSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("lavidro:open-consent"));
}
