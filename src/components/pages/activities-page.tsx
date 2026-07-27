import { Phone } from 'lucide-react';
import { Activities } from '@/components/landing/activities';
import { Button } from '@/components/ui/button';
import { getDictionary } from '@/lib/dictionaries';
import { breadcrumbSchema } from '@/lib/schema';
import { absoluteUrl, activitiesPath } from '@/lib/site';
import type { Locale } from '@/i18n-config';

/**
 * Shared body for `/de/aktivitaeten` and `/en/things-to-do` - the two routes are
 * thin wrappers so each language gets a keyword-friendly slug.
 */
export async function ActivitiesPageContent({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang);
  const page = dict.activitiesPage;

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Cochem Taxi', url: absoluteUrl(`/${lang}`) },
    { name: page.h1, url: absoluteUrl(activitiesPath(lang)) },
  ]);

  return (
    <div className="w-full space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="w-full max-w-3xl mx-auto pt-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold font-headline text-gradient-gold">
          {page.h1}
        </h1>
        <p className="mt-6 text-base md:text-lg leading-relaxed text-muted-foreground">
          {page.intro}
        </p>
      </section>

      {page.blocks.map((block) => (
        <section key={block.query} className="w-full max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-xl md:text-2xl font-bold font-headline">{block.title}</h2>
            <p className="mt-2 text-muted-foreground">{block.text}</p>
          </div>
          <Activities dict={dict.activities} lang={lang} query={block.query} count={4} />
        </section>
      ))}

      <section className="w-full max-w-3xl mx-auto text-center glass-card rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold font-headline">{page.ctaTitle}</h2>
        <p className="mt-3 text-muted-foreground">{page.ctaText}</p>
        <Button
          asChild
          size="lg"
          className="mt-6 h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90 glow-gold-subtle"
        >
          <a href={`tel:${dict.hero.phoneNumber.replace(/\s/g, '')}`} className="flex items-center gap-3">
            <Phone className="h-5 w-5" />
            <span>{page.callButton}</span>
            <span className="hidden border-l border-primary-foreground/30 pl-3 text-sm font-normal opacity-80 sm:inline">
              {dict.hero.phoneNumber}
            </span>
          </a>
        </Button>
      </section>
    </div>
  );
}
