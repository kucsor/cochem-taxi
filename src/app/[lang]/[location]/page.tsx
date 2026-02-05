
import { FareCalculator } from '@/components/landing/fare-calculator'
import { Hero } from '@/components/landing/hero'
import { ServiceRegion } from '@/components/landing/service-region'
import { Services } from '@/components/landing/services'
import { WhyUs } from '@/components/landing/why-us'
import { ScrollToTop } from '@/components/scroll-to-top'
import { getDictionary } from '@/lib/dictionaries'
import { Locale } from '@/i18n-config'
import { locations, getLocation } from '@/lib/locations'
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
  const deDesc = `Suchen Sie ein Taxi in ${locData.name}? Wir kommen aus Cochem zu Ihnen. Nutzen Sie unseren kostenlosen Preisrechner. Sicher & Pünktlich.`

  const enTitle = `Taxi ${locData.name} | Price Calculator & Booking | Cochem-Taxi.de`
  const enDesc = `Need a taxi in ${locData.name}? We provide reliable pickup service from Cochem. Calculate your fare online now.`

  return {
    title: lang === 'de' ? deTitle : enTitle,
    description: lang === 'de' ? deDesc : enDesc,
  }
}

export default async function LocationPage({ params }: Props) {
  const { lang, location } = await params
  const locData = getLocation(location)

  if (!locData) {
    return notFound()
  }

  const dict = await getDictionary(lang)

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
      <ScrollToTop />
      <Hero dict={heroDict} />

      <div className="py-8">
        <FareCalculator
          dict={dict.fareCalculator}
          lang={lang}
          initialStartAddress={locData.name}
        />
      </div>

      <section id="services" className="py-8">
        <Services dict={dict.services} />
      </section>

      <section id="warum-wir" className="py-8">
        <WhyUs dict={dict.whyUs} />
      </section>

      <section className="py-8">
        <ServiceRegion dict={dict.serviceRegion} />
      </section>
    </>
  )
}
