// Own the acknowledgement boundary: SDK capture() does not report network completion.
// A fixed payload/UUID is reused for retries; no event contents are logged.
export async function deliverAnalytics(
  payload: unknown,
  allowed: () => boolean,
  fetchEvent: typeof fetch = fetch,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<boolean> {
  const body = JSON.stringify(payload);
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!allowed()) return false;
    try {
      const response = await fetchEvent("/api/public/ph-ingest/e", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const result = (await response.json()) as { forwarded?: boolean };
        // Consent/validation drops are deliberate, not retryable delivery failures.
        return result.forwarded === true && allowed();
      }
      if (response.status < 500 && response.status !== 429) return false;
    } catch {
      // A lost response can mean upstream accepted it: retry the SAME UUID.
    }
    if (attempt < 2 && allowed()) await wait(500 * 2 ** attempt);
  }
  return false;
}
