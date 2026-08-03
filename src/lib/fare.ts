/**
 * Single source of truth for the taxi tariff and the Cochem zone geometry.
 *
 * Used by the Server Action (`src/app/actions.ts`), the API route
 * (`src/app/api/calculate/route.ts`) and by the statically rendered price
 * estimates on the location / transfer pages.
 */

/**
 * Official tariff in force since this date. Displayed on the prices page and
 * in the tariff notice - keep it here so the date lives in one place.
 */
export const TARIFF_VALID_FROM = '2026-08-01';

export const TARIFF_CURRENCY = 'EUR';

export const NIGHT_START_HOUR = 22;
export const NIGHT_END_HOUR = 6;

// Standard vehicle (1-4 passengers) - "Tarif 1"
export const BASE_FEE = 4.5;
export const RATE_PER_KM_DAY = 3.0;
export const RATE_PER_KM_NIGHT = 3.3;

// Large vehicle (5-8 passengers) - "Tarif 2"
export const LARGE_BASE_FEE = 6.0;
export const LARGE_RATE_PER_KM_DAY = 4.5;
export const LARGE_RATE_PER_KM_NIGHT = 4.8;

/** Waiting time, charged per hour. Not part of the distance calculation. */
export const WAITING_FEE_PER_HOUR = 50;

export const ANFAHRT_FEE_PERCENTAGE = 0.4; // 40%

/**
 * Safety buffer applied to the total, so the quoted estimate is not too low:
 * the road actually driven is usually longer than the routed distance, and
 * waiting time costs money too. Since the official tariff is published on the
 * prices page, this margin is disclosed there rather than hidden.
 */
export const PRICE_BUFFER = 1.1;

/** Cochem central point for Anfahrt calculation: Pater-Martin-Straße, 56812 Cochem */
export const COCHEM_CENTER_COORDS = { lat: 50.1475, lon: 7.1685 };

/** Polygon defining the Cochem no-fee zone. Coordinates are [lon, lat]. */
export const COCHEM_POLYGON: [number, number][] = [
  [7.1580, 50.1590],
  [7.1750, 50.1550],
  [7.1850, 50.1450],
  [7.1820, 50.1320],
  [7.1668, 50.1175],
  [7.1400, 50.1200],
  [7.1250, 50.1300],
  [7.1320, 50.1420],
  [7.1400, 50.1480],
  [7.1580, 50.1590],
];

/** Bounding box around COCHEM_POLYGON, used to reject points cheaply. */
export const COCHEM_BBOX = {
  minLon: 7.1250,
  maxLon: 7.1850,
  minLat: 50.1175,
  maxLat: 50.1590,
};

export type Coords = { lat: number; lon: number };

export type TariffOptions = {
  /** Night tariff (22:00 - 06:00). */
  night?: boolean;
  /** Large vehicle for 5-8 passengers. */
  large?: boolean;
};

export function isNightHour(hour: number): boolean {
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

/** Parses "HH:MM" and reports whether it falls into the night tariff. */
export function isNightTime(pickupTime: string): boolean {
  const [hour] = pickupTime.split(':').map(Number);
  return isNightHour(hour);
}

export function getBaseFee({ large = false }: TariffOptions = {}): number {
  return large ? LARGE_BASE_FEE : BASE_FEE;
}

export function getRatePerKm({ night = false, large = false }: TariffOptions = {}): number {
  if (large) return night ? LARGE_RATE_PER_KM_NIGHT : LARGE_RATE_PER_KM_DAY;
  return night ? RATE_PER_KM_NIGHT : RATE_PER_KM_DAY;
}

/**
 * Estimated fare for a known distance, including the same safety buffer the
 * calculator applies. Does not include an Anfahrt fee - the location and
 * transfer pages all describe trips that start or end inside the Cochem zone.
 */
export function estimateFare(distanceKm: number, options: TariffOptions = {}): number {
  return (getBaseFee(options) + distanceKm * getRatePerKm(options)) * PRICE_BUFFER;
}

/** Formats a price the way the calculator does: "24,50 €". */
export function formatEuro(value: number, locale: string = 'de'): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/**
 * Rounded estimate for the static pages: "36 €" instead of "35,97 €". Cent
 * precision would suggest an accuracy this estimate does not have - only the
 * taximeter produces an exact fare.
 */
export function formatFareEstimate(
  distanceKm: number,
  { locale = 'de', ...tariff }: TariffOptions & { locale?: string } = {}
): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(estimateFare(distanceKm, tariff)));
}

/** Point-in-polygon (ray casting). */
export function isPointInPolygon(point: Coords, polygon: [number, number][] = COCHEM_POLYGON): boolean {
  const { lon: x, lat: y } = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) {
      isInside = !isInside;
    }
  }
  return isInside;
}

/** True when any point of the route geometry falls inside the Cochem zone. */
export function routePassesThroughCochemZone(geometry: any): boolean {
  if (!geometry?.coordinates) return false;

  const points: [number, number][] = geometry.type === 'MultiLineString'
    ? geometry.coordinates.flat()
    : geometry.coordinates;

  for (const coord of points) {
    // Cheap rejection before the ray casting.
    if (coord[0] < COCHEM_BBOX.minLon || coord[0] > COCHEM_BBOX.maxLon ||
        coord[1] < COCHEM_BBOX.minLat || coord[1] > COCHEM_BBOX.maxLat) {
      continue;
    }
    if (isPointInPolygon({ lon: coord[0], lat: coord[1] })) return true;
  }
  return false;
}

/** Haversine distance in km. */
export function getHaversineDistance(coords1: Coords, coords2: Coords): number {
  const R = 6371;
  const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
  const dLon = (coords2.lon - coords1.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coords1.lat * (Math.PI / 180)) *
      Math.cos(coords2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
