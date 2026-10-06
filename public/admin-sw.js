/* Dedicated admin worker: never store authenticated pages or statistics. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin &&
      (url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/api/"))) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
  }
});
