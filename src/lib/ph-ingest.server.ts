import { validCampaign } from "./campaign.ts";

// Same-origin consent gate for PostHog capture. NOT an open proxy:
// - fixed EU upstream, fixed path; nothing from the client selects the destination
// - forwards only allow-listed events/properties, only with valid analytics consent whose
//   timestamp (consent generation) matches the `consent_ts` stamped on each event
// - never forwards visitor IP, cookies or browser headers; never logs payloads
// A request that already passed this gate before withdrawal cannot be recalled.

export const UPSTREAM_URL = "https://eu.i.posthog.com/batch/";
export const MAX_BODY_BYTES = 32 * 1024;
const MAX_EVENTS = 20;
const CONSENT_COOKIE = "lavidro_consent";
const CONSENT_VERSION = 1;

export const FUNNEL_EVENT_NAMES = [
  "landing_page_viewed",
  "product_area_viewed",
  "purchase_model_selected",
  "purchase_interest_started",
  "purchase_interest_submitted",
] as const;
export const DIAGNOSTIC_EVENT_NAMES = [
  "page_engagement",
  "purchase_interest_email_confirmed",
] as const;
const EVENTS = new Set<string>([...FUNNEL_EVENT_NAMES, ...DIAGNOSTIC_EVENT_NAMES]);
const PRODUCT_IDS = new Set(["mobile", "cabinet", "one"]);
const BUSINESS_MODELS = new Set(["purchase", "subscription"]);
const ENTRY_TYPES = new Set(["scroll", "direct"]);
const HOUSEHOLD_SIZES = new Set(["1", "2", "3-4", "5+"]);
const GREATEST_VALUES = new Set([
  "Weniger Zeit für Wäsche aufwenden",
  "Wiederkehrende Hausarbeit reduzieren",
  "Möglichst lange selbständig im eigenen Zuhause leben",
  "Weniger Abhängigkeit von Haushaltshilfen",
  "Schonender und zuverlässigere Textilpflege",
  "Sonstige",
]);
const DEMOGRAPHIC_PROPS = ["household_size", "greatest_value", "job_title_provided"] as const;
const FORBIDDEN_FREE_TEXT_PROPS = new Set(["name", "email", "job_title", "greatest_value_other"]);
const PAGE_PATHS = new Set(["/", "/Konfigurator", "/aboutLavidro", "/kontakt", "/impressum", "/datenschutz", "/anfrage-bestaetigen", "other"]);
const PRODUCTION_HOSTS = new Set(["lavidro.com", "www.lavidro.com", "base-web-blueprint.lovable.app"]);
const MAX_PAST_MS = 24 * 60 * 60 * 1000;
const MAX_FUTURE_MS = 5 * 60 * 1000;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

/** Strict ISO-8601 timestamp within [now-24h, now+5min], else undefined. */
export function validTimestamp(v: unknown, now: number): string | undefined {
  if (typeof v !== "string" || !ISO_RE.test(v)) return undefined;
  const t = Date.parse(v);
  if (!Number.isFinite(t) || t < now - MAX_PAST_MS || t > now + MAX_FUTURE_MS) return undefined;
  return new Date(t).toISOString();
}
// Opaque SDK identifiers / metadata: short plain strings only.
const ID_PROPS = ["distinct_id", "$session_id", "$window_id", "$device_id", "$insert_id", "$lib", "$lib_version"];
const ID_RE = /^[A-Za-z0-9._:\-]{1,100}$/;
const ALLOWED_INPUT_PROPS = new Set([
  "token",
  "consent_ts",
  ...ID_PROPS,
  "$time",
  "$current_url",
  "$geoip_disable",
  "$process_person_profile",
  "campaign_id",
  "site_environment",
  "site_host",
  "product_id",
  "business_model",
  "entry_type",
  "page_path",
  "visible_seconds",
  ...DEMOGRAPHIC_PROPS,
]);

const NO_STORE = { "cache-control": "no-store", "x-content-type-options": "nosniff" };

