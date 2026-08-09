import type { Locale } from '@/i18n-config';

/**
 * GetYourGuide partner integration.
 *
 * The partner ID is public - it ends up in the rendered HTML either way - so it
 * ships as the default and the site works without any Vercel configuration.
 * Set NEXT_PUBLIC_GYG_PARTNER_ID to override it (e.g. a second partner account).
 */
const DEFAULT_GYG_PARTNER_ID = 'WBG0CKR';

export const GYG_PARTNER_ID = process.env.NEXT_PUBLIC_GYG_PARTNER_ID || DEFAULT_GYG_PARTNER_ID;

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

/** Default number of activities per section. */
export const GYG_DEFAULT_ITEM_COUNT = 6;

/**
 * The `data-gyg-*` attributes the GetYourGuide script reads when it initialises
 * a widget container.
 *
 * Note on styling: the widget renders inside a cross-origin iframe, so none of
 * our CSS reaches its contents - it paints its own light surface. The activities
 * widget also exposes no theme, sort or rating parameter; we only get to choose
 * the search term and how many results to ask for. That is why the section wraps
 * it in a deliberately light panel instead of trying to restyle it.
 */
export function getGygWidgetProps({
  lang,
  query,
  count = GYG_DEFAULT_ITEM_COUNT,
}: GygWidgetOptions) {
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
