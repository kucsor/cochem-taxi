# Municipality analytics — cumulative PR 43

This branch includes the complete activity-diagnostics change from PR 42. Merge this PR directly into main; merging PR 42 first is unnecessary.

## New place capture

Structured map `place` features (municipalities) and `place.*` context entries identify towns beyond the former hand-maintained list. Districts, neighbourhoods, streets, house numbers and the raw search string are never used as a fallback town name. Existing Cochem-area towns, airports and landmarks retain their categories. New municipalities use a bounded key with region/country, a place-level identifier and the municipality name. Regional identifiers distinguish same-named towns. German map labels keep names consistent between interface languages.

Manual, unselected addresses now perform the forward lookup before recording the calculation start. The resulting coordinates go to the existing calculator, which skips its duplicate geocode; the municipality goes to analytics. Selected places and successful GPS lookups reuse their existing result. No extra lookup is added for an already selected place. Required lookups use the existing Mapbox account and quota; no new service or paid tier is enabled.

A failed lookup records the applicable geocoding error. Missing municipality metadata remains unknown, even if routing is possible; no street or nearby town is guessed. Leaving/editing before lookups complete can omit the calculation start. Stale lookups must not clear the latest estimate's call association or pending state.

Only municipality-level keys enter Supabase. Exact addresses and coordinates continue to be used transiently for route calculation, not included in analytics. DE/EN/NL privacy descriptions now reflect the municipality fields. The calculator's existing country coverage is unchanged.

## Reporting and migration

Charts, route ranking, search, activity details and CSV use readable municipality/region labels rather than internal keys. Existing rollups, retention and private access remain unchanged. Historical `other` and missing-place events cannot be reconstructed and are labelled as such. New typing signals that cannot identify a place remain unknown; no raw query is collected.

Migration `20261009133722_dynamic_localities.sql` expands the two place constraints and is already applied to Supabase. The PR 42 diagnostics migration is also applied. The deployed gateway already passes these fields through, so no Edge deployment is required. Both migrations remain compatible with the current production frontend.

## Validation

- Unit tests cover unlisted municipalities, manual-address context, neighbourhood/district exclusion, German names, same-name regional distinction, and rejection of raw address-like keys.
- `verify-localities-sql.mjs` checks accepted dynamic keys, historical preservation, route/session/call aggregates, log detail, filters, limits and private RPC access.
- `verify-route-capture.mjs` checks selected and manually typed places, airport presets, failure reasons, consented call association and no street/address content in captured events.
- `verify-insights-ui.mjs` checks dynamic route names plus the cumulative PR 42 log and responsive layouts.
- `verify-localities-live.mjs` checks authenticated Next API → gateway → Supabase → dashboard response, duplicates and privacy validation in preview only. Test rows and rollups are removed after the run.
