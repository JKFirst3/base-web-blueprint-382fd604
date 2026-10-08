import assert from "node:assert/strict";
import { test } from "node:test";
import { campaignLink, PRODUCT_CAMPAIGNS, SALE_CAMPAIGNS, validCampaign } from "./campaign.ts";

test("campaign follows internal navigation without losing product or fragment", () => {
  assert.equal(
    campaignLink("/Konfigurator?product=one", "https://lavidro.com"),
    "/Konfigurator?product=one&lv_campaign=smoke_google_v1",
  );
  assert.equal(
    campaignLink("/#module", "https://lavidro.com"),
    "/?lv_campaign=smoke_google_v1#module",
  );
  assert.equal(campaignLink("https://example.com/", "https://lavidro.com"), null);
  assert.equal(campaignLink("/api/public/preorders", "https://lavidro.com"), null);
});

test("each product keeps its own campaign through navigation", () => {
  for (const [product, campaign] of [
    ...Object.entries(PRODUCT_CAMPAIGNS),
    ...Object.entries(SALE_CAMPAIGNS),
  ]) {
    assert.equal(validCampaign(campaign), campaign);
    assert.equal(
      campaignLink(`/Konfigurator?product=${product}`, "https://lavidro.com", campaign),
      `/Konfigurator?product=${product}&lv_campaign=${campaign}`,
    );
    assert.equal(
      campaignLink("/#top", "https://lavidro.com", campaign),
      `/?lv_campaign=${campaign}#top`,
    );
  }
  assert.equal(validCampaign("private text"), null);
});

test("campaign is preserved on every public subpage, absolute links and DOI return links", () => {
  const origin = "https://lavidro.com";
  for (const path of [
    "/",
    "/Konfigurator",
    "/aboutLavidro",
    "/kontakt",
    "/datenschutz",
    "/impressum",
    "/anfrage-bestaetigen",
  ]) {
    for (const campaign of Object.values(PRODUCT_CAMPAIGNS)) {
      assert.equal(
        campaignLink(`${origin}${path}`, origin, campaign),
        `${path}?lv_campaign=${campaign}`,
      );
    }
  }
  assert.equal(
    campaignLink(
      "https://lavidro.com/Konfigurator?product=cabinet#details",
      origin,
      PRODUCT_CAMPAIGNS.mobile,
    ),
    "/Konfigurator?product=cabinet&lv_campaign=smoke_google_mobile_v1#details",
  );
  assert.equal(campaignLink("mailto:hello@example.com", origin), null);
  assert.equal(campaignLink("/login", origin), null);
});
