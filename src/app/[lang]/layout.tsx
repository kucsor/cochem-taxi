import type { Metadata } from 'next'
import { i18n, type Locale } from '@/i18n-config'
import { getDictionary } from '@/lib/dictionaries'
import { Footer } from '@/components/landing/footer';
import { Header } from '@/components/landing/header';
import { BottomNav } from '@/components/landing/bottom-nav';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang)
  return {
    metadataBase: new URL('https://cochem-taxi.de'),
    title: {
      template: `%s | Cochem-Taxi.de`,
      default: dictionary.metadata.title,
    },
    description: dictionary.metadata.description,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'de-DE': '/de',
        'en-US': '/en',
        'x-default': '/de',
      },
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const telephoneNumber = dict.hero.phoneNumber.replace(/\s/g, '');
  const formattedTelephone = telephoneNumber.startsWith('0') 
    ? `+49${telephoneNumber.substring(1)}` 
    : telephoneNumber;

  const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TaxiService',
      name: 'Cochem Taxi',
      description: dict.metadata.description,
      telephone: formattedTelephone,
      url: 'https://cochem-taxi.de',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Bergstrasse 18',
        addressLocality: 'Cochem',
        postalCode: '56812',
        addressCountry: 'DE',
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '00:00',
        closes: '23:59'
      },
      areaServed: [
        {
          '@type': 'City',
          name: 'Cochem',
        },
        {
          '@type': 'City',
          name: 'Cochem an der Mosel',
        },
        {
          '@type': 'City',
          name: 'Treis-Karden',
        },
        {
          '@type': 'City',
          name: 'Kaisersesch',
        }
      ],
      provider: {
        '@type': 'LocalBusiness',
        name: 'Cochem Taxi',
        image: 'https://cochem-taxi.de/android-chrome-512x512.png',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Bergstrasse 18',
          addressLocality: 'Cochem',
          postalCode: '56812',
          addressCountry: 'DE',
        },
        priceRange: '€€',
        telephone: formattedTelephone,
      },
    };
  
  return (
    <div className="flex flex-col items-center min-h-dvh bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header dict={dict.footer} lang={lang} />
        <main className="container mx-auto px-4 py-6 md:py-12 flex-grow w-full flex flex-col items-center justify-start space-y-12 md:space-y-24 lg:space-y-32">
            {children}
        </main>
        <Footer dict={dict.footer} lang={lang} />
        <BottomNav />
        <SpeedInsights />
        <Analytics />
    </div>
  )
}
