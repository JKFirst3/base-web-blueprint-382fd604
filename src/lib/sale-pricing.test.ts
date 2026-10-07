import assert from "node:assert/strict";
import { test } from "node:test";
import { SALE_CAMPAIGNS, PRODUCT_CAMPAIGNS } from "./campaign.ts";
import { salePrices } from "./sale-pricing.ts";

test("sale quotes are only enabled by a matching fixed product campaign", () => {
  const regular = { mobile: [22990, 469], cabinet: [20449, 390], one: [8990, 199] };
  for (const product of Object.keys(regular) as (keyof typeof regular)[]) {
    const offer = salePrices(product, SALE_CAMPAIGNS[product])!;
    assert.ok(Number.isInteger(offer.price) && offer.price <= regular[product][0] / 2);
    assert.ok(Number.isInteger(offer.monthly) && offer.monthly <= regular[product][1] / 2);
    assert.equal(salePrices(product, PRODUCT_CAMPAIGNS[product]), null);
    assert.equal(salePrices(product, null), null);
    assert.equal(salePrices(product, "sale"), null);
    const otherCampaign = Object.entries(SALE_CAMPAIGNS).find(([key]) => key !== product)![1];
    assert.equal(salePrices(product, otherCampaign), null);
  }
  assert.equal(salePrices("__proto__", "sale"), null);
});
