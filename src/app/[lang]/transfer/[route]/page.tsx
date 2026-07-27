import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'
import { FareCalculator } from '@/components/landing/fare-calculator'
import { Activities } from '@/components/landing/activities'
import { Faq } from '@/components/landing/faq'
import { LocationFacts } from '@/components/landing/location-facts'
import { ScrollToTop } from '@/components/scroll-to-top'
import { Button } from '@/components/ui/button'
import { getDictionary } from '@/lib/dictionaries'
import { Locale } from '@/i18n-config'
import { routes, getRoute, buildRouteFaq } from '@/lib/routes'
import { breadcrumbSchema, formatTelephone, taxiRouteSchema } from '@/lib/schema'
import { absoluteUrl, alternatesForLocale } from '@/lib/site'

type Props = {
  params: Promise<{ lang: Locale; route: string }>
}

/** Fills `{destination}`, `{distance}` and `{minutes}` in the dictionary strings. */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  )
}

export async function generateStaticParams() {
  return routes.flatMap((route) => [
    { lang: 'de', route: route.slug },
    { lang: 'en', route: route.slug },
  ])
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, route } = await params
  const routeData = getRoute(route)

  if (!routeData) return {}

  const dict = await getDictionary(lang)
  const values = {
    destination: routeData.destination[lang],
    distance: routeData.distanceKm,
    minutes: routeData.driveMinutes,
  }

  return {
    title: fill(dict.transferPage.metaTitle, values),
    description: fill(dict.transferPage.metaDescription, values),
    alternates: alternatesForLocale(lang, (l) => `/${l}/transfer/${routeData.slug}`),
  }
}

export default async function TransferPage({ params }: Props) {
  const { lang, route } = await params
  const routeData = getRoute(route)

  if (!routeData) {
    return notFound()
  }

  const dict = await getDictionary(lang)
  const destination = routeData.destination[lang]
  const pageUrl = absoluteUrl(`/${lang}/transfer/${routeData.slug}`)
  const telephone = formatTelephone(dict.hero.phoneNumber)
  const faqItems = buildRouteFaq(routeData, lang)
  const values = {
    destination,
    distance: routeData.distanceKm,
    minutes: routeData.driveMinutes,
  }

  const routeJsonLd = taxiRouteSchema({
    name: fill(dict.transferPage.h1, values),
    description: routeData.intro[lang],
    url: pageUrl,
    destination,
    telephone,
  })

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Cochem Taxi', url: absoluteUrl(`/${lang}`) },
    { name: fill(dict.transferPage.h1, values), url: pageUrl },
  ])

  const otherRoutes = routes.filter((item) => item.slug !== routeData.slug)

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

      <section className="w-full max-w-4xl mx-auto pt-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold font-headline">
          <span className="text-gradient-gold">{fill(dict.transferPage.h1, values)}</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          {dict.transferPage.subtitle}
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90 glow-gold-subtle"
        >
          <a href={`tel:${dict.hero.phoneNumber.replace(/\s/g, '')}`} className="flex items-center gap-3">
            <Phone className="h-5 w-5" />
            <span>{dict.transferPage.callButton}</span>
            <span className="hidden border-l border-primary-foreground/30 pl-3 text-sm font-normal opacity-80 sm:inline">
              {dict.hero.phoneNumber}
            </span>
          </a>
        </Button>
      </section>

      <section className="py-8">
        <LocationFacts
          dict={dict.locationPage}
          lang={lang}
          distanceKm={routeData.distanceKm}
          driveMinutes={routeData.driveMinutes}
          intro={routeData.intro[lang]}
          highlights={routeData.highlights[lang]}
          highlightsTitle={dict.transferPage.highlightsTitle}
        />
      </section>

      <section className="py-8 w-full">
        <h2 className="mb-6 text-center text-2xl md:text-3xl font-bold font-headline">
          {dict.transferPage.calculatorTitle}
        </h2>
        <FareCalculator
          dict={dict.fareCalculator}
          lang={lang}
          initialStartAddress="Cochem"
          showDetailsLink={false}
        />
      </section>

      <section className="py-8">
        <Faq title={dict.transferPage.faqTitle} items={faqItems} />
      </section>

      <section className="py-8">
        <Activities dict={dict.activities} lang={lang} query={routeData.activitiesQuery} />
      </section>

      <section className="w-full max-w-3xl mx-auto py-8 text-center">
        <h2 className="text-xl font-bold font-headline">{dict.transferPage.otherRoutes}</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {otherRoutes.map((item) => (
            <Link
              key={item.slug}
              href={`/${lang}/transfer/${item.slug}`}
              className="glass-card rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {`Cochem - ${item.destination[lang]}`}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
