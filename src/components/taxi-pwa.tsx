"use client";
import { useEffect } from "react";

export function TaxiPwa() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    if (location.hostname === "insights.cochem-taxi.de") return;
    void (async () => {
      // Remove only the obsolete admin registration, never the customer worker/cache.
      for (const registration of await navigator.serviceWorker.getRegistrations()) {
        const worker = registration.active || registration.waiting || registration.installing;
        if (new URL(registration.scope).pathname === "/admin" &&
            worker && new URL(worker.scriptURL).pathname === "/admin-sw.js") {
          await registration.unregister();
        }
      }
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    })().catch(() => { /* Browsing still works when service workers are unavailable. */ });
  }, []);
  return null;
}
