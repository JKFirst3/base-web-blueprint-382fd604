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

function tagLink(a: HTMLAnchorElement) {
  const url = new URL(a.getAttribute("href")!, window.location.origin);
  if (url.searchParams.get(CAMPAIGN_PARAM) === SMOKE_CAMPAIGN) return;
  url.searchParams.set(CAMPAIGN_PARAM, SMOKE_CAMPAIGN);
  a.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Carries the campaign tag to /Konfigurator links when the current page carries it.
 * Timing-independent: tags links already present, links added later (MutationObserver),
 * and re-checks the clicked link in the capture phase right before navigation.
 * Returns a cleanup function.
 */
export function propagateCampaignToProductLinks(): () => void {
  if (typeof window === "undefined" || !currentCampaign()) return () => {};
  const selector = 'a[href^="/Konfigurator"]';
  const tagAll = () => document.querySelectorAll<HTMLAnchorElement>(selector).forEach(tagLink);
  tagAll();
  const observer = new MutationObserver(tagAll);
  observer.observe(document.body, { childList: true, subtree: true });
  const onClick = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.(selector);
    if (a instanceof HTMLAnchorElement && currentCampaign()) tagLink(a);
  };
  document.addEventListener("click", onClick, true);
  return () => {
    observer.disconnect();
    document.removeEventListener("click", onClick, true);
  };
}
