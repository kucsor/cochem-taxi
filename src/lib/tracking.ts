"use client";
import type { AnalyticsEvent } from "./event-schema";
export type TrackedEvent = AnalyticsEvent["name"];
let visit: string | null = null;
let lastEstimate: { at: number; origin?: string | number; destination?: string | number; passengers?: string | number; tariff?: string | number } | null = null;
export function clearEstimateAttribution() { lastEstimate = null; }
export function setTrackingConsent(granted: boolean) {
  if (!granted) clearEstimateAttribution();
  visit = granted ? visit || crypto.randomUUID() : null;
}
export function trackEvent(
  name: TrackedEvent,
  params?: Record<string, string | number | undefined>,
) {
  if (
    typeof window === "undefined" ||
    /^\/admin/.test(location.pathname) ||
    navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl
  )
    return;
  const path = location.pathname.replace(/\/$/, "");
  if (!/^\/(de|en|nl)(\/[a-z0-9-]+){0,3}$/.test(path)) return;
  const source = [
    "header",
    "footer",
    "calculator",
    "hero",
    "navigation",
    "service",
    "page",
  ].includes(String(params?.source))
    ? String(params?.source)
    : "other";
  let referrer = "";
  try {
    const host = new URL(document.referrer).hostname;
    if (host !== location.hostname) referrer = host;
  } catch {}
  if (name === "use_calculator" || name === "calculator_error") clearEstimateAttribution();
  if (name === "calculator_success" && visit && params?.route_version === 2) {
    lastEstimate = { at: Date.now(), origin: params.origin, destination: params.destination, passengers: params.passengers, tariff: params.tariff };
  }
  const linked = name === "click_call_now" && visit && lastEstimate && Date.now() - lastEstimate.at <= 30 * 60_000 ? lastEstimate : null;
  const data = {
    origin: linked?.origin ?? params?.origin,
    route_version: linked ? 2 : params?.route_version,
    after_estimate: linked ? 1 : undefined,
    destination: linked?.destination ?? params?.destination,
    passengers: linked?.passengers ?? params?.passengers,
    tariff: linked?.tariff ?? params?.tariff,
    fare: params?.fare,
    distance: params?.distance,
    id: crypto.randomUUID(),
    name,
    path,
    visit,
    referrer,
    device: /iPad|Tablet/i.test(navigator.userAgent)
      ? "tablet"
      : /Mobi|Android/i.test(navigator.userAgent)
        ? "mobile"
        : "desktop",
    source,
    value: typeof params?.value === "number" ? params.value : undefined,
    outcome: params?.outcome,
  };
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    keepalive: true,
  }).catch(() => {});
}
