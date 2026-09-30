const RATE = new Map<string, { count: number; resetsAt: number }>();

export function allowedPreorderOrigin(origin: string | null, requestUrl: string): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

export function isPreorderRateLimited(ip: string | null, now = Date.now()): boolean {
  const key = ip?.trim();
  // Only Cloudflare's platform-provided address is trusted. Without it, skip the
  // process-local limit instead of grouping unrelated visitors or trusting client headers.
  if (!key) return false;
  const current = RATE.get(key);
  if (!current || current.resetsAt <= now) {
    RATE.set(key, { count: 1, resetsAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

export type ExistingSubmission = {
  id: string;
  doi_status: string | null;
  doi_sent_at: string | null;
};

export type InsertResult = {
  data: { id: string } | null;
  error: { code?: string } | null;
};

export async function createOrFindSubmission(
  create: () => Promise<InsertResult>,
  findExisting: () => Promise<ExistingSubmission | null>,
): Promise<
  | { kind: "created"; row: { id: string } }
  | { kind: "existing"; row: ExistingSubmission }
  | { kind: "failed" }
> {
  const result = await create();
  if (result.data && !result.error) return { kind: "created", row: result.data };
  if (result.error?.code !== "23505") return { kind: "failed" };
  const existing = await findExisting();
  return existing ? { kind: "existing", row: existing } : { kind: "failed" };
}

export function deliveryStatus(row: ExistingSubmission): "sent" | "processing" | "send_failed" {
  if (row.doi_status === "send_failed") return "send_failed";
  return row.doi_sent_at ? "sent" : "processing";
}
