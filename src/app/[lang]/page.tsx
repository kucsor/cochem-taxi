import Link from 'next/link'
import { airports } from '@/lib/airports'
import { FareCalculator } from '@/components/landing/fare-calculator'
import { Hero } from '@/components/landing/hero'
import { ServiceArea } from '@/components/landing/service-area'
import { ServiceRegion } from '@/components/landing/service-region'
import { Services } from '@/components/landing/services'
import { WhyUs } from '@/components/landing/why-us'
import { ScrollToTop } from '@/components/scroll-to-top'
import { getDictionary } from '@/lib/dictionaries'
import { Locale } from '@/i18n-config'

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang)
  return (
    <>
      <ScrollToTop />
      <Hero dict={dict.hero} />
      
      <div className="py-8">
        <FareCalculator dict={dict.fareCalculator} lang={lang} />
      </div>
      
      <ServiceArea dict={dict.serviceArea} />
      <section className="py-8 w-full max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">{lang === 'de' ? 'Flughafentransfer ab und nach Cochem' : 'Airport transfers to and from Cochem'}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{airports.map(airport => <Link key={airport.slug} href={`/${lang}/flughafen/${airport.slug}`} className="glass-card rounded-2xl p-6 text-center hover:text-primary">{airport.name} ({airport.code})</Link>)}</div>
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