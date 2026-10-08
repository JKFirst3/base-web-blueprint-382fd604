# LAVIDRO Funnel Admin – production setup

**Scope:** Feature branch `feat/agentic-funnel-admin-audit`, reviewed in draft PR #1. Do not merge until database migration + live connector contract checks + browser QA pass. Lovable is assumed correctly configured; never commit credentials.

## Routes and security

- Public site footer brand link: `/admin/funnel` (password form).
- Admin API: `/api/admin/funnel?days=7|30|90` (read), `/api/admin/funnel-qualification` (manual update), `/api/admin/funnel-session` (login/logout/status).
- Password: deployment-only `FUNNEL_ADMIN_PASSWORD` (use the privately agreed value); **do not include in any `VITE_` environment variable or GitHub repository**.
- HMAC cookie signing: `FUNNEL_ADMIN_SESSION_SECRET` (random 64+ chars), signed HttpOnly Strict 8-hour cookie scoped to `/api/admin`. HTTPS required in production.
- Edge-level rate limiting for login and submission is advised; per-instance limits alone are not distributed. Prefer a person-specific Supabase admin-role login if extending beyond aggregate analysis.
- Service-role Supabase key is used only in server files. No anonymous database writes.

## Server-only connector variables

| Service | Secrets / IDs | Required privilege |
| --- | --- | --- |
| Existing database | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Existing server secret |
| PostHog EU | `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID` | Read/query analytics and experiment list |
| Meta | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | `ads_read` on intended business ad account |
| Meta optional | `META_GRAPH_API_VERSION` | Current approved Graph API version; currently defaults to v26.0 |

The Meta account's **actual currency and timezone** are retrieved automatically. Do not hard-code EUR for Meta totals. API tokens never appear in the browser.

Official docs: [PostHog API](https://posthog.com/docs/api), [PostHog querying](https://posthog.com/docs/data-warehouse/query), [PostHog experiments](https://posthog.com/docs/experiments), [Meta Marketing API](https://www.postman.com/meta/facebook-marketing-api/documentation/0zr4mes/facebook-marketing-api-mapi), [TanStack server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes).

## SQL migration order

1. `20261008172000_lock_public_inserts.sql` – revoke anonymous inserts (existing server submission routes already use service role).
2. `20261008173500_funnel_qualification.sql` – admin-only manual qualification state, RLS.
3. `20261008190000_funnel_source_stats.sql` – service-role-only PII-free cohort aggregation; after qualification table exists.

Run migrations via the same production database migration process as the existing Supabase migrations. Confirm `admin_funnel_source_stats` EXECUTE is granted **only** to service_role. Verify a public anon/authenticated token cannot insert into `leads`, `preorders`, `lead_qualifications` or execute that RPC.

## Semantics

- Meta reads ad-level Insights, creatives, optional `url_tags` and valid LAVIDRO landing destinations. Traverses paginated data with strict page/result caps; refuses untrusted pagination URLs.
- Historical `smoke_google_*` values intentionally remain. To attribute an ad, its final destination (or URL Tags) must contain a valid known `lv_campaign`. Meta dynamic parameters not resolved by API are marked unmatched, not silently guessed.
- PostHog EU: **only consented events** from `site_environment='production'`. Distinguish event count, unique anonymous visitors, unique sessions; an event-count series is not a true same-session funnel.
- Supabase: requested, confirmed and manually qualified **product inquiries** grouped by preorder creation date, for identical Meta-account calendar-day boundaries. Newsletter/contact requests remain separate even though the legacy stored `request_type=termin` is unchanged.
- **Indicative** tag-based CPQL = Meta spend / qualified source-matched preorder cohort, **only** if every paid ad is uniquely mapped, the account currency is EUR and the numerator/denominator period is aligned. A valid URL tag does not prove a paid click. Shared URLs, untracked paths and organic visitors can still bias the metric; do not optimize ad budgets on this number alone.
- Data sources return `unconfigured`, `error` or `ok`; errors never become zero as if they were measured. CPQL remains unavailable when ambiguous.
- Dashboard reads are cached for 30 seconds, manual qualification invalidates cache.

## Agentic CRO workflow

1. Use the protected `get_funnel_snapshot` MCP tool (Supabase admin OAuth role) for server-aggregated Meta/PostHog/Supabase metrics. No personal contact details are returned.
2. Select each of the three products and its active Meta ads. Compare ad headline, copy, CTA, campaign tag, product and the browser-captured real landingpage. Treat unextracted/ambiguous creative data as unknown; avoid suggesting changes without evidence.
3. Inspect visual customer journey, technical form, accessibility and speed; attach screenshots from the Browser Journey QA artifact.
4. Produce an audit with *severity, evidence, hypothesis, predicted impact, exact file lines, regression tests*. Use GitHub PR for code experiments, PostHog experiment for randomization/statistics, and **get explicit approval** before changing ad creative or budget.
5. Measure by product and acquisition cohort. Avoid experiments underpowered for lead quality; use intermediate metrics with explicit caveats. Never disable consent or submit live test conversions.

See `docs/agentic-funnel-runbook.md` for the executable review checklist.

## Test gate

The PR workflow builds app before TypeScript checking (TanStack generates `routeTree.gen.ts` during build), runs all Node tests and a live HTTP server smoke; a separate Chromium job tests mobile and desktop for all three `/Konfigurator?product=` landing pages and the footer-to-admin route. It uploads a short-lived screenshot/report artifact, with **no real form submission**.

```bash
bun install --frozen-lockfile
bun run build
bun run typecheck
bun run test
# with disposable local server credentials:
node scripts/funnel-http-smoke.mjs
# in a Playwright-equipped runner:
node scripts/funnel-browser-smoke.mjs
```

**Release checklist:** all required GitHub checks green; run migrations; secrets available to actual TanStack runtime; read-only PostHog/Meta API requests verified with their real account access; compare same-period insight aggregates in Meta Ads Manager and PostHog; preview /admin/funnel login + qualification; check iOS Safari. No claim of real API connectivity can be made from the CI mock tests alone.
