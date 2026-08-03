import { MetadataRoute } from 'next'
import { locations } from '@/lib/locations'
import { routes } from '@/lib/routes'
import { absoluteUrl, activitiesPath, pricesPath } from '@/lib/site'
import { i18n, type Locale } from '@/i18n-config'

type Entry = {
  /** Path per locale, e.g. (lang) => `/${lang}/rechner` */
  pathFor: (lang: Locale) => string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

/**
 * One entry per page and language, each carrying its hreflang alternates so
 * Google can pair the German and English versions.
 */
const entries: Entry[] = [
  { pathFor: (lang) => `/${lang}`, changeFrequency: 'weekly', priority: 1 },
  { pathFor: (lang) => `/${lang}/rechner`, changeFrequency: 'weekly', priority: 0.9 },
  { pathFor: pricesPath, changeFrequency: 'monthly', priority: 0.9 },
  { pathFor: activitiesPath, changeFrequency: 'weekly', priority: 0.8 },
  ...routes.map((route) => ({
    pathFor: (lang: Locale) => `/${lang}/transfer/${route.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  })),
  ...locations.map((location) => ({
    pathFor: (lang: Locale) => `/${lang}/${location.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })),
  { pathFor: (lang) => `/${lang}/legal`, changeFrequency: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return entries.flatMap((entry) =>
    i18n.locales.map((locale) => ({
      url: absoluteUrl(entry.pathFor(locale as Locale)),
      lastModified,
      changeFrequency: entry.changeFrequency,
      priority: locale === 'de' ? entry.priority : entry.priority * 0.9,
      alternates: {
        languages: {
          de: absoluteUrl(entry.pathFor('de')),
          en: absoluteUrl(entry.pathFor('en')),
        },
      },
    }))
  )
}
