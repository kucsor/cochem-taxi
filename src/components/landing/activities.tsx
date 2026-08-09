"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { useConsent } from "@/components/consent-provider";
import {
  GYG_DEFAULT_ITEM_COUNT,
  GYG_WIDGET_SCRIPT,
  getGygSearchUrl,
  getGygWidgetProps,
  hasAffiliatePartnerId,
} from "@/lib/affiliates";
import { trackEvent } from "@/lib/tracking";
import type { Locale } from "@/i18n-config";

export type ActivitiesDictionary = {
  badge: string;
  title: string;
  subtitle: string;
  seeAll: string;
  disclosure: string;
  consentTitle: string;
  consentDescription: string;
  consentButton: string;
};

type ActivitiesProps = {
  dict: ActivitiesDictionary;
  lang: Locale;
  /** Search term for the widget, e.g. "Cochem" or "Burg Eltz". */
  query?: string;
  count?: number;
  className?: string;
};

export function Activities({
  dict,
  lang,
  query = "Cochem",
  count = GYG_DEFAULT_ITEM_COUNT,
  className = "",
}: ActivitiesProps) {
  const { consent, accept } = useConsent();
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);

  // Count how often the section is actually seen. Clicks *inside* the widget
  // iframe are cross-origin and cannot be observed from here - those numbers
  // come from the GetYourGuide partner dashboard.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || hasTrackedView.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasTrackedView.current) {
            hasTrackedView.current = true;
            trackEvent("view_activities", { query });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  // No partner ID configured (local dev, forks) - render nothing at all.
  if (!hasAffiliatePartnerId()) return null;

  const granted = consent === "granted";

  return (
    <section
      ref={sectionRef}
      aria-labelledby="activities-heading"
      className={`w-full max-w-4xl mx-auto ${className}`}
    >
      <Reveal duration={0.6} className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-3">
          <Ticket className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">{dict.badge}</span>
        </div>
        <h2 id="activities-heading" className="text-2xl md:text-3xl font-bold font-headline">
          {dict.title}
        </h2>
        <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          {dict.subtitle}
        </p>
      </Reveal>

      {granted ? (
        <>
          <Script id="gyg-widget-script" src={GYG_WIDGET_SCRIPT} strategy="lazyOnload" async />
          {/* The widget is a cross-origin iframe painting its own light surface,
              which our CSS cannot reach. So instead of fighting it, the panel
              itself is light: the widget blends into it and the whole thing
              reads as one deliberate card, lifted off the dark page by the gold
              ring and shadow. */}
          <div className="overflow-hidden rounded-3xl bg-white p-3 shadow-2xl shadow-black/60 ring-1 ring-primary/30 md:p-4">
            <div
              {...getGygWidgetProps({ lang, query, count })}
              // Reserve space so the widget loading does not shift the layout.
              className="min-h-[320px]"
            />
          </div>
          <div className="mt-4 text-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/20 glass-card hover:bg-white/10"
            >
              <a
                href={getGygSearchUrl({ lang, query })}
                target="_blank"
                rel="noopener sponsored"
                onClick={() => trackEvent("click_affiliate_link", { query })}
              >
                {dict.seeAll}
              </a>
            </Button>
          </div>
        </>
      ) : (
        <Reveal delay={0.1}>
          <div className="glass-card glass-card-hover rounded-2xl border border-white/10 p-6 text-center">
            <h3 className="text-base font-semibold text-foreground">{dict.consentTitle}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{dict.consentDescription}</p>
            <Button
              className="mt-4 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
              onClick={() => {
                accept();
                trackEvent("consent_accept", { source: "activities" });
              }}
            >
              {dict.consentButton}
            </Button>
          </div>
        </Reveal>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground/80">{dict.disclosure}</p>
    </section>
  );
}
