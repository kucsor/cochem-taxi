import { FareCalculator } from '@/components/landing/fare-calculator'
import { Hero } from '@/components/landing/hero'
import { ServiceRegion } from '@/components/landing/service-region'
import { Services } from '@/components/landing/services'
import { WhyUs } from '@/components/landing/why-us'
import { Activities } from '@/components/landing/activities'
import { Faq } from '@/components/landing/faq'
import { LocationFacts } from '@/components/landing/location-facts'
import { ScrollToTop } from '@/components/scroll-to-top'
import { getDictionary } from '@/lib/dictionaries'
import { Locale } from '@/i18n-config'
import { locations, getLocation, buildLocationFaq } from '@/lib/locations'
import { breadcrumbSchema, formatTelephone, taxiRouteSchema } from '@/lib/schema'
import { absoluteUrl, alternatesForLocale } from '@/lib/site'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ lang: Locale; location: string }>
}

export async function generateStaticParams() {
  return locations.flatMap((loc) => [
    { lang: 'de', location: loc.slug },
    { lang: 'en', location: loc.slug },
  ])
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, location } = await params
  const locData = getLocation(location)

  if (!locData) {
    return {}
  }

  const deTitle = `Taxi ${locData.name} | Preis berechnen & Bestellen | Cochem-Taxi.de`
  const deDesc = `Taxi in ${locData.name} bestellen: ca. ${locData.distanceKm} km ab Cochem, rund ${locData.driveMinutes} Minuten Fahrzeit. Preis vorab berechnen - 24/7 erreichbar.`

  const enTitle = `Taxi ${locData.name} | Price Calculator & Booking | Cochem-Taxi.de`
  const enDesc = `Book a taxi in ${locData.name}: approx. ${locData.distanceKm} km from Cochem, around ${locData.driveMinutes} minutes. Calculate your fare online - available 24/7.`

  return {
    title: lang === 'de' ? deTitle : enTitle,
    description: lang === 'de' ? deDesc : enDesc,
    // Without explicit alternates every location page would inherit the
    // layout's canonical (/de) and look like a duplicate of the homepage.
    alternates: alternatesForLocale(lang, (l) => `/${l}/${locData.slug}`),
  }
}

export default async function LocationPage({ params }: Props) {
  const { lang, location } = await params
  const locData = getLocation(location)

  if (!locData) {
    return notFound()
  }

  const dict = await getDictionary(lang)
  const pageUrl = absoluteUrl(`/${lang}/${locData.slug}`)
  const telephone = formatTelephone(dict.hero.phoneNumber)
  const faqItems = buildLocationFaq(locData, lang)

  const routeJsonLd = taxiRouteSchema({
    name: `Taxi Cochem - ${locData.name}`,
    description: locData.intro[lang],
    url: pageUrl,
    destination: locData.name,
    telephone,
  })

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Cochem Taxi', url: absoluteUrl(`/${lang}`) },
    { name: `Taxi ${locData.name}`, url: pageUrl },
  ])

  // Override Hero content
  const heroDict = { ...dict.hero }
  if (lang === 'de') {
    heroDict.mainTitle = `Taxi ${locData.name}`
    heroDict.mainTitleAccent = "Zuverlässige Abholung durch Cochem Taxi"
    heroDict.subtitle = "Anfahrt aus Cochem - Bitte rechtzeitig bestellen"
  } else {
    heroDict.mainTitle = `Taxi Service ${locData.name}`
    heroDict.mainTitleAccent = "Reliable Pickup from Cochem"
    heroDict.subtitle = "Service from Cochem - Please book in advance"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(routeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ScrollToTop />
      <Hero dict={heroDict} />

      <section className="py-8">
        <LocationFacts
          dict={dict.locationPage}
          lang={lang}
          distanceKm={locData.distanceKm}
          driveMinutes={locData.driveMinutes}
          intro={locData.intro[lang]}
          highlights={locData.highlights[lang]}
          highlightsTitle={dict.locationPage.highlightsTitle}
        />
      </section>

      <div className="py-8">
        <FareCalculator
          dict={dict.fareCalculator}
          lang={lang}
          initialStartAddress={locData.name}
        />
      </div>

      <section className="py-8">
        <Faq title={dict.locationPage.faqTitle} items={faqItems} />
      </section>

      <section className="py-8">
        <Activities dict={dict.activities} lang={lang} query="Cochem" />
      </section>

      <section id="services" className="py-8">
        <Services dict={dict.services} />
      </section>

      <section id="warum-wir" className="py-8">
        <WhyUs dict={dict.whyUs} />
      </section>

      <section className="py-8">
        <ServiceRegion dict={dict.serviceRegion} lang={lang} />
      </section>
    </>
  )
}
