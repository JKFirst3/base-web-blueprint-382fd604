import { createFileRoute } from "@tanstack/react-router";

// Public, same-origin endpoint returning ONLY the public PostHog project token (phc_…)
// and a whitelisted ingest host. No other env values are ever read or returned.
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
        const region = (process.env["POSTHOG_REGION"] ?? "eu").trim().toLowerCase();
        const token = /^phc_[A-Za-z0-9_-]{10,200}$/.test(raw) ? raw : null;
        const host = region === "us" ? "https://us.i.posthog.com" : "https://eu.i.posthog.com";
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
