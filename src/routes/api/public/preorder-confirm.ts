import { createFileRoute } from "@tanstack/react-router";

const HEADERS = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "content-type": "application/json; charset=utf-8",
};
const RATE = new Map<string, { count: number; resetsAt: number }>();

function allowedOrigin(origin: string | null, requestUrl: string): boolean {
  if (!origin) return false;
  try {
    const o = new URL(origin);
    if (o.origin === new URL(requestUrl).origin) return true;
    const h = o.hostname;
    return h === "lavidro.com" || h === "www.lavidro.com" || h.endsWith(".lovable.app") || h.endsWith(".lovableproject.com");
  } catch {
    return false;
  }
}

function reply(status: number, body: { status: string }) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

export const Route = createFileRoute("/api/public/preorder-confirm")({
  server: {
    handlers: {
      // Only an explicit POST (button click) confirms. GET never changes state.
      GET: async () => reply(405, { status: "method_not_allowed" }),
      POST: async ({ request }) => {
        if (!allowedOrigin(request.headers.get("origin"), request.url)) return reply(403, { status: "forbidden" });
        const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
        const now = Date.now();
        const r = RATE.get(ip);
        if (!r || r.resetsAt <= now) RATE.set(ip, { count: 1, resetsAt: now + 60_000 });
        else if (++r.count > 10) return reply(429, { status: "rate_limited" });

        let token: unknown;
        try {
          const text = await request.text();
          if (text.length > 200) return reply(400, { status: "invalid" });
          token = (JSON.parse(text) as { token?: unknown }).token;
        } catch {
          return reply(400, { status: "invalid" });
        }
        const { confirmToken } = await import("@/lib/preorder-doi.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        try {
          const status = await confirmToken(token, async (tokenHash) => {
            const { data, error } = await supabaseAdmin.rpc("confirm_preorder_doi", { _token_hash: tokenHash });
            if (error) throw new Error(error.code);
            return data;
          });
          return reply(200, { status });
        } catch {
          console.error("[doi] confirmation failed");
          return reply(503, { status: "unavailable" });
        }
      },
    },
  },
});
