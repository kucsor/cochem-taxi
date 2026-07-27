import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ActivitiesPageContent } from '@/components/pages/activities-page'
import { getDictionary } from '@/lib/dictionaries'
import { activitiesPath, alternatesForLocale } from '@/lib/site'
import { Locale } from '@/i18n-config'

type Props = { params: Promise<{ lang: Locale }> }

// German slug only - /en/aktivitaeten redirects to /en/things-to-do below.
export async function generateStaticParams() {
  return [{ lang: 'de' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return {
    title: dict.activitiesPage.metaTitle,
    description: dict.activitiesPage.metaDescription,
    alternates: alternatesForLocale(lang, activitiesPath),
  }
}

export default async function AktivitaetenPage({ params }: Props) {
  const { lang } = await params

  if (lang !== 'de') {
    redirect(activitiesPath(lang))
  }

  return <ActivitiesPageContent lang={lang} />
}
