// Lightweight analytics event tracking. No PII allowed.
// Values are stripped to strings/numbers; anything else is dropped.

type EventProps = Record<string, string | number | boolean | undefined>;

export function track(event: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  const clean: Record<string, string | number | boolean> = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined) continue;
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") clean[k] = v;
    }
  }
  // Route through Lovable Analytics if present, else no-op.
  const w = window as unknown as { lovable?: { track?: (e: string, p?: unknown) => void } };
  try {
    w.lovable?.track?.(event, clean);
  } catch {
    /* swallow */
  }
  // Also emit as a CustomEvent for any listeners
  try {
    window.dispatchEvent(new CustomEvent("lavidro:track", { detail: { event, props: clean } }));
  } catch {
    /* swallow */
  }
}
