"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent-provider";

export function Analytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
  const { consent } = useConsent();

  // Google Analytics sets cookies, so it may only load after explicit consent.
  if (!GA_MEASUREMENT_ID || consent !== "granted") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
