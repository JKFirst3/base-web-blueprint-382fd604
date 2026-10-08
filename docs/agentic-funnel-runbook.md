# Agentic Meta → Landingpage → Qualified Lead audit

## Rules

- **Read first; propose PRs second.** Never send test leads to production, change a real campaign budget, edit Meta ads, disable cookies/consent, or publish product-page variants without a separate explicit approval.
- Use the existing LAVIDRO GitHub branch and PR. **Do not write to `main`**.
- Keep the three original products and legacy `smoke_google_*` campaign identifiers unchanged.
- All evidence must carry the source, timestamp, product, campaign and confidence level. Lack of data is *unverified*, not *healthy*.
- Any code change requires unit tests, TypeScript, build, live HTTP route test and browser QA. No PR merge on failing checks.

## Evidence

1. Read-only MCP tool: `get_funnel_snapshot` for 7/30/90 days.
2. For each active Meta ad: ID, copy, CTA, destination, `lv_campaign`, impressions, link clicks and spend. Flag missing dynamic destinations.
3. PostHog: breakdown by event/product/campaign. Report independent event counts, visitor counts and sessions. No implicit step-through conversion claims across different aggregations.
4. Supabase: date-bound product inquiries, DOI completion, manual qualified state. Compare source-matched cohorts only.
5. Browser snapshots from `funnel-chromium-qa` artifact: /, /Konfigurator?product=mobile, cabinet, one; desktop + 390px viewport. Verify CTA clarity, consent, mobile layout, rendered title, image loading and link navigation.

## Issue schema

```json
{
  "severity": "high | medium | low",
  "product": "mobile | cabinet | one",
  "ad_id": "Meta ad ID or null",
  "claim": "What is wrong, not a guess",
  "evidence": "URL, event, code or screenshot",
  "customer_impact": "Exact point of friction",
  "fix": "Minimal PR change",
  "guardrail": "Consent, performance, functional regression",
  "experiment": "A/B/C only if testable",
  "metric": "Qualified product inquiries / source cohort",
  "validation": "Build + browser + real analytics cross-check"
}
```

## Experiments

- Prefer one hypothesis per variant and one product per experiment; do **not** randomize or pool all three different products as if one homogeneous population.
- PostHog currently supplies a read-only list of experiments. Creating a draft or activating a flag must be done deliberately by an authorized human or a separately approved tool workflow.
- Before an experiment, set event/attribution guardrails, variant exposures and sample-size assumptions. The app's existing consent gate stays authoritative.
- Treat tag-based CPQL as indicative. Budget changes require Ads Manager validation against attributed qualified outcomes and human approval.

## Artifacts

- `/admin/funnel` → Overview, Meta & CRO, Sources, Lead Quality, Agent Audits
- `/.github/workflows/funnel-checks.yml` → CI and Chromium screenshot evidence.
- `scripts/funnel-http-smoke.mjs` → full HTTP login/API checks.
- `scripts/funnel-browser-smoke.mjs` → mobile/desktop QA without submissions.

## Live variant storage

Every **new** product inquiry records a validated `variant_id` in `public.preorders` (`a`, `b`, `c`; no synthetic backfill). The service-role RPC groups by `source`, `product`, `variant_id`, allowing qualitative outcomes to be shown next to consented PostHog events. Paid A/B/C traffic from ads is not automatically randomized; compare audience and spend mix before claiming causality.
