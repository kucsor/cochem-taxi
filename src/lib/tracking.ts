"use client";
import type { AnalyticsEvent } from "./event-schema";
export type TrackedEvent = AnalyticsEvent["name"];
let visit: string | null = null;
export function setTrackingConsent(granted: boolean) {
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
  const data = {
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
  try {
    if (
      localStorage.getItem("cochem-taxi-consent-v1") === "granted" &&
      typeof (window as any).gtag === "function"
    )
      (window as any).gtag("event", name, { source, value: data.value });
  } catch {}
}
