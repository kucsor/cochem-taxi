import type { LocalizedText } from '@/lib/locations';

/**
 * Hand-picked activities around Cochem.
 *
 * These replace the GetYourGuide widget iframe. The widget could not be styled
 * (cross-origin) and offered no way to filter by rating - it showed whatever its
 * search returned, inside a white box our CSS could not reach. Curating the
 * topics ourselves fixes both: the cards match the site, and only experiences
 * worth recommending appear.
 *
 * Each card links to a GetYourGuide search scoped to that topic rather than to
 * one specific tour. A search page cannot go stale or 404 when an operator
 * delists a tour, and it shows live ratings and prices on arrival - which is
 * also why no rating or price is hardcoded here.
 */

export type ActivityCategory =
  | 'castle'
  | 'boat'
  | 'wine'
  | 'history'
  | 'hike'
  | 'daytrip';

export interface CuratedActivity {
  slug: string;
  category: ActivityCategory;
  /** Search term handed to GetYourGuide. */
  query: string;
  title: LocalizedText;
  description: LocalizedText;
}

export const curatedActivities: CuratedActivity[] = [
  {
    slug: 'reichsburg',
    category: 'castle',
    query: 'Reichsburg Cochem',
    title: {
      de: 'Reichsburg Cochem',
      en: 'Reichsburg Cochem',
    },
    description: {
      de: 'Führungen durch das Wahrzeichen der Stadt, hoch über der Mosel. Der Klassiker - und zu Fuß in einer Viertelstunde erreichbar.',
      en: 'Guided tours of the town landmark, high above the Moselle. The classic - and a fifteen-minute walk from the centre.',
    },
  },
  {
    slug: 'burg-eltz',
    category: 'castle',
    query: 'Burg Eltz',
    title: {
      de: 'Burg Eltz',
      en: 'Eltz Castle',
    },
    description: {
      de: 'Eine der schönsten Burgen Deutschlands, versteckt im Wald. Mit öffentlichen Verkehrsmitteln umständlich - Touren mit Transfer lohnen sich hier besonders.',
      en: 'One of the most beautiful castles in Germany, hidden in the woods. Awkward by public transport, so tours including transfer are worth it here.',
    },
  },
  {
    slug: 'moselschifffahrt',
    category: 'boat',
    query: 'Mosel Schifffahrt Cochem',
    title: {
      de: 'Moselschifffahrt',
      en: 'Moselle river cruise',
    },
    description: {
      de: 'Die Weinberge und Burgen vom Wasser aus - von der kurzen Rundfahrt bis zur Tagestour nach Beilstein oder Zell.',
      en: 'The vineyards and castles seen from the water - from a short round trip to a full day out to Beilstein or Zell.',
    },
  },
  {
    slug: 'weinprobe',
    category: 'wine',
    query: 'Mosel Weinprobe',
    title: {
      de: 'Weinproben an der Mosel',
      en: 'Moselle wine tastings',
    },
    description: {
      de: 'Riesling dort verkosten, wo er wächst - in den Weingütern und Straußwirtschaften rund um Cochem. Für den Rückweg sind wir da.',
      en: 'Taste Riesling where it grows - in the wineries and wine taverns around Cochem. We will handle the ride home.',
    },
  },
  {
    slug: 'bundesbankbunker',
    category: 'history',
    query: 'Bundesbankbunker Cochem',
    title: {
      de: 'Bundesbankbunker',
      en: 'Bundesbank bunker',
    },
    description: {
      de: '30 Meter unter der Erde lagerten bis 1988 fünfzehn Milliarden Mark einer geheimen Ersatzwährung. Nur mit Führung zugänglich.',
      en: 'Thirty metres underground, fifteen billion marks of a secret emergency currency sat here until 1988. Guided tours only.',
    },
  },
  {
    slug: 'tagesausfluege',
    category: 'daytrip',
    query: 'Mosel Tagesausflug',
    title: {
      de: 'Tagesausflüge in die Region',
      en: 'Day trips in the region',
    },
    description: {
      de: 'Trier, Koblenz, die Vulkaneifel oder die Moselschleife bei Bremm - Touren, die weiter reichen als ein Nachmittag in der Altstadt.',
      en: 'Trier, Koblenz, the Volcanic Eifel or the Moselle loop at Bremm - trips that reach further than an afternoon in the old town.',
    },
  },
];

/**
 * Orders the cards for a given page: anything matching that page's topic (a
 * transfer page for Burg Eltz, say) comes first, the rest keep their order.
 */
export function orderActivitiesFor(query: string | undefined, limit: number): CuratedActivity[] {
  if (!query) return curatedActivities.slice(0, limit);

  const needle = query.toLowerCase();
  const matches = (activity: CuratedActivity) =>
    activity.query.toLowerCase().includes(needle) ||
    needle.includes(activity.slug.replace(/-/g, ' ')) ||
    activity.title.de.toLowerCase().includes(needle);

  const preferred = curatedActivities.filter(matches);
  const rest = curatedActivities.filter((activity) => !preferred.includes(activity));

  return [...preferred, ...rest].slice(0, limit);
}
