# Dashboard activity diagnostics

Overview no longer displays average fare or sampled engagement. A fare estimate is a calculator output, not revenue. Visits and phone-button clicks cannot establish earnings or completed bookings.

The Features activity log includes the newest 200 records matching the global dates, language, device and environment. Reliability has an independent newest-100 calculation-error log, so page views cannot crowd errors out. Both show Berlin timestamps, expandable safe context and filtered CSV export (UTC timestamps). Search/type controls filter the loaded window; narrow the global date range for older records. Raw retention remains 90 days and aggregate retention 730 days. Session identifiers, addresses, coordinates and free-text provider errors are not returned.

New calculation failures preserve allowlisted API codes including `cochem_only`, `forbidden` and endpoint-specific geocoding errors. Unknown codes become `request_failed`. Historical generic failures remain unexplained; do not infer a cause retrospectively. A service-rule rejection is not necessarily a technical outage.

The routes view explains pickup → destination, repeated calculations, incomplete-route coverage and the difference between an estimate and earnings. Historical routes remain unverified.

## Deployment

`20261009121859_activity_diagnostics.sql` was applied to the existing Supabase project on 2026-10-09. It expands the outcome constraint and replaces the report function without changing stored events or aggregates. The existing gateway forwards the expanded report and codes; no Edge redeployment or new service is required. Deploy this frontend PR after the migration. The previous frontend remains compatible.

## Verification

- `npm run check` and production build.
- `PGLITE_MODULE=... node scripts/verify-diagnostics-sql.mjs`: additive migration, error context, independent error cap, global filters, route history and private RPC.
- `scripts/verify-insights-ui.mjs`: protected API, synthetic error disclosure/search/export, removed Overview metrics, 360/390/768/1440 layouts and existing navigation/filter states.
- Read-only check through the deployed gateway confirms detailed historical errors and route reports coexist.
- Supabase security advisor: no warnings/errors; four unchanged informational deny-all RLS notices.
