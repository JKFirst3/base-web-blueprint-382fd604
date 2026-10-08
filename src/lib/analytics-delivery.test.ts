import assert from "node:assert/strict";
import { test } from "node:test";
import { deliverAnalytics } from "./analytics-delivery.ts";

test("network retries keep the exact UUID and payload until the gate acknowledges forwarding", async () => {
  const bodies: string[] = [];
  const fetchEvent = (async (_url, init) => {
    bodies.push(String(init?.body));
    assert.equal(init?.keepalive, true);
    if (bodies.length === 1) throw new Error("lost response");
    if (bodies.length === 2) return new Response(null, { status: 502 });
    return Response.json({ status: 1, forwarded: true });
  }) as typeof fetch;
  const payload = { uuid: "00000000-0000-4000-8000-000000000001", event: "website_visited" };
  assert.equal(
    await deliverAnalytics(
      payload,
      () => true,
      fetchEvent,
      async () => {},
    ),
    true,
  );
  assert.equal(bodies.length, 3);
  assert.equal(new Set(bodies).size, 1);
});

test("HTTP 200 drops are not acknowledged and never retried", async () => {
  let calls = 0;
  const fetchEvent = (async () => {
    calls++;
    return Response.json({ status: 1, forwarded: false });
  }) as typeof fetch;
  assert.equal(await deliverAnalytics({}, () => true, fetchEvent), false);
  assert.equal(calls, 1);
});

test("withdrawal or a new consent generation prevents retries of the old payload", async () => {
  let allowed = true;
  let calls = 0;
  const fetchEvent = (async () => {
    calls++;
    allowed = false;
    throw new Error("offline");
  }) as typeof fetch;
  assert.equal(
    await deliverAnalytics(
      {},
      () => allowed,
      fetchEvent,
      async () => {},
    ),
    false,
  );
  assert.equal(calls, 1);
});

test("persistent failures stop after three attempts", async () => {
  let calls = 0;
  const fetchEvent = (async () => {
    calls++;
    return new Response(null, { status: 502 });
  }) as typeof fetch;
  assert.equal(
    await deliverAnalytics(
      {},
      () => true,
      fetchEvent,
      async () => {},
    ),
    false,
  );
  assert.equal(calls, 3);
});
