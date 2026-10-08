// Password-only protection for aggregate funnel administration. No secrets in client bundles.
// Production secrets: FUNNEL_ADMIN_PASSWORD + FUNNEL_ADMIN_SESSION_SECRET (>= 32 chars).
const COOKIE = "lavidro_funnel_admin";
const SESSION_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();
const enc = new TextEncoder();

function getSecrets() {
  return {
    password: process.env.FUNNEL_ADMIN_PASSWORD?.trim() ?? "",
    sessionKey: process.env.FUNNEL_ADMIN_SESSION_SECRET ?? "",
  };
}
export function isFunnelAdminConfigured() {
  const s = getSecrets();
  return s.password.length >= 16 && s.sessionKey.length >= 32;
}

async function hash(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)));
}
function equalBytes(a: Uint8Array, b: Uint8Array) {
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) mismatch |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return mismatch === 0;
}
export async function checkFunnelPassword(candidate: unknown): Promise<boolean> {
  const { password } = getSecrets();
  if (!isFunnelAdminConfigured() || typeof candidate !== "string" || candidate.length > 256) return false;
  return equalBytes(await hash(candidate), await hash(password));
}
const hex = (b: Uint8Array) => Array.from(b, v => v.toString(16).padStart(2, "0")).join("");
async function signature(payload: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(getSecrets().sessionKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload))));
}
function cookieValue(request: Request) {
  const raw = request.headers.get("cookie") ?? "";
  const pair = raw.split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="));
  return pair?.slice(COOKIE.length + 1) ?? "";
}
export async function adminSessionValid(request: Request, now = Date.now()) {
  if (!isFunnelAdminConfigured()) return false;
  const parts = cookieValue(request).split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const [version, expires, nonce, mac] = parts;
  if (!/^\d{13}$/.test(expires) || !/^[0-9a-f]{32}$/.test(nonce) || !/^[0-9a-f]{64}$/.test(mac)) return false;
  const ts = Number(expires);
  if (ts <= now || ts > now + SESSION_MS) return false;
  const expected = await signature(`${version}.${expires}.${nonce}`);
  return equalBytes(enc.encode(mac), enc.encode(expected));
}
export async function issueFunnelSession(now = Date.now()) {
  if (!isFunnelAdminConfigured()) throw new Error("Funnel admin not configured");
  const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `v1.${now + SESSION_MS}.${nonce}`;
  return `${payload}.${await signature(payload)}`;
}
export function funnelSessionCookie(request: Request, value: string | null) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const common = `Path=/api/admin; HttpOnly; SameSite=Strict${secure}`;
  return value ? `${COOKIE}=${value}; ${common}; Max-Age=${SESSION_MS / 1000}` : `${COOKIE}=; ${common}; Max-Age=0`;
}
export function exactAdminOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}
export function loginRateLimited(ip: string | null, now = Date.now()) {
  const key = ip?.trim() || "unknown";
  if (attempts.size > 10_000) for (const [k, record] of attempts) if (record.resetAt < now) attempts.delete(k);
  const curr = attempts.get(key);
  if (!curr || curr.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  curr.count++;
  return curr.count > 5;
}
export function adminApiHeaders() {
  return { "cache-control": "no-store, private", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" };
}
