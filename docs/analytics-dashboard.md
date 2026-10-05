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

Dashboard contains views, phone clicks, calculator starts/success/errors, page sessions with consent, daily and hourly charts, page/source/device/language/event/call-placement/error/scroll tables, previous-period comparisons, and CSV daily export.
Filters: dates, language, device and environment. Dates and daily buckets are UTC. Maximum query interval 366 days; retention 90 days. Production, preview and development never mix.

Phone clicks are not completed calls or rides. Calculator starts are emitted on submission, and success/error once on response; cancelled or interrupted requests can make totals differ. Ratios are event ratios, not unique-person conversion rates.
No calculator addresses, GPS, query strings, raw IP addresses or free-text errors enter event records. Referrers store hostname only. Without consent events have no visitor identifier. With consent a random in-memory page-session identifier groups events; reload creates a new session. Therefore the dashboard does **not** claim unique visitors. The existing Vercel Analytics remains available for its own visitor metric. DNT/GPC suppress custom analytics. Browser blockers and forged events remain possible.
A daily HMAC-derived IP value is stored separately for abuse prevention and is not linked to analytics events. Expired rate buckets are pruned daily; admin sessions hourly; events after 90 days. Infrastructure providers may retain their own operational logs.

## Audit changes

1. Airport endpoints have fixed airport destinations, support Luxembourg, require pickup in the Cochem zone, and reject airport-origin transfers. Coordinates identify an approximate airport approach point; terminal details are confirmed by telephone.
2. Calculator clears outdated results; ignores superseded responses; aborts stale suggestions; uses Europe/Berlin time; shows approximate travel minutes; handles rate/error status; validates finite coordinates; uses road distance from Cochem to pickup for approach cost.
3. Tariff constants moved out of the client module. Invalid languages are rejected. Unsupported maps show a fallback. Attribution is preserved.
4. GA consent withdrawal disables GA and clears its first-party cookies. Custom statistics and call tracking are centralized without double-counting telephone anchors.
5. Service cards link to relevant pages; calls consistently use +49; unsupported numerical marketing claims removed; privacy disclosures updated in DE/EN/NL.
6. Type errors fail builds; source checks, tariff/privacy unit tests, HTTP integration checks and CI added.

## Verification

The existing lockfile was created with legacy peer resolution; CI uses `npm ci --legacy-peer-deps` to reproduce it. The unused `@genkit-ai/next` adapter (Next 15 peer requirement) was removed.

`npm run check` — source invariants, TypeScript, unit tests.
`npm run build` — complete production build and static pages.
`node --env-file=.env.local scripts/integration-check.mjs` — starts a production server in the same test process environment and checks authentication, CSRF, copied-token revocation, tracking, filters, invalid input, 404 responses and airport routes. Requires configured test backend and Mapbox. It uses an isolated random test password and development events. The printed test event IDs identify test-only records for cleanup. Never print session tokens or environment values.

Browser review should include consent accept/revoke, DE/EN/NL navigation, calculator edits, keyboard use and the dashboard. Real-device installation and phone-call completion require a real device; no call is placed by automated tests.

Verified during implementation: production build passed; all 15 airport locale pages responded 200; three missing-path tests responded 404; authentication, wrong-origin rejection, tampered-token rejection, logout revocation, event validation/idempotency, report access/filter validation and all five real Mapbox routes passed. Browser visual review was blocked by a cloud-browser timeout.
