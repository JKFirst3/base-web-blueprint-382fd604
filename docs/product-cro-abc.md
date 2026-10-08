# Lavidro product-page CRO (Meta ad landings)

The original homepage layout, imagery, existing products and price models stay in place. Only the product landing pages (/Konfigurator) are used for A/B/C experiments.

## Test URLs

- Mobile: `/Konfigurator?product=mobile&lv_variant=a` (or `b` / `c`)
- Cabinet: `/Konfigurator?product=cabinet&lv_variant=a` (or `b` / `c`)
- One: `/Konfigurator?product=one&lv_variant=a` (or `b` / `c`)

An absent, uppercase or unsupported variant defaults to A. Ads allocate cohorts; the client does not randomize. Continue to attach the existing `lv_campaign` key per ad and product.

## Design principles

- One emotional headline + one short sentence + two benefits + price + CTA.
- Original background/product assets remain unchanged. Home navigation stays in place.
- Lavidro integrates robotics from other manufacturers; avoid implying that Lavidro manufactures robots.
- One focuses on targeted stain treatment and ironing / smoothing creases: "Lieblingsstück schonend reinigen, Knitterfalten glätten."
- Target conversion: a waitlist request and a personal consultation to check the household's needs. Double opt-in is needed to confirm email; submitting an inquiry creates no payment obligation.
- Development status and planned 2027 launch stay disclosed in small text.
- 8,300 EUR is a modelling assumption for Mobile/Cabinet only: 8 h × 20 EUR/h × 52 weeks. It is an indicative labour-value comparison, not guaranteed cash saving.

## Measurement

After analytics consent, PostHog tracks the sanitized `variant_id` (a, b, c) only on product-specific events alongside `product_id`. The same-origin ingestion gate rejects unapproved variants and any free text. There is no query string in outgoing event URLs.

Primary KPI: `purchase_interest_submitted` per product/variant/campaign. Supporting KPIs: `purchase_interest_started`, verified double-opt-in completions and consultation qualification.

Do not mix mobile/cabinet/one segments, or sale and regular-price campaigns when comparing variants. Keep budget and creative as comparable as possible, and do not interpret random fluctuations as proven uplift.

## Regression checklist

- Nine product/variant URLs display the matching image and A/B/C headline.
- Same product image URLs remain, including original Lovable assets.
- Both responsive CTA buttons open the same existing preorder dialog.
- Normal and campaign sale prices match the values validated on the server.
- One never displays the 8,300 EUR model and uses stain treatment + ironing.
- Optional household / customer answers remain available but collapsed by default.
- Payment choice, privacy consent, double-opt-in and logged mail delivery remain intact.
- No PostHog variant property is sent before analytics consent.
- Gate tests accept a/b/c only with valid product IDs; reject unknown variants.
