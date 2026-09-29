import { createFileRoute } from "@tanstack/react-router";
import { allowedOrigin, isRateLimited } from "@/lib/preorder-confirm.security";

const HEADERS = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "content-type": "application/json; charset=utf-8",
};
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
        const ip = request.headers.get("cf-connecting-ip");
        if (isRateLimited(ip)) return reply(429, { status: "rate_limited" });

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
