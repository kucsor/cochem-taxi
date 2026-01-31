import 'server-only'
import type { Locale } from '@/i18n-config'
import { cache } from 'react'

// We enumerate all dictionaries here for better linting and typescript support
// We can prepare getDictionaries for client side
const dictionaries = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  de: () => import('@/locales/de.json').then((module) => module.default),
}

export const getDictionary = cache(async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.de()
)
