import assert from "node:assert/strict";
import { test } from "node:test";
import { campaignLink } from "./campaign.ts";

test("campaign follows internal navigation without losing product or fragment", () => {
  assert.equal(campaignLink("/Konfigurator?product=one", "https://lavidro.com"), "/Konfigurator?product=one&lv_campaign=smoke_google_v1");
  assert.equal(campaignLink("/#module", "https://lavidro.com"), "/?lv_campaign=smoke_google_v1#module");
  assert.equal(campaignLink("https://example.com/", "https://lavidro.com"), null);
  assert.equal(campaignLink("/api/public/preorders", "https://lavidro.com"), null);
});
