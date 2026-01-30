import { FareCalculator } from '@/components/landing/fare-calculator'
import { Hero } from '@/components/landing/hero'
import { ServiceRegion } from '@/components/landing/service-region'
import { Services } from '@/components/landing/services'
import { WhyUs } from '@/components/landing/why-us'
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
      <Hero dict={dict.hero} />
      
      <section id="rechner" className="py-8">
        <FareCalculator dict={dict.fareCalculator} />
      </section>
      
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
