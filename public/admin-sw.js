/* Retire the old same-origin worker; keep the dedicated Insights worker network-only. */
const taxiOrigin = ["cochem-taxi.de", "www.cochem-taxi.de"].includes(self.location.hostname);
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(taxiOrigin ? self.registration.unregister() : self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin &&
      (url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/api/"))) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
  }
});
