import { FareCalculator } from '@/components/landing/fare-calculator'
import { getDictionary } from '@/lib/dictionaries'
import { Locale } from '@/i18n-config'
import { Metadata } from 'next'
import { sanitizeHtml } from '@/lib/sanitize'

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return {
    title: dict.rechnerPage.metaTitle,
    description: dict.rechnerPage.metaDescription,
    alternates: {
      canonical: `https://cochem-taxi.de/${lang}/rechner`,
      languages: {
        'de': 'https://cochem-taxi.de/de/rechner',
        'en': 'https://cochem-taxi.de/en/rechner',
      }
    }
  }
}

export default async function RechnerPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Taxi Rechner Cochem",
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "description": dict.rechnerPage.metaDescription,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "120"
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-gradient-gold">
            {dict.rechnerPage.h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.rechnerPage.intro}
          </p>
        </div>

        {/* The Calculator Component */}
        <div className="bg-black/20 rounded-3xl border border-white/5 p-1 md:p-4">
          <FareCalculator dict={dict.fareCalculator} lang={lang} showDetailsLink={false} />
        </div>

        {/* SEO Content Block 1 */}
        <section className="prose prose-invert max-w-none glass p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-primary mb-4">{dict.rechnerPage.h2_1}</h2>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(dict.rechnerPage.content_1) }} />
        </section>

        {/* SEO Content Block 2 */}
        <section className="prose prose-invert max-w-none glass p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-primary mb-4">{dict.rechnerPage.h2_2}</h2>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(dict.rechnerPage.content_2) }} />
        </section>
      </div>
    </main>
  )
}
