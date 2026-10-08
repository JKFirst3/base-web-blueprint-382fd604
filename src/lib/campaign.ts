// Fixed campaign tags only; no UTMs, click IDs
// or other parameters are read. Passed via URL only (no cookie/localStorage/sessionStorage).
export const CAMPAIGN_PARAM = "lv_campaign";
export const SMOKE_CAMPAIGN = "smoke_google_v1";
export const PRODUCT_CAMPAIGNS = {
  mobile: "smoke_google_mobile_v1",
  cabinet: "smoke_google_cabinet_v1",
  one: "smoke_google_one_v1",
} as const;
export const SALE_CAMPAIGNS = {
  mobile: "smoke_google_mobile_sale_v1",
  cabinet: "smoke_google_cabinet_sale_v1",
  one: "smoke_google_one_sale_v1",
} as const;
export const CAMPAIGNS = [
  SMOKE_CAMPAIGN,
  ...Object.values(PRODUCT_CAMPAIGNS),
  ...Object.values(SALE_CAMPAIGNS),
] as const;
export type Campaign = (typeof CAMPAIGNS)[number];
export const PREORDER_SOURCES = ["configurator", ...CAMPAIGNS] as const;

export function validCampaign(value: unknown): Campaign | null {
  return typeof value === "string" && (CAMPAIGNS as readonly string[]).includes(value)
    ? (value as Campaign)
    : null;
}
export type PreorderSource = (typeof PREORDER_SOURCES)[number];

export function currentCampaign(): Campaign | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(CAMPAIGN_PARAM);
  return validCampaign(value);
}

export function campaignLink(
  href: string,
  origin: string,
  campaign: Campaign = SMOKE_CAMPAIGN,
): string | null {
  const url = new URL(href, `${origin}/`);
  if (
    url.origin !== origin ||
    ![
      "/",
      "/Konfigurator",
      "/aboutLavidro",
      "/kontakt",
      "/datenschutz",
      "/impressum",
      "/anfrage-bestaetigen",
    ].includes(url.pathname)
  )
    return null;
  url.searchParams.set(CAMPAIGN_PARAM, campaign);
  return `${url.pathname}${url.search}${url.hash}`;
}

function tagLink(a: HTMLAnchorElement) {
  const campaign = currentCampaign();
  if (!campaign) return;
  const tagged = campaignLink(a.href, window.location.origin, campaign);
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
  const selector = "a[href]";
  const tagAll = () => document.querySelectorAll<HTMLAnchorElement>(selector).forEach(tagLink);
  tagAll();
  const observer = new MutationObserver(tagAll);
  observer.observe(document.body, { childList: true, subtree: true });
  const onClick = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.(selector);
    if (!(a instanceof HTMLAnchorElement) || !currentCampaign()) return;
    tagLink(a);
    const click = e as MouseEvent;
    if (
      click.button !== 0 ||
      click.metaKey ||
      click.ctrlKey ||
      click.shiftKey ||
      click.altKey ||
      a.target === "_blank" ||
      a.hasAttribute("download")
    )
      return;
    const tagged = campaignLink(a.href, window.location.origin, currentCampaign()!);
    // Router Links may navigate using their original props instead of the updated DOM href.
    // Use the actual tagged URL for these links as well, preserving query and fragment.
    if (tagged && !e.defaultPrevented) {
      e.preventDefault();
      window.location.assign(tagged);
    }
  };
  document.addEventListener("click", onClick, true);
  return () => {
    observer.disconnect();
    document.removeEventListener("click", onClick, true);
  };
}
