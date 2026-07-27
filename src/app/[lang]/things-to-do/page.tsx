import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ActivitiesPageContent } from '@/components/pages/activities-page'
import { getDictionary } from '@/lib/dictionaries'
import { activitiesPath, alternatesForLocale } from '@/lib/site'
import { Locale } from '@/i18n-config'

type Props = { params: Promise<{ lang: Locale }> }

// English slug only - /de/things-to-do redirects to /de/aktivitaeten below.
export async function generateStaticParams() {
  return [{ lang: 'en' }]
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

export default async function ThingsToDoPage({ params }: Props) {
  const { lang } = await params

  if (lang !== 'en') {
    redirect(activitiesPath(lang))
  }

  return <ActivitiesPageContent lang={lang} />
}
