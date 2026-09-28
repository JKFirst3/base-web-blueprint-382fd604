import { createServerFn } from "@tanstack/react-start";

// Returns the PUBLIC PostHog project token (phc_…) and ingest host.
// Only called by the browser after explicit analytics consent.
export const getPosthogConfig = createServerFn({ method: "GET" }).handler(async () => {
  const token = process.env["POSTHOG_API_KEY"] ?? "";
  const region = process.env["POSTHOG_REGION"] ?? "eu";
  if (!token.startsWith("phc_")) return { token: null as string | null, host: "" };
  return {
    token,
    host: region === "us" ? "https://us.i.posthog.com" : "https://eu.i.posthog.com",
  };
});
