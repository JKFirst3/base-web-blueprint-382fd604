// Smoke-test campaign tag. Only this exact constant is accepted; no UTMs, click IDs
// or other parameters are read. Passed via URL only (no cookie/localStorage/sessionStorage).
export const CAMPAIGN_PARAM = "lv_campaign";
export const SMOKE_CAMPAIGN = "smoke_google_v1";
export const PREORDER_SOURCES = ["configurator", SMOKE_CAMPAIGN] as const;
export type PreorderSource = (typeof PREORDER_SOURCES)[number];

export function currentCampaign(): typeof SMOKE_CAMPAIGN | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(CAMPAIGN_PARAM);
  return value === SMOKE_CAMPAIGN ? SMOKE_CAMPAIGN : null;
}

/** Appends the campaign tag to same-site /Konfigurator links when the current page carries it. */
export function propagateCampaignToProductLinks(root: ParentNode = document) {
  if (!currentCampaign()) return;
  root.querySelectorAll<HTMLAnchorElement>('a[href^="/Konfigurator"]').forEach((a) => {
    const url = new URL(a.getAttribute("href")!, window.location.origin);
    url.searchParams.set(CAMPAIGN_PARAM, SMOKE_CAMPAIGN);
    a.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
  });
}
