import { CAMPAIGN_PARAM, SMOKE_CAMPAIGN, type PreorderSource } from "./campaign.ts";

// Double opt-in for product inquiries. The raw token only exists in memory and in the
// email link; the database stores its SHA-256 hash. Never log or return the raw token.

export const DOI_TTL_MS = 72 * 60 * 60 * 1000;
export const CONFIRM_PATH = "/anfrage-bestaetigen";
const PRODUCTION_ORIGIN = "https://lavidro.com";

export type ConfirmStatus = "confirmed" | "already_confirmed" | "expired" | "invalid";

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function createRawToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashToken(raw: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)));
}

export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

/** Link base: only known site origins, never an arbitrary Host header. */
export function confirmBaseUrl(requestUrl: string): string {
  try {
    const u = new URL(requestUrl);
    const h = u.hostname;
    const known =
      h === "lavidro.com" || h === "www.lavidro.com" || h === "localhost" ||
      h.endsWith(".lovable.app") || h.endsWith(".lovableproject.com");
    return known ? u.origin : PRODUCTION_ORIGIN;
  } catch {
    return PRODUCTION_ORIGIN;
  }
}

export type DoiDeps = {
  now: () => number;
  /** Stores the hash + pending state on the already saved inquiry. */
  setPending: (id: string, tokenHash: string, expiresAt: string) => Promise<void>;
  markSent: (id: string, sentAt: string) => Promise<void>;
  /** Marks send failure and removes the hash (an undelivered link must not work). */
  markSendFailed: (id: string) => Promise<void>;
  sendMail: (args: { idempotencyKey: string; templateData: Record<string, unknown> }) => Promise<{ success: boolean }>;
};

/** Called only AFTER the inquiry is saved. Failures never undo the saved inquiry. */
export async function startDoi(
  id: string,
  baseUrl: string,
  templateData: Record<string, unknown>,
  deps: DoiDeps,
  source?: PreorderSource,
): Promise<"pending" | "send_failed"> {
  const campaignQuery = source === SMOKE_CAMPAIGN ? `?${CAMPAIGN_PARAM}=${SMOKE_CAMPAIGN}` : "";
  const raw = createRawToken();
  const expiresAt = new Date(deps.now() + DOI_TTL_MS).toISOString();
  try {
    await deps.setPending(id, await hashToken(raw), expiresAt);
  } catch {
    console.error("[doi] could not store pending state");
    await deps.markSendFailed(id).catch(() => undefined);
    return "send_failed";
  }
  try {
    const result = await deps.sendMail({
      idempotencyKey: `preorder-doi-${id}`,
      templateData: { ...templateData, confirmUrl: `${baseUrl}${CONFIRM_PATH}${campaignQuery}#token=${raw}`, expiresHours: DOI_TTL_MS / 3_600_000 },
    });
    if (!result.success) throw new Error("not sent");
    await deps.markSent(id, new Date(deps.now()).toISOString());
    return "pending";
  } catch {
    console.error("[doi] confirmation email not sent");
    await deps.markSendFailed(id).catch(() => undefined);
    return "send_failed";
  }
}

export async function confirmToken(
  raw: unknown,
  rpc: (tokenHash: string) => Promise<string | null>,
): Promise<ConfirmStatus> {
  if (typeof raw !== "string" || !TOKEN_RE.test(raw)) return "invalid";
  const result = await rpc(await hashToken(raw));
  return result === "confirmed" || result === "already_confirmed" || result === "expired" ? result : "invalid";
}