export type GateOutcome =
  | "forwarded"
  | "dropped_path"
  | "dropped_no_consent"
  | "dropped_stale_consent"
  | "dropped_invalid"
  | "rejected_origin"
  | "rejected_size"
  | "upstream_error";

export type GateResult = { response: Response; outcome: GateOutcome };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...NO_STORE, "content-type": "application/json; charset=utf-8" },
  });
}
// "Drop" answers look like success so the SDK does not retry them.
const drop = (outcome: GateOutcome): GateResult => ({ response: json(200, { status: 1 }), outcome });

export function readConsentTs(cookieHeader: string | null): number | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName !== CONSENT_COOKIE) continue;
    try {
      const c = JSON.parse(decodeURIComponent(rest.join("="))) as Record<string, unknown>;
      if (c.v === CONSENT_VERSION && c.analytics === true && typeof c.ts === "number" && Number.isFinite(c.ts)) {
        return c.ts;
      }
    } catch {
      /* invalid cookie = no consent */
    }
    return null;
  }
  return null;
}

/** Legit browsers send Sec-Fetch-Site; older ones at least Origin on POST. */
function sameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = request.headers.get("origin");
  if (origin) return origin === new URL(request.url).origin;
  return true; // neither header: non-browser caller; consent cookie still required
}

async function readLimited(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.byteLength;
  }
  return new TextDecoder().decode(buf);
}

function parseBody(text: string): unknown[] | null {
  let t = text.trim();
  if (t.startsWith("data=")) {
    try {
      t = atob(decodeURIComponent(t.slice(5).split("&")[0]));
    } catch {
      return null;
    }
  }
  if (!t.startsWith("{") && !t.startsWith("[")) return null; // compressed/unknown: refuse
  try {
    const d = JSON.parse(t) as unknown;
    if (Array.isArray(d)) return d;
    if (d && typeof d === "object" && Array.isArray((d as { batch?: unknown }).batch)) {
      return (d as { batch: unknown[] }).batch;
    }
    return d && typeof d === "object" ? [d] : null;
  } catch {
    return null;
  }
}

function stripUrl(v: unknown, origin: string): string | undefined {
  if (typeof v !== "string") return undefined;
  try {
    const u = new URL(v);
    // Only same-origin, known site paths; query and fragment are always removed.
    if (u.origin !== origin || u.pathname === "other" || !PAGE_PATHS.has(u.pathname)) return undefined;
    return `${u.origin}${u.pathname}`;
  } catch {
    return undefined;
  }
}

type CleanEvent = { event: string; distinct_id: string; properties: Record<string, unknown>; uuid?: string; timestamp?: string };

function cleanEvent(raw: unknown, token: string, consentTs: number, origin: string, host: string, now: number):
  | CleanEvent
  | "stale"
  | "invalid" {
  if (!raw || typeof raw !== "object") return "invalid";
  const e = raw as Record<string, unknown>;
  const p = (e.properties && typeof e.properties === "object" ? e.properties : {}) as Record<string, unknown>;
  if (typeof e.event !== "string" || !EVENTS.has(e.event)) return "invalid";
  if (Object.keys(p).some((key) => !ALLOWED_INPUT_PROPS.has(key))) return "invalid";
  if (p.token !== token) return "invalid";
  if (p.consent_ts !== consentTs) return "stale"; // older consent generation: never reactivated
  const out: Record<string, unknown> = {
    token,
    $process_person_profile: false,
    $geoip_disable: true,
  };
  if ("campaign_id" in p) {
    const campaign = validCampaign(p.campaign_id);
    if (!campaign) return "invalid";
    out.campaign_id = campaign;
  }
  for (const k of ID_PROPS) if (typeof p[k] === "string" && ID_RE.test(p[k] as string)) out[k] = p[k];
  if (!out.distinct_id) return "invalid";
  if (typeof p.$time === "number" && Number.isFinite(p.$time)) out.$time = p.$time;
  const url = stripUrl(p.$current_url, origin);
  if (url) out.$current_url = url;
  if (typeof p.product_id === "string" && PRODUCT_IDS.has(p.product_id)) out.product_id = p.product_id;
  if (typeof p.business_model === "string" && BUSINESS_MODELS.has(p.business_model)) out.business_model = p.business_model;
  if (typeof p.entry_type === "string" && ENTRY_TYPES.has(p.entry_type)) out.entry_type = p.entry_type;
  if ([...FORBIDDEN_FREE_TEXT_PROPS].some((key) => key in p)) return "invalid";
  const hasDemographics = DEMOGRAPHIC_PROPS.some((key) => key in p);
  if (hasDemographics && e.event !== "purchase_interest_submitted") return "invalid";
  if (e.event === "purchase_interest_submitted") {
    if ("household_size" in p) {
      if (typeof p.household_size !== "string" || !HOUSEHOLD_SIZES.has(p.household_size)) return "invalid";
      out.household_size = p.household_size;
    }
    if ("greatest_value" in p) {
      if (typeof p.greatest_value !== "string" || !GREATEST_VALUES.has(p.greatest_value)) return "invalid";
      out.greatest_value = p.greatest_value;
    }
    if ("job_title_provided" in p) {
      if (typeof p.job_title_provided !== "boolean") return "invalid";
      out.job_title_provided = p.job_title_provided;
    }

  }
  // Server-derived only, never client text.
  out.site_environment = PRODUCTION_HOSTS.has(host) ? "production" : "preview";
  out.site_host = host;
  if (e.event === "page_engagement") {
    if (typeof p.page_path !== "string" || !PAGE_PATHS.has(p.page_path)) return "invalid";
    const s = p.visible_seconds;
    if (typeof s !== "number" || !Number.isInteger(s) || s < 1 || s > 86_400) return "invalid";
    out.page_path = p.page_path;
    out.visible_seconds = s;
  }
  // Top-level distinct_id (required by the capture API) mirrors the validated property.
  const clean: CleanEvent = { event: e.event, distinct_id: out.distinct_id as string, properties: out };
  if (typeof e.uuid === "string" && /^[0-9a-f-]{36}$/i.test(e.uuid)) clean.uuid = e.uuid;
  const ts = validTimestamp(e.timestamp, now);
  if (ts) clean.timestamp = ts;
  return clean;
}

export async function handleIngest(
  request: Request,
  splat: string,
  deps: { token: string | null; now?: () => number; fetchUpstream: (url: string, init: RequestInit) => Promise<Response> },
): Promise<GateResult> {
  // Only POST capture is forwarded; any other SDK path/method is answered locally, no upstream call.
  if (request.method !== "POST" || splat.replace(/^\/+|\/+$/g, "") !== "e") return drop("dropped_path");
  if (!sameOrigin(request)) return { response: json(403, { error: "origin" }), outcome: "rejected_origin" };
  const consentTs = readConsentTs(request.headers.get("cookie"));
  const text = await readLimited(request);
  if (text === null) return { response: json(413, { error: "size" }), outcome: "rejected_size" };
  if (consentTs === null) return drop("dropped_no_consent");
  const token = deps.token;
  if (!token) return drop("dropped_invalid");
  const items = parseBody(text);
  if (!items || items.length === 0 || items.length > MAX_EVENTS) return drop("dropped_invalid");
  const url = new URL(request.url);
  const now = (deps.now ?? Date.now)();
  const batch: CleanEvent[] = [];
  let stale = false;
  for (const it of items) {
    const r = cleanEvent(it, token, consentTs, url.origin, url.hostname, now);
    if (r === "stale") stale = true;
    else if (r !== "invalid") batch.push(r);
  }
  if (batch.length === 0) return drop(stale ? "dropped_stale_consent" : "dropped_invalid");
  try {
    // Fresh headers only: no visitor IP, cookies, user agent or other browser headers.
    const res = await deps.fetchUpstream(UPSTREAM_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ api_key: token, batch }),
    });
    if (!res.ok) return { response: json(502, { error: "upstream" }), outcome: "upstream_error" };
    return { response: json(200, { status: 1 }), outcome: "forwarded" };
  } catch {
    return { response: json(502, { error: "upstream" }), outcome: "upstream_error" };
  }
}
