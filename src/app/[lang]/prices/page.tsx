import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PricesPageContent } from '@/components/pages/prices-page'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesForLocale, pricesPath } from '@/lib/site'
import { Locale } from '@/i18n-config'

type Props = { params: Promise<{ lang: Locale }> }

// English slug only - /de/prices redirects to /de/preise below.
export async function generateStaticParams() {
  return [{ lang: 'en' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return {
    title: dict.pricesPage.metaTitle,
    description: dict.pricesPage.metaDescription,
    alternates: alternatesForLocale(lang, pricesPath),
  }
}

export default async function PricesPage({ params }: Props) {
  const { lang } = await params

  if (lang !== 'en') {
    redirect(pricesPath(lang))
  }

  return <PricesPageContent lang={lang} />
}
