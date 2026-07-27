import type { Locale } from '@/i18n-config';

/**
 * GetYourGuide partner integration.
 *
 * The partner ID lives in the environment so it can be set in Vercel without a
 * code change. When it is missing (local dev, forks), the activities sections
 * simply do not render - no empty widget shells in production.
 */
export const GYG_PARTNER_ID = process.env.NEXT_PUBLIC_GYG_PARTNER_ID ?? '';

export const GYG_WIDGET_SCRIPT = 'https://widget.getyourguide.com/dist/pa.umd.production.min.js';

export function hasAffiliatePartnerId(): boolean {
  return GYG_PARTNER_ID.trim().length > 0;
}

function gygLocaleCode(lang: Locale): string {
  return lang === 'en' ? 'en-US' : 'de-DE';
}

export type GygWidgetOptions = {
  lang: Locale;
  /** Search term, e.g. "Cochem", "Burg Eltz", "Mosel". */
  query: string;
  /** Number of activity cards to display. */
  count?: number;
};

/**
 * The `data-gyg-*` attributes the GetYourGuide script reads when it initialises
 * a widget container.
 */
export function getGygWidgetProps({ lang, query, count = 3 }: GygWidgetOptions) {
  return {
    'data-gyg-href': 'https://widget.getyourguide.com/default/activities.frame',
    'data-gyg-locale-code': gygLocaleCode(lang),
    'data-gyg-widget': 'activities',
    'data-gyg-number-of-items': String(count),
    'data-gyg-partner-id': GYG_PARTNER_ID,
    'data-gyg-q': query,
    'data-gyg-currency': 'EUR',
  } as const;
}

/** Deep link to the GetYourGuide search page, used for the "see all" link. */
export function getGygSearchUrl({ lang, query }: Omit<GygWidgetOptions, 'count'>): string {
  const params = new URLSearchParams({
    q: query,
    partner_id: GYG_PARTNER_ID,
    currency: 'EUR',
  });
  const localePath = lang === 'en' ? '' : '/de-de';
  return `https://www.getyourguide.com${localePath}/s/?${params.toString()}`;
}
