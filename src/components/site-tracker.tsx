"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/tracking";
import { useConsent } from "@/components/consent-provider";

function linkTarget(href: string) {
  try {
    if (href.startsWith("tel:")) return "call-taxi";
    if (href.startsWith("mailto:")) return "email";
    const url = new URL(href, location.href);
    if (!/^https?:$/.test(url.protocol)) return undefined;
    if (url.hostname !== location.hostname) return `external:${url.hostname}`;
    const path = url.pathname.replace(/\/$/, "");
    const hash = /^#[a-z0-9-]+$/.test(url.hash) ? url.hash : "";
    return /^\/(de|en|nl)(\/[a-z0-9-]+){0,3}$/.test(path) ? path + hash : undefined;
  } catch { return undefined; }
}
export function SiteTracker() {
  const path = usePathname();
  const { hydrated } = useConsent();
  useEffect(() => {
    if (!hydrated) return;
    trackEvent("page_view", { source: "page", path });
    const depths = new Set<number>();
    const click = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest("a") : null;
      if (!a || a.hasAttribute("data-analytics-manual")) return;
      const href = a.getAttribute("href") || "";
      const source = a.dataset.source === "hero" ? "hero" : a.closest("header") ? "header" : a.closest("footer") ? "footer" : a.closest("#rechner") ? "calculator" : a.closest("#services") ? "service" : a.closest("nav") ? "navigation" : "page";
      const params = { source, target: linkTarget(href) };
      if (href.startsWith("tel:")) trackEvent("click_call_now", params);
      else if (href.startsWith("mailto:")) trackEvent("email_click", params);
      else if (a.closest('[aria-label="Sprache / Language"]')) trackEvent("change_language", { ...params, target_language: params.target?.split("/")[1] });
      else if (source === "service") trackEvent("service_click", params);
      else if (params.target?.startsWith("external:")) trackEvent("outbound_click", params);
      else trackEvent("navigation_click", params);
    };
    const scroll = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      if (height <= 0) return;
      const depth = Math.floor((scrollY / height) * 100);
      for (const n of [25,50,75,100]) if (depth >= n && !depths.has(n)) { depths.add(n); trackEvent("scroll_depth", { value: n, path }); }
    };
    // Incremental visibility and activity samples. Long suspended intervals are discarded.
    let last = performance.now();
    let interaction = last;
    let visible = document.visibilityState === "visible";
    let visibleMs = 0;
    let activeMs = 0;
    const sample = () => {
      const now = performance.now();
      const delta = Math.max(0, now - last);
      if (visible && delta <= 120_000) {
        visibleMs += delta;
        activeMs += Math.max(0, Math.min(now, interaction + 60_000) - last);
      }
      last = now;
    };
    const flush = () => {
      sample();
      if (visibleMs >= 1000) trackEvent("page_timing", { path, source: "page", visible_ms: Math.min(120000, Math.round(visibleMs)), active_ms: Math.min(120000, Math.round(activeMs)) });
      visibleMs = 0; activeMs = 0;
    };
    const activity = () => { sample(); interaction = performance.now(); };
    const visibility = () => { flush(); visible = document.visibilityState === "visible"; if (visible) interaction = performance.now(); };
    const timer = window.setInterval(flush, 30_000);
    document.addEventListener("click", click);
    window.addEventListener("scroll", scroll, { passive: true });
    for (const event of ["pointerdown","keydown","scroll","touchstart"]) window.addEventListener(event, activity, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", flush);
    window.addEventListener("cochem:tracking-boundary", flush);
    return () => {
      flush(); window.clearInterval(timer);
      document.removeEventListener("click", click);
      window.removeEventListener("scroll", scroll);
      for (const event of ["pointerdown","keydown","scroll","touchstart"]) window.removeEventListener(event, activity);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("cochem:tracking-boundary", flush);
    };
  }, [path, hydrated]);
  return null;
}
