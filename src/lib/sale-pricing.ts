import { SALE_CAMPAIGNS } from "./campaign.ts";

// Rounded down to whole euros: every offer is at least 50% below the regular quote.
const SALE_PRICES = {
  mobile: { price: 11490, monthly: 234 },
  cabinet: { price: 10220, monthly: 195 },
  one: { price: 4490, monthly: 99 },
} as const;

export function salePrices(productId: string, campaign: unknown) {
  if (!Object.prototype.hasOwnProperty.call(SALE_CAMPAIGNS, productId)) return null;
  const product = productId as keyof typeof SALE_CAMPAIGNS;
  return campaign === SALE_CAMPAIGNS[product] ? SALE_PRICES[product] : null;
}
