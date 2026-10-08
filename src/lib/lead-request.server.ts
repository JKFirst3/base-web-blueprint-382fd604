// Shared anti-abuse checks for the newsletter/interview lead endpoint.
// Never trust X-Forwarded-For provided by the caller.
const RATE = new Map<string, { count: number; resetAt: number }>();

export function allowedLeadOrigin(origin: string | null, requestUrl: string): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

export function isLeadRateLimited(platformIp: string | null, now = Date.now()): boolean {
  // Cloudflare supplies cf-connecting-ip at its trusted edge. Without that trusted
  // value, defer to the edge WAF rather than trusting spoofable request headers.
  const key = platformIp?.trim();
  if (!key) return false;
  if (RATE.size > 10_000) {
    for (const [ip, record] of RATE) if (record.resetAt <= now) RATE.delete(ip);
  }
  const current = RATE.get(key);
  if (!current || current.resetAt <= now) {
    RATE.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}
