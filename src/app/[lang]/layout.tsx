import type { Metadata } from 'next'
import { i18n, type Locale } from '@/i18n-config'
import { getDictionary } from '@/lib/dictionaries'
import { Footer } from '@/components/landing/footer';
import { Header } from '@/components/landing/header';
import { BottomNav } from '@/components/landing/bottom-nav';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { ConsentBanner } from '@/components/consent-banner';
import { formatTelephone, taxiServiceSchema } from '@/lib/schema';
import { SITE_URL } from '@/lib/site';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale)
  return {
    metadataBase: new URL(SITE_URL),
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
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  
  const formattedTelephone = formatTelephone(dict.hero.phoneNumber);

  const jsonLd = taxiServiceSchema({
    description: dict.metadata.description,
    telephone: formattedTelephone,
    areaServed: [
      'Cochem',
      'Cochem an der Mosel',
      'Treis-Karden',
      'Kaisersesch',
      'Beilstein',
      'Ediger-Eller',
      'Zell (Mosel)',
      'Ulmen',
    ],
  });

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
        <ConsentBanner dict={dict.consent} lang={lang} />
        <SpeedInsights />
        <Analytics />
    </div>
  )
}
