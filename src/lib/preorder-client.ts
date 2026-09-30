export type PreorderResult = {
  saved: true;
  email_status: "sent" | "processing" | "send_failed";
};

/** The deadline includes reading the response body, not just receiving headers. */
export async function requestPreorder(
  payload: Record<string, unknown>,
  fetchRequest: typeof fetch = fetch,
  timeoutMs = 10_000,
): Promise<PreorderResult> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new DOMException("Request timed out", "AbortError"));
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      (async () => {
        const response = await fetchRequest("/api/public/preorders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Preorder request failed: ${response.status}`);
        const result: unknown = await response.json();
        if (!result || typeof result !== "object") throw new Error("Invalid preorder response");
        const data = result as Record<string, unknown>;
        if (
          data.saved !== true ||
          !["sent", "processing", "send_failed"].includes(String(data.email_status))
        ) {
          throw new Error("Invalid preorder response");
        }
        return data as PreorderResult;
      })(),
      deadline,
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
