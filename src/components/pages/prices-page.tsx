import { Phone, Calculator, Info } from 'lucide-react';
import Link from 'next/link';
import { TariffTable } from '@/components/landing/tariff-table';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { getDictionary } from '@/lib/dictionaries';
import { breadcrumbSchema, formatTelephone } from '@/lib/schema';
import { absoluteUrl, pricesPath } from '@/lib/site';
import {
  BASE_FEE,
  LARGE_BASE_FEE,
  LARGE_RATE_PER_KM_DAY,
  RATE_PER_KM_DAY,
  TARIFF_CURRENCY,
  TARIFF_VALID_FROM,
} from '@/lib/fare';
import type { Locale } from '@/i18n-config';

/** Formats "2026-08-01" for display in the page language. */
function formatValidFrom(lang: Locale): string {
  return new Date(`${TARIFF_VALID_FROM}T00:00:00Z`).toLocaleDateString(
    lang === 'en' ? 'en-GB' : 'de-DE',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
  );
}

/**
 * Shared body for `/de/preise` and `/en/prices`. Publishes the official tariff
 * and, just as importantly, explains the two things that make the calculator's
 * number differ from a napkin calculation: the safety margin and the approach fee.
 */
export async function PricesPageContent({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang);
  const page = dict.pricesPage;
  const validFrom = formatValidFrom(lang);
  const telephone = formatTelephone(dict.hero.phoneNumber);

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Cochem Taxi', url: absoluteUrl(`/${lang}`) },
    { name: page.h1, url: absoluteUrl(pricesPath(lang)) },
  ]);

  const offerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Taxi',
    name: page.h1,
    description: page.metaDescription,
    url: absoluteUrl(pricesPath(lang)),
    provider: {
      '@type': 'LocalBusiness',
      name: 'Cochem Taxi',
      telephone,
      url: absoluteUrl(`/${lang}`),
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: TARIFF_CURRENCY,
      priceSpecification: [
        {
          '@type': 'PriceSpecification',
          name: dict.tariffTable.baseFee,
          price: BASE_FEE.toFixed(2),
          priceCurrency: TARIFF_CURRENCY,
        },
        {
          '@type': 'UnitPriceSpecification',
          name: dict.tariffTable.perKmDay,
          price: RATE_PER_KM_DAY.toFixed(2),
          priceCurrency: TARIFF_CURRENCY,
          unitCode: 'KMT',
        },
        {
          '@type': 'PriceSpecification',
          name: dict.tariffTable.baseFeeLarge,
          price: LARGE_BASE_FEE.toFixed(2),
          priceCurrency: TARIFF_CURRENCY,
        },
        {
          '@type': 'UnitPriceSpecification',
          name: `${dict.tariffTable.tariff2} - ${dict.tariffTable.perKmDay}`,
          price: LARGE_RATE_PER_KM_DAY.toFixed(2),
          priceCurrency: TARIFF_CURRENCY,
          unitCode: 'KMT',
        },
      ],
    },
  };

  const notes = [
    { title: page.noteBufferTitle, text: page.noteBufferText },
    { title: page.noteAnfahrtTitle, text: page.noteAnfahrtText },
    { title: page.noteMeterTitle, text: page.noteMeterText },
  ];

  return (
    <div className="w-full space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }}
      />

      <section className="w-full max-w-3xl mx-auto pt-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold font-headline text-gradient-gold">
          {page.h1}
        </h1>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-muted-foreground">
          {page.validFrom.replace('{date}', validFrom)}
        </p>
        <p className="mt-6 text-base md:text-lg leading-relaxed text-muted-foreground">
          {page.intro}
        </p>
      </section>

      <Reveal duration={0.6} className="w-full max-w-3xl mx-auto">
        <TariffTable dict={dict.tariffTable} lang={lang} />
      </Reveal>

      <Reveal stagger className="w-full max-w-3xl mx-auto grid grid-cols-1 gap-4">
        {notes.map((note) => (
          <div
            key={note.title}
            className="glass-card glass-card-hover rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-foreground">{note.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{note.text}</p>
              </div>
            </div>
          </div>
        ))}
      </Reveal>

      <section className="w-full max-w-3xl mx-auto text-center glass-card rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold font-headline">{page.ctaTitle}</h2>
        <p className="mt-3 text-muted-foreground">{page.ctaText}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-14 w-full rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90 glow-gold-subtle active:scale-[0.98] transition-transform sm:w-auto"
          >
            <a href={`tel:${dict.hero.phoneNumber.replace(/\s/g, '')}`} className="flex items-center gap-3">
              <Phone className="h-5 w-5" />
              <span>{page.callButton}</span>
              <span className="hidden border-l border-primary-foreground/30 pl-3 text-sm font-normal opacity-80 sm:inline">
                {dict.hero.phoneNumber}
              </span>
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 w-full rounded-full border-white/20 glass-card text-base hover:bg-white/10 sm:w-auto"
          >
            <Link href={`/${lang}/rechner`} className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              <span>{page.calculatorLink}</span>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
