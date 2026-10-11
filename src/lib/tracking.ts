"use client";
import type { AnalyticsEvent } from "./event-schema";
export type TrackedEvent = AnalyticsEvent["name"];
type Params = Record<string, string | number | undefined>;
type Estimate = { at: number; calculation_id: string; origin?: string | number; destination?: string | number; passengers?: string | number; tariff?: string | number };
const KEY = "cochem-analytics-session-v3";
const TTL = 30 * 60_000;
let granted = false;
let visit: string | null = null;
let touched = 0;
let lastEstimate: Estimate | null = null;
const privacyDisabled = () => navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
export function analyticsId(): string | undefined { try { return crypto.randomUUID(); } catch { return undefined; } }
function save() { try { if (granted && visit) sessionStorage.setItem(KEY, JSON.stringify({ visit, touched, lastEstimate })); else sessionStorage.removeItem(KEY); } catch {} }
export function clearEstimateAttribution() { lastEstimate = null; save(); }
export function setTrackingConsent(value: boolean) {
  try {
    const next = value && !privacyDisabled();
    if (next !== granted && typeof window !== "undefined" && typeof window.dispatchEvent === "function") window.dispatchEvent(new Event("cochem:tracking-boundary"));
    granted = next;
    if (!granted) { visit = null; touched = 0; lastEstimate = null; save(); return; }
    if (!visit) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
        if (saved && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saved.visit) && Date.now() - saved.touched < TTL && Date.now() >= saved.touched) {
          visit = saved.visit; touched = saved.touched; lastEstimate = saved.lastEstimate;
        }
      } catch {}
    }
    // Creation happens in trackEvent, before the first page view.
  } catch { granted = false; visit = null; lastEstimate = null; }
}
export function trackEvent(name: TrackedEvent, params?: Params) {
  // Analytics must never throw into a customer interaction, even with blocked storage/crypto/fetch.
  try {
    if (typeof window === "undefined" || /^\/admin/.test(location.pathname) || privacyDisabled()) return;
    const path = String(params?.path || location.pathname).replace(/\/$/, "");
    if (!/^\/(de|en|nl)(\/[a-z0-9-]+){0,3}$/.test(path)) return;
    let fresh = false;
    if (granted && (!visit || Date.now() - touched >= TTL)) {
      visit = analyticsId() || null; lastEstimate = null; fresh = !!visit;
    }
    touched = Date.now();
    const source = ["header","footer","calculator","hero","navigation","service","page"].includes(String(params?.source)) ? String(params?.source) : /calculator|destination|pickup|passenger|time_change|map|location|locate/.test(name) ? "calculator" : "other";
    let referrer = "";
    try { const host = new URL(document.referrer).hostname; if (host !== location.hostname) referrer = host; } catch {}
    if (name === "use_calculator" || name === "calculator_error") lastEstimate = null;
    if (name === "calculator_success" && visit && params?.route_version === 2) {
      const calculation_id = String(params.calculation_id || analyticsId() || "");
      lastEstimate = calculation_id ? { at: Date.now(), calculation_id, origin: params.origin, destination: params.destination, passengers: params.passengers, tariff: params.tariff } : null;
    }
    const linked = name === "click_call_now" && visit && lastEstimate && Date.now() - lastEstimate.at >= 0 && Date.now() - lastEstimate.at <= TTL ? lastEstimate : null;
    const data = {
      origin: linked?.origin ?? params?.origin, route_version: linked ? 2 : params?.route_version,
      after_estimate: linked ? 1 : undefined, destination: linked?.destination ?? params?.destination,
      passengers: linked?.passengers ?? params?.passengers, tariff: linked?.tariff ?? params?.tariff,
      fare: params?.fare, distance: params?.distance, id: analyticsId(), name, path, visit, referrer,
      device: /iPad|Tablet/i.test(navigator.userAgent) ? "tablet" : /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      source, value: typeof params?.value === "number" ? params.value : undefined, outcome: params?.outcome,
      measurement_version: 3,
      target: params?.target || (name === "click_call_now" ? "call-taxi" : name.replaceAll("_", "-")),
      target_language: params?.target_language ?? params?.language,
      calculation_id: linked?.calculation_id ?? params?.calculation_id,
      call_delay_seconds: linked ? Math.floor((Date.now() - linked.at) / 1000) : undefined,
      visible_ms: params?.visible_ms, active_ms: params?.active_ms,
    };
    save();
    const send = (event: object) => { void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event), keepalive: true }).catch(() => {}); };
    if (fresh) send({ id: analyticsId(), name: "session_start", path, visit, referrer, device: data.device, source: "page", measurement_version: 3 });
    send(data);
  } catch {}
}
