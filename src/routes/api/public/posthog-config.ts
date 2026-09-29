import { createFileRoute } from "@tanstack/react-router";

// Public, same-origin endpoint returning ONLY the public PostHog project token (phc_…)
// and the same-origin ingest gate path. No other env values are ever read or returned.
const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

export const Route = createFileRoute("/api/public/posthog-config")({
  server: {
    handlers: {
      GET: async () => {
        const raw = (process.env["POSTHOG_API_KEY"] ?? "").trim();
        const token = /^phc_[A-Za-z0-9_-]{10,200}$/.test(raw) ? raw : null;
        // Browser sends only to the same-origin consent gate (fixed EU upstream server-side).
        const host = "/api/public/ph-ingest";
        if (!token) {
          return new Response(JSON.stringify({ token: null, host: "", reason: "token_unavailable" }), {
            status: 200,
            headers: HEADERS,
          });
        }
        return new Response(JSON.stringify({ token, host }), { status: 200, headers: HEADERS });
      },
    },
  },
});
