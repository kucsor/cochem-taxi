"use client";
import Script from "next/script";
import { useEffect } from "react";
import { useConsent } from "@/components/consent-provider";
import { setTrackingConsent } from "@/lib/tracking";
export function Analytics({
  GA_MEASUREMENT_ID: id,
}: {
  GA_MEASUREMENT_ID: string;
}) {
  const { consent } = useConsent();
  useEffect(() => {
    const w = window as any;
    const granted = consent === "granted";
    setTrackingConsent(granted);
    w[`ga-disable-${id}`] = !granted;
    w.dataLayer = w.dataLayer || [];
    w.gtag =
      w.gtag ||
      function () {
        w.dataLayer.push(arguments);
      };
    w.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    if (!granted) {
      for (const item of document.cookie.split(";")) {
        const name = item.split("=")[0].trim();
        if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
        document.cookie = `${name}=; Max-Age=0; Path=/`;
        const host = location.hostname.split(".");
        for (let i = 0; i < host.length - 1; i++)
          document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${host.slice(i).join(".")}`;
      }
    } else {
      w.gtag("js", new Date());
      w.gtag("config", id, { page_path: location.pathname });
    }
  }, [consent, id]);
  if (!id || consent !== "granted") return null;
  return (
    <Script
      id="ga-loader"
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
      strategy="afterInteractive"
    />
  );
}
