import assert from "node:assert/strict";
import { test } from "node:test";
import { readPostHogEvents, readMetaInsights } from "./funnel-connectors.server.ts";
import { safePeriod } from "./funnel-data.server.ts";

test("days input always clamps to safe windows", () => {
  assert.equal(safePeriod("7"), 7);
  assert.equal(safePeriod("90"), 90);
  assert.equal(safePeriod("999999"), 30);
});

test("PostHog is aggregate-only and returns none for unconfigured key", async () => {
  const old = process.env.POSTHOG_PERSONAL_API_KEY;
  delete process.env.POSTHOG_PERSONAL_API_KEY;
  try {
    assert.equal((await readPostHogEvents(7)).status, "unconfigured");
  } finally {
    if (old) process.env.POSTHOG_PERSONAL_API_KEY = old;
  }
});

test("Meta Insights returns unconfigured without an API token", async () => {
  const old = process.env.META_ACCESS_TOKEN;
  delete process.env.META_ACCESS_TOKEN;
  try {
    assert.equal((await readMetaInsights(30)).status, "unconfigured");
  } finally {
    if (old) process.env.META_ACCESS_TOKEN = old;
  }
});
