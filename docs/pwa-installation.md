# Two independent Android apps

- Cochem Taxi: https://cochem-taxi.de/
- Cochem Insights: https://insights.cochem-taxi.de/admin

The dashboard uses a separate origin so Android does not treat it as a page inside the installed taxi app. The existing /admin link redirects to the Insights origin. Authentication is still required; host-only cookies mean the first visit to the new origin requires signing in again. Private statistics remain online-only.

## Recovery after the earlier same-origin installation

Wait for this change to deploy. If the old taxi shortcut/app has already changed its name or icon, uninstall that incorrect installed app, then open each URL directly in Chrome and install each separately. Removing the phone installation does not delete statistics stored on the server. Do not clear all Chrome browsing data.

## Validation

`npm run check`, `npm run build`, and `node scripts/verify-admin-pwa.mjs` (Playwright/Chromium required). The browser check verifies two origins in one browser profile, separate app IDs/storage/workers, host redirects, installability, and no offline private API cache. It does not emulate Android WebAPK installation or guarantee immediate refresh of an existing Android shortcut.
