import { createFileRoute } from "@tanstack/react-router";
import { handleIngest } from "@/lib/ph-ingest.server";

// Consent gate for PostHog capture (see src/lib/ph-ingest.server.ts). No CORS, no payload logs.
async function handle(request: Request, splat: string) {
  const raw = (process.env["POSTHOG_API_KEY"] ?? "").trim();
  const token = /^phc_[A-Za-z0-9_-]{10,200}$/.test(raw) ? raw : null;
  const { response, outcome } = await handleIngest(request, splat, {
    token,
    fetchUpstream: (url, init) => fetch(url, init),
  });
  if (outcome === "upstream_error" || outcome === "rejected_origin") {
    console.warn(`[ph-ingest] ${outcome}`);
  }
  return response;
}

export const Route = createFileRoute("/api/public/ph-ingest/$")({
  server: {
    handlers: {
      POST: ({ request, params }) => handle(request, params._splat ?? ""),
      GET: ({ request, params }) => handle(request, params._splat ?? ""),
    },
  },
});
