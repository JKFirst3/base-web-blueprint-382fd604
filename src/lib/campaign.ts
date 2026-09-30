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

export function campaignLink(href: string, origin: string): string | null {
  const url = new URL(href, origin);
  if (url.origin !== origin || !["/", "/Konfigurator", "/aboutLavidro", "/kontakt", "/datenschutz", "/impressum"].includes(url.pathname)) return null;
  url.searchParams.set(CAMPAIGN_PARAM, SMOKE_CAMPAIGN);
  return `${url.pathname}${url.search}${url.hash}`;
}

function tagLink(a: HTMLAnchorElement) {
  const tagged = campaignLink(a.getAttribute("href")!, window.location.origin);
  if (tagged && tagged !== a.getAttribute("href")) a.setAttribute("href", tagged);
}

/**
 * Carries the campaign tag to internal site links when the current page carries it.
 * Timing-independent: tags links already present, links added later (MutationObserver),
 * and re-checks the clicked link in the capture phase right before navigation.
 * Returns a cleanup function.
 */
export function propagateCampaignToSiteLinks(): () => void {
  if (typeof window === "undefined" || !currentCampaign()) return () => {};
  const selector = 'a[href^="/"]';
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
