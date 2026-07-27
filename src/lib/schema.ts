import type { FaqItem } from '@/lib/locations';
import { SITE_URL, absoluteUrl } from '@/lib/site';

/**
 * JSON-LD builders. Keeping them here means every page emits the same shape of
 * structured data, so a fix to the business details applies everywhere.
 */

const POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Bergstrasse 18',
  addressLocality: 'Cochem',
  postalCode: '56812',
  addressCountry: 'DE',
} as const;

const OPENING_HOURS = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
  opens: '00:00',
  closes: '23:59',
} as const;

/** Normalises "02671 8080" to "+49267180 80" style E.164-ish notation. */
export function formatTelephone(raw: string): string {
  const digits = raw.replace(/\s/g, '');
  return digits.startsWith('0') ? `+49${digits.substring(1)}` : digits;
}

export function taxiServiceSchema({
  description,
  telephone,
  areaServed,
}: {
  description: string;
  telephone: string;
  areaServed: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: 'Cochem Taxi',
    description,
    telephone,
    url: SITE_URL,
    address: POSTAL_ADDRESS,
    openingHoursSpecification: OPENING_HOURS,
    areaServed: areaServed.map((name) => ({ '@type': 'City', name })),
    provider: {
      '@type': 'LocalBusiness',
      name: 'Cochem Taxi',
      image: absoluteUrl('/android-chrome-512x512.png'),
      address: POSTAL_ADDRESS,
      priceRange: '€€',
      telephone,
    },
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * A concrete taxi trip (Cochem -> somewhere), used on the location and
 * transfer pages so Google can tell them apart from the homepage.
 */
export function taxiRouteSchema({
  name,
  description,
  url,
  destination,
  telephone,
}: {
  name: string;
  description: string;
  url: string;
  destination: string;
  telephone: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Taxi',
    name,
    description,
    url,
    areaServed: [
      { '@type': 'City', name: 'Cochem' },
      { '@type': 'Place', name: destination },
    ],
    provider: {
      '@type': 'LocalBusiness',
      name: 'Cochem Taxi',
      address: POSTAL_ADDRESS,
      telephone,
      priceRange: '€€',
      url: SITE_URL,
    },
  };
}
