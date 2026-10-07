# Route analytics v2

The previous text classifier could classify Cochem-Zell district as Zell town. Historical categories are retained as unverified, never backfilled into routes.

## Capture

- Selected Mapbox `place` / `locality` or structured address context identifies an allowlisted place. District and street substrings do not identify towns.
- Curated page presets use exact allowlisted names; airport transfer pages use their configured destination category. Unselected/free-typed endpoints and unresolved GPS places remain unknown; unsupported towns become other.
- Events include origin/destination categories, route_version=2, passenger group, tariff, and successful estimate price/distance. Addresses and coordinates stay out of analytics.
- With existing session consent, a call click can refer to the latest successful estimate in that browser tab for 30 minutes. Place/time/passenger edits, another calculation, failure or consent withdrawal clear attribution. No identifier or attribution is persisted across reloads. DNT/GPC still suppresses events.
- Call clicks are not completed phone calls or bookings. Distinct consenting tab sessions are not unique people.

## Reporting

The new private `analytics_route_insights` RPC wraps the old report. Existing consumers continue to receive their original fields. `routeReport` contains versioned route totals, exact distinct consented sessions, call sessions, passenger/tariff breakdowns, daily route series, interest events and separately labelled history.

Aggregate counts remain available for 730 days. Distinct session metrics use raw events and are unavailable if the range starts more than 89 days before Berlin today. This avoids presenting partial retained data as a complete unique-session count. A call may occur in the range after an estimate just before it; no misleading session conversion percentage is computed.

Automatic charts use days up to 90 days of available route history, weeks up to one year and months beyond. Unknown/unsupported routes are excluded from the default ranking; a checkbox reveals them. Global CSV includes route metrics and a dedicated route CSV exports the filtered route list.

## Rollout status

Migration `20261007184125_route_insights_v2.sql` applied to the existing analytics project on 2026-10-07. Gateway v5 deployed with the existing server-only secret authentication. No new service or paid dependency. Frontend publication remains through the PR.

The new report currently preserves all 11 historic production calculations (7 without destinations); it does not invent routes for them. New place-pair data starts after the updated website is deployed and used.

## Validation

- `npm run check`: ten tests, including district/street regression and consent/expiry/invalidation checks.
- `npm run build`: production build.
- `scripts/verify-routes-sql.mjs`: isolated PGlite migration, historical preservation, deduplication, weighted means, consent coverage, filters, retention and private RPC.
- `scripts/verify-route-capture.mjs`: mocked browser autocomplete/calculate/call flow; no actual calls, production events or Mapbox usage.
- `scripts/verify-insights-ui.mjs`: synthetic dashboard report, 1440/768/390/360 px, expanded details, filters, CSV, empty/error states. Service workers are blocked in this fixture test so they cannot bypass request mocks.
- `scripts/verify-routes-live.mjs`: real authenticated API/Edge/DB/report test in preview only; the generated preview events and aggregates were removed afterward.
- Supabase security advisor: no warnings/errors, only the existing INFO for intentionally private deny-all RLS tables.
