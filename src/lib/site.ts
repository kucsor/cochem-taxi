import type { Locale } from '@/i18n-config';

export const SITE_URL = 'https://cochem-taxi.de';

/** Absolute URL for a site-relative path ("/de/rechner"). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** The activities page uses a keyword-friendly slug per language. */
export function activitiesPath(lang: Locale): string {
  return lang === 'en' ? '/en/things-to-do' : '/de/aktivitaeten';
}

/** The official tariff page, likewise with a per-language slug. */
export function pricesPath(lang: Locale): string {
  return lang === 'en' ? '/en/prices' : '/de/preise';
}

/**
 * Canonical + hreflang metadata for a page that exists in both languages.
 * Every page must set this explicitly: without it Next inherits the layout's
 * canonical (`/de`), which tells Google the page is a duplicate of the homepage.
 *
 * @param pathFor maps a locale to that locale's path, e.g. (lang) => `/${lang}/rechner`
 */
export function localizedAlternates(pathFor: (lang: Locale) => string) {
  return {
    canonical: absoluteUrl(pathFor('de')),
    languages: {
      'de-DE': absoluteUrl(pathFor('de')),
      'en-US': absoluteUrl(pathFor('en')),
      'x-default': absoluteUrl(pathFor('de')),
    },
  };
}

/** Same as `localizedAlternates`, but canonical points at the current locale. */
export function alternatesForLocale(lang: Locale, pathFor: (lang: Locale) => string) {
  return {
    ...localizedAlternates(pathFor),
    canonical: absoluteUrl(pathFor(lang)),
  };
}
