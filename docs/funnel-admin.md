# LAVIDRO Funnel Admin (branch feature)

Route: `/admin/funnel`. Link: Footer-Copyright/Brand. **Backend-only password** — the password is never placed in source or sent to the browser except in the intentional sign-in POST body over HTTPS.

## Required secrets (Lovable deployment/server configuration)

- `FUNNEL_ADMIN_PASSWORD`: set to the password agreed with the repository owner (never commit it).
- `FUNNEL_ADMIN_SESSION_SECRET`: a new random secret of at least 32 characters, preferably 64+; do not reuse the password.
- Existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Optional for real aggregate analytics:
- `POSTHOG_PERSONAL_API_KEY` — **personal read-only API key**, separate from the existing public `POSTHOG_API_KEY` capture token.
- `POSTHOG_PROJECT_ID` — numeric EU project ID.
- `META_ACCESS_TOKEN` — token with account insight read permissions.
- `META_AD_ACCOUNT_ID` — numeric ID, optional `act_` prefix.
- `META_GRAPH_API_VERSION` — defaults to `v26.0`.
- `META_AD_ACCOUNT_CURRENCY` — defaults to EUR; set actual Meta account currency.

No credentials should use `VITE_` prefix. The status page reports unconfigured/error without disclosing secrets. The public root PostHog ingestion/consent code and legacy smoke campaigns remain unchanged.

## SQL migrations

Apply in order: `20261008172000_lock_public_inserts.sql`, `20261008173500_funnel_qualification.sql`. Ensure both public HTTP submission handlers run under the existing service-role server client before revoking direct public database insert grants.

## Interpretation / boundaries

- Meta: account-level spend, link clicks and impressions, not creative-level attribution.
- PostHog: consented-only event counts, production-host filtered; no session replay.
- Supabase: request counts, DOI and qualified rows; newsletter entries remain typed `termin` due to the owner's explicit instruction.
- CPQL remains unavailable until spend↔qualified lead attribution is valid; **do not** compute it from incompatible counts.
- Manual qualification is tracked by `lead_qualifications`, not by PostHog or Meta.
- Admin uses a shared password and server-signed HttpOnly Strict cookies with 8-hour TTL. Suitable for limited aggregate/internal use but not individual customer PII dashboards. Configure edge WAF rate limits for `/api/admin/funnel-session`; in-memory throttling is per instance only. A Supabase admin-role login is preferable before granting personal lead detail access.
- User-facing query errors are sanitized; all APIs use `Cache-Control: no-store`.

## Verification / regression checklist

```sh
bun install --frozen-lockfile
bun run build  # regenerates routeTree.gen.ts
bun run typecheck
bun run test
# For a running local server with throwaway FUNNEL_ADMIN_PASSWORD and FUNNEL_ADMIN_SESSION_SECRET:
node scripts/funnel-http-smoke.mjs
bun run lint
```

Check manually after configuring secrets and migrating: footer from / and /aboutLavidro and /Konfigurator, failed/valid login, tampered/expired session, logout, API 401 without cookie, 403 cross-origin writes, actual Meta and PostHog statuses, qualification persisted and no PII in JSON responses. Test endpoints on a staging deployment before production. **No credentials and no PII in screenshots or CI logs.**

See `src/lib/admin/*.test.ts` and `src/lib/lead-request.server.test.ts` for automated checks. Admin route is excluded from site funnel capture.
