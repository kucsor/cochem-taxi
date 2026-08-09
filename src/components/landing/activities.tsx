"use client";

import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Castle,
  Grape,
  Landmark,
  Map as MapIcon,
  Ship,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import {
  GYG_DEFAULT_ITEM_COUNT,
  getGygSearchUrl,
  hasAffiliatePartnerId,
} from "@/lib/affiliates";
import { orderActivitiesFor, type ActivityCategory } from "@/lib/activities";
import { trackEvent } from "@/lib/tracking";
import type { Locale } from "@/i18n-config";

export type ActivitiesDictionary = {
  badge: string;
  title: string;
  subtitle: string;
  seeAll: string;
  disclosure: string;
  cardCta: string;
};

type ActivitiesProps = {
  dict: ActivitiesDictionary;
  lang: Locale;
  /** Topic of the surrounding page - matching activities are shown first. */
  query?: string;
  count?: number;
  className?: string;
};

const CATEGORY_ICON: Record<ActivityCategory, typeof Castle> = {
  castle: Castle,
  boat: Ship,
  wine: Grape,
  history: Landmark,
  hike: MapIcon,
  daytrip: MapIcon,
};

/**
 * Hand-picked activities, rendered as our own cards.
 *
 * This used to embed the GetYourGuide widget, but that is a cross-origin iframe:
 * it painted a white slab our CSS could not touch, and offered no way to filter
 * by rating. Owning the markup fixes the look, lets us choose what appears, and
 * has two further benefits - the text is server-rendered so Google can index it,
 * and nothing third-party loads, so the section no longer needs cookie consent.
 */
export function Activities({
  dict,
  lang,
  query,
  count = GYG_DEFAULT_ITEM_COUNT,
  className = "",
}: ActivitiesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || hasTrackedView.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasTrackedView.current) {
            hasTrackedView.current = true;
            trackEvent("view_activities", { query: query ?? "cochem" });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  // Without a partner ID the links would earn nothing - show nothing instead.
  if (!hasAffiliatePartnerId()) return null;

  const activities = orderActivitiesFor(query, count);

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

      <Reveal stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {activities.map((activity) => {
          const Icon = CATEGORY_ICON[activity.category];
          return (
            <a
              key={activity.slug}
              href={getGygSearchUrl({ lang, query: activity.query })}
              target="_blank"
              rel="noopener sponsored"
              onClick={() => trackEvent("click_affiliate_link", { query: activity.query })}
              className="group glass-card glass-card-hover flex flex-col rounded-2xl border border-white/10 p-5 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-grow">
                  <h3 className="text-base font-semibold text-white transition-colors group-hover:text-primary">
                    {activity.title[lang]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {activity.description[lang]}
                  </p>
                </div>
              </div>

              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {dict.cardCta}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          );
        })}
      </Reveal>

      <div className="mt-6 text-center">
        <Button
          asChild
          variant="outline"
          className="rounded-full border-white/20 glass-card hover:bg-white/10"
        >
          <a
            href={getGygSearchUrl({ lang, query: query ?? "Cochem" })}
            target="_blank"
            rel="noopener sponsored"
            onClick={() => trackEvent("click_affiliate_link", { query: query ?? "Cochem" })}
          >
            {dict.seeAll}
          </a>
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground/80">{dict.disclosure}</p>
    </section>
  );
}
