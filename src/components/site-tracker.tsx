"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/tracking";
export function SiteTracker() {
  const path = usePathname();
  useEffect(() => {
    trackEvent("page_view", { source: "page" });
    const start = Date.now();
    const depths = new Set<number>();
    const click = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest("a") : null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const source =
        a.dataset.source === "hero"
          ? "hero"
          : a.closest("header")
            ? "header"
            : a.closest("footer")
              ? "footer"
              : a.closest("#rechner")
                ? "calculator"
                : a.closest("#services")
                  ? "service"
                  : a.closest("nav")
                    ? "navigation"
                    : "page";
      // Calls are handled here once, including server-rendered links.
      if (href.startsWith("tel:")) trackEvent("click_call_now", { source });
      else if (href.startsWith("mailto:"))
        trackEvent("email_click", { source });
      else if (a.closest('[aria-label="Sprache / Language"]'))
        trackEvent("change_language", { source: "header" });
      else if (source === "service") trackEvent("service_click", { source });
      else if (
        /^https?:/.test(href) &&
        new URL(href).hostname !== location.hostname
      )
        trackEvent("outbound_click", { source });
      else trackEvent("navigation_click", { source });
    };
    const scroll = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      if (height <= 0) return;
      const depth = Math.floor((scrollY / height) * 100);
      for (const n of [25, 50, 75, 100])
        if (depth >= n && !depths.has(n)) {
          depths.add(n);
          trackEvent("scroll_depth", { value: n });
        }
    };
    let recorded = false;
    const finish = () => {
      if (recorded || document.visibilityState !== "hidden") return;
      recorded = true;
      trackEvent("engagement", {
        value: Math.min(3600, Math.round((Date.now() - start) / 1000)),
      });
    };
    document.addEventListener("click", click);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", finish);
    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", finish);
    };
  }, [path]);
  return null;
}
