import { Castle, Landmark, Mountain, Eye, Sparkles, CalendarDays, Car, Lightbulb } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { attractions, type AttractionCategory } from "@/lib/attractions";
import type { Locale } from "@/i18n-config";

export type AttractionsDictionary = {
  title: string;
  subtitle: string;
  tipLabel: string;
  inTown: string;
  fromCochem: string;
  disclaimer: string;
};

const CATEGORY_ICON: Record<AttractionCategory, typeof Castle> = {
  castle: Castle,
  history: Landmark,
  view: Eye,
  nature: Mountain,
  culture: Sparkles,
  event: CalendarDays,
};

/**
 * The attraction guide. This is the content that makes the activities pages
 * worth landing on - the affiliate widgets sit alongside it, not instead of it.
 */
export function Attractions({ dict, lang }: { dict: AttractionsDictionary; lang: Locale }) {
  return (
    <section aria-labelledby="attractions-heading" className="w-full max-w-4xl mx-auto">
      <Reveal duration={0.6} className="text-center mb-8">
        <h2 id="attractions-heading" className="text-2xl md:text-3xl font-bold font-headline">
          {dict.title}
        </h2>
        <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          {dict.subtitle}
        </p>
      </Reveal>

      <Reveal stagger className="grid grid-cols-1 gap-4">
        {attractions.map((attraction) => {
          const Icon = CATEGORY_ICON[attraction.category];
          return (
            <article
              key={attraction.slug}
              className="glass-card glass-card-hover rounded-2xl border border-white/10 p-5 md:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold text-white">{attraction.name[lang]}</h3>
                    <span className="text-xs text-muted-foreground">
                      {attraction.distanceKm === 0
                        ? dict.inTown
                        : dict.fromCochem.replace('{distance}', String(attraction.distanceKm))}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {attraction.description[lang]}
                  </p>

                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Lightbulb className="w-4 h-4 text-primary" aria-hidden="true" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {dict.tipLabel}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {attraction.secretTip[lang]}
                    </p>
                  </div>

                  {attraction.taxiNote && (
                    <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground/90">
                      <Car className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/70" aria-hidden="true" />
                      <span>{attraction.taxiNote[lang]}</span>
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </Reveal>

      <p className="mt-6 text-center text-xs text-muted-foreground/80">{dict.disclaimer}</p>
    </section>
  );
}
