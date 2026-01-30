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
      name: dict.footer.companyName,
      description: dict.metadata.description,
      telephone: formattedTelephone,
      areaServed: {
        '@type': 'City',
        name: 'Cochem',
      },
      provider: {
        '@type': 'Organization',
        name: dict.footer.companyName,
      },
    };
  
  return (
    <div className="flex flex-col items-center min-h-dvh bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header dict={dict.footer} lang={lang} />
        <main className="container mx-auto px-4 py-4 md:py-8 flex-grow w-full flex flex-col items-center justify-start space-y-8 md:space-y-20">
            {children}
        </main>
        <Footer dict={dict.footer} lang={lang} />
        <BottomNav />
        <SpeedInsights />
        <Analytics />
    </div>
  )
}
