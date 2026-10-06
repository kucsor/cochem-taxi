# Cochem Taxi analytics and audit implementation

## Deployment

Branch is intended for a reviewable PR. Merging deploys through the existing Vercel integration.
Admin URL: `/admin`; username is configured server-side (`kuxor`). Password is never committed. No public signup.
Dedicated Supabase project: `cochem-taxi-analytics` (`zticpqpmztfzubfkltvx`), Frankfurt, organization `kuxor`.

Server-only Vercel variables (already configured for production and preview):
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`: `salt:hex(scrypt(password,salt,64))`
- `ADMIN_SESSION_SECRET`: random signing key
- `ANALYTICS_GATEWAY_URL`
- `ANALYTICS_GATEWAY_SECRET`: random gateway credential

The password hash, session secret and gateway secret are Vercel sensitive variables. Never prefix them with `NEXT_PUBLIC_`.
The Edge Function uses its platform-provided secret key; no Supabase secret key goes to the browser or Vercel.
`supabase/schema.sql` and `supabase/admin-sessions.sql` describe the installed schema. Migrations were applied with Supabase tooling.
To redeploy `analytics-gateway`, replace `__GATEWAY_SECRET_SHA256__` with the SHA-256 of the existing gateway credential. The deployed function verifies this credential itself, hence platform JWT verification is disabled. Never deploy the placeholder unchanged.

## Security

- Scrypt password hash with independent random salt; constant-time hash comparison.
- Signed, random admin session, checked against revocable database sessions on every statistics request; maximum 8 hours.
- HttpOnly, Secure (production), SameSite=Strict, host-only cookie. Logout invalidates copied sessions too.
- Same-origin enforcement on mutations, input limits, validation, durable rate limits (login 5 / 15 minutes; calculator 20 / minute; events 120 / minute per server-derived IP key).
- Database RLS enabled, no public policies, all anon/authenticated privileges revoked. This deliberate deny-by-default setup produces informational `RLS enabled, no policy` advisor entries. Only the Edge Function service role can access data.
- Database functions use security invoker and fixed search_path; execution revoked from public/anon/authenticated.
- API responses and admin data are not cached; PWA runtime cache excludes API/admin and precaching excludes admin HTML. Admin has no search indexing or public analytics.
- Rotate password by generating a new salted hash and updating the sensitive Vercel variable; redeploy. The old hash is bound into session signatures, so rotation invalidates old sessions. No password recovery endpoint or MFA is included.

## Measurement definitions

The English Insights dashboard has Overview, Destinations, Features, Audience and Reliability sections. It is responsive at phone, tablet and desktop widths, with reduced-motion support. All charts use real backend data; screenshots under docs/previews use synthetic fixtures and are not traffic reports.

Filters: dates, language, device and environment. All new dashboard date buckets and hours use Europe/Berlin (DST-aware); the legacy `/api/admin/stats` endpoint retains its original UTC semantics for backward compatibility. Presets cover today through two years; daily, weekly and monthly trend aggregation preserves partial periods. CSV exports daily totals, all breakdowns, destination metrics and monthly destination trends. JSON contains the full filtered report. Auto-refresh is optional and polls every 60 seconds only while the page is visible.

Raw events remain for 90 days. A transactionally updated aggregate table retains counters without session IDs for 730 days. Duplicate event UUIDs cannot increment aggregates twice. Existing retained events are backfilled once, with unknown destination rather than inferred data. Expired historical events cannot be restored. Previous-period comparisons are equal-length immediately preceding periods; baseline coverage may be incomplete.

Destinations are a fixed allowlist of airports, local towns and landmarks, plus other/unknown. Classification happens before transmission in the browser, is approximate, and never sends exact addresses/search strings. Searches count changes of category after a typing pause, not every character or unique searches. Autocomplete choices and calculation submissions/results are separate events. Passenger groups and requested day/night tariff are recorded on submission. Successful estimates contribute fare/distance averages; these are not revenue. Location permission success/failure, map controls and other feature events are visible separately.

Phone clicks are not completed calls or rides. Calculator starts are emitted on submission, and success/error once on response; cancelled or interrupted requests can make totals differ. Ratios are event ratios, not unique-person conversion rates.
No calculator addresses, GPS, query strings, raw IP addresses or free-text errors enter event records. Referrers store hostname only. Without consent events have no visitor identifier. With consent a random in-memory page-session identifier groups events; reload creates a new session. Therefore the dashboard does **not** claim unique visitors. The existing Vercel Analytics remains available for its own visitor metric. DNT/GPC suppress custom analytics. Browser blockers and forged events remain possible.
A daily HMAC-derived IP value is stored separately for abuse prevention and is not linked to analytics events. Expired rate buckets are pruned daily; admin sessions hourly; events after 90 days. Infrastructure providers may retain their own operational logs.

## Audit changes

1. Airport endpoints have fixed airport destinations, support Luxembourg, require pickup in the Cochem zone, and reject airport-origin transfers. Coordinates identify an approximate airport approach point; terminal details are confirmed by telephone.
2. Calculator clears outdated results; ignores superseded responses; aborts stale suggestions; uses Europe/Berlin time; shows approximate travel minutes; handles rate/error status; validates finite coordinates; uses road distance from Cochem to pickup for approach cost.
3. Tariff constants moved out of the client module. Invalid languages are rejected. Unsupported maps show a fallback. Attribution is preserved.
4. Google Analytics has been removed; accessible legacy cookies are cleared. Custom statistics and call tracking are centralized without double-counting telephone anchors.
5. Service cards link to relevant pages; calls consistently use +49; unsupported numerical marketing claims removed; privacy disclosures updated in DE/EN/NL.
6. Type errors fail builds; source checks, tariff/privacy unit tests, HTTP integration checks and CI added.

## Verification

The existing lockfile was created with legacy peer resolution; CI uses `npm ci --legacy-peer-deps` to reproduce it. The unused `@genkit-ai/next` adapter (Next 15 peer requirement) was removed.

`npm run check` — source invariants, TypeScript, unit tests.
`npm run build` — complete production build and static pages.
`node --env-file=.env.local scripts/integration-check.mjs` — starts a production server in the same test process environment and checks authentication, CSRF, copied-token revocation, tracking, filters, invalid input, 404 responses and airport routes. Requires configured test backend and Mapbox. It uses an isolated random test password and development events. The printed test event IDs identify test-only records for cleanup. Never print session tokens or environment values.

Browser review should include consent accept/revoke, DE/EN/NL navigation, calculator edits, keyboard use and the dashboard. Real-device installation and phone-call completion require a real device; no call is placed by automated tests.

Verified during implementation: production build passed; all 15 airport locale pages responded 200; three missing-path tests responded 404; authentication, wrong-origin rejection, tampered-token rejection, logout revocation, event validation/idempotency, report access/filter validation and all five real Mapbox routes passed. Browser visual review was blocked by a cloud-browser timeout.

## Insights rollout — backend activated 2026-10-06

The user approved activation subject to no added charges. Organization `kuxor` was verified on Supabase Free before proceeding. No paid resources, upgrade or new project were created. Database size after activation: approximately 11 MB of the current 500 MB Free allowance. Free quotas still apply.

The production migration was applied, the gateway deployed as version 4, and live backend verification passed. CI and the Vercel preview build also passed. The frontend PR is ready for merge. The steps below document the completed backend rollout (do not reapply the migration):

1. User explicitly authorized `supabase/insights.sql` for project `zticpqpmztfzubfkltvx`: add validated event fields/names, create private `analytics_daily`, install an insert rollup trigger/report functions, backfill retained events, schedule deletion of aggregates older than 730 days. Raw-event retention remains 90 days. No existing event data is deleted by the migration itself.
2. Apply the SQL as one migration/transaction. It is an apply-once migration, not an idempotent setup script. A constraint change requires a short exclusive table lock; schedule for low traffic.
3. Deploy the updated analytics-gateway with the existing secret digest substituted securely and the existing custom authentication preserved. Both legacy stats and new insights actions are supported.
4. Verify production/preview isolation, the new report, public-access denial and advisors. Test collection using preview events only.
5. Remaining step: merge the frontend PR. New fields and event names require the updated schema and gateway. Confirm first real data and privacy copy, then close the draft status.

Rollback frontend/gateway if necessary; the additive database table and trigger can remain without breaking the old dashboard. Do not drop analytics data as part of rollback.

## Reproducible insights checks

- `npm run check`: existing checks plus destination privacy, metric validation, time grouping and CSV formula-injection tests.
- `npm run build`: production build.
- `scripts/verify-insights-sql.mjs`: isolated PGlite PostgreSQL test. Install `@electric-sql/pglite@0.3.14` in a temporary validation directory and set `PGLITE_MODULE` to its module entry. Tests schema, service-role insert/rollup, idempotency, Berlin date boundaries, filters, aggregate survival after raw deletion and denied anon table/report access. pg_cron scheduling is stubbed; actual production scheduling remains to be verified after approval.
- `scripts/verify-insights-ui.mjs`: local browser contract test with synthetic intercepted reports, not a claim of deployed end-to-end database verification. Set PLAYWRIGHT_MODULE and CHROMIUM_MODULE to local Playwright and @sparticuz/chromium installations. Tests protected API, desktop/phone/tablet, navigation, filters, exports, empty/error states and screenshots.

Live verification after approval: local production app → API → live Edge Function → database → authenticated report passed. Valid destination metrics persisted once despite duplicate UUID; arbitrary destination text was rejected; preview data stayed separate from production; legacy stats and logout revocation passed. Dedicated synthetic preview event and its aggregate were removed after verification. Retention cron jobs are active. Public table/report access is denied; Supabase advisor reports only expected informational deny-by-default RLS notices.
