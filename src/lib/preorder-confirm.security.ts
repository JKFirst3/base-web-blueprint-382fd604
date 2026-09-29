const RATE = new Map<string, { count: number; resetsAt: number }>();

export function allowedOrigin(origin: string | null, requestUrl: string): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

export function isRateLimited(ip: string | null, now = Date.now()): boolean {
  const key = ip?.trim();
  // Cloudflare supplies this header in deployed environments. Without it, do not
  // collapse unrelated visitors into a shared bucket or trust another client header.
  if (!key) return false;
  const current = RATE.get(key);
  if (!current || current.resetsAt <= now) {
    RATE.set(key, { count: 1, resetsAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 10;
}