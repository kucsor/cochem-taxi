import { Clock, MapPin, Wallet } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { formatFareEstimate } from "@/lib/fare";
import type { Locale } from "@/i18n-config";

export type LocationFactsDictionary = {
  distanceLabel: string;
  durationLabel: string;
  priceLabel: string;
  minutes: string;
  /** Localised "approximately" prefix: "ca." / "approx." */
  approx: string;
  disclaimer: string;
};

type LocationFactsProps = {
  dict: LocationFactsDictionary;
  lang: Locale;
  distanceKm: number;
  driveMinutes: number;
  /** Optional intro paragraph rendered above the facts. */
  intro?: string;
  highlights?: string[];
  highlightsTitle?: string;
};

/**
 * Distance / duration / estimated price for a fixed route, rendered statically
 * so the numbers are in the HTML that Google indexes. The price uses the same
 * tariff as the calculator (`src/lib/fare.ts`).
 */
export function LocationFacts({
  dict,
  lang,
  distanceKm,
  driveMinutes,
  intro,
  highlights,
  highlightsTitle,
}: LocationFactsProps) {
  const price = formatFareEstimate(distanceKm, { locale: lang });

  const facts = [
    { icon: MapPin, label: dict.distanceLabel, value: `${dict.approx} ${distanceKm} km` },
    { icon: Clock, label: dict.durationLabel, value: `${dict.approx} ${driveMinutes} ${dict.minutes}` },
    { icon: Wallet, label: dict.priceLabel, value: `${dict.approx} ${price}` },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto">
      {intro && (
        <Reveal duration={0.6}>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-8">{intro}</p>
        </Reveal>
      )}

      <Reveal stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="glass-card glass-card-hover rounded-2xl border border-white/10 p-5 text-center hover:-translate-y-1"
          >
            <fact.icon className="w-5 h-5 text-primary mx-auto mb-2" aria-hidden="true" />
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{fact.label}</div>
            <div className="mt-1 text-lg font-semibold text-foreground">{fact.value}</div>
          </div>
        ))}
      </Reveal>

      <p className="mt-3 text-center text-xs text-muted-foreground/80">{dict.disclaimer}</p>

      {highlights && highlights.length > 0 && (
        <Reveal delay={0.1} className="mt-8">
          <div className="glass-card rounded-2xl border border-white/10 p-6">
            {highlightsTitle && (
              <h2 className="text-xl font-bold font-headline mb-4">{highlightsTitle}</h2>
            )}
            <ul className="space-y-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}
    </section>
  );
}
