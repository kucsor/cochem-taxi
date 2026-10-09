// Only these categories leave the browser. Never transmit an entered address.
export const destinations = [
  "unknown",
  "other",
  "airport-hahn",
  "airport-frankfurt",
  "airport-koeln-bonn",
  "airport-duesseldorf",
  "airport-luxemburg",
  "cochem",
  "klotten",
  "valwig",
  "valwigerberg",
  "bruttig-fankel",
  "ernst",
  "beilstein",
  "landkern",
  "faid",
  "treis-karden",
  "ediger-eller",
  "senheim",
  "bremm",
  "briedern",
  "kaisersesch",
  "ulmen",
  "zell-mosel",
  "koblenz",
  "trier",
  "burg-eltz",
  "reichsburg",
] as const;
export type Destination = (typeof destinations)[number];
export const destinationLabels: Record<Destination, string> = {
  unknown: "Not recorded",
  other: "Other destination",
  "airport-hahn": "Frankfurt-Hahn Airport",
  "airport-frankfurt": "Frankfurt Airport",
  "airport-koeln-bonn": "Cologne/Bonn Airport",
  "airport-duesseldorf": "Düsseldorf Airport",
  "airport-luxemburg": "Luxembourg Airport",
  cochem: "Cochem",
  klotten: "Klotten",
  valwig: "Valwig",
  valwigerberg: "Valwigerberg",
  "bruttig-fankel": "Bruttig-Fankel",
  ernst: "Ernst",
  beilstein: "Beilstein",
  landkern: "Landkern",
  faid: "Faid",
  "treis-karden": "Treis-Karden",
  "ediger-eller": "Ediger-Eller",
  senheim: "Senheim",
  bremm: "Bremm",
  briedern: "Briedern",
  kaisersesch: "Kaisersesch",
  ulmen: "Ulmen",
  "zell-mosel": "Zell (Mosel)",
  koblenz: "Koblenz",
  trier: "Trier",
  "burg-eltz": "Eltz Castle",
  reichsburg: "Reichsburg Castle",
};
export function classifyDestination(
  text: string,
  airport?: string,
): Destination {
  const fixed = `airport-${airport}` as Destination;
  if (airport && destinations.includes(fixed)) return fixed;
  const q = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss");
  if (!q.trim()) return "unknown";
  if (/\bhhn\b|frankfurt.hahn|flughafen.hahn/.test(q)) return "airport-hahn";
  if (/airport|flughafen|luchthaven/.test(q)) {
    if (/frankfurt/.test(q)) return "airport-frankfurt";
    if (/koln|cologne|bonn/.test(q)) return "airport-koeln-bonn";
    if (/dusseldorf|duesseldorf/.test(q)) return "airport-duesseldorf";
    if (/luxemb/.test(q)) return "airport-luxemburg";
  }
  if (/burg.eltz|eltz.castle/.test(q)) return "burg-eltz";
  if (/reichsburg/.test(q)) return "reichsburg";
  // Never scan districts or street names for a town substring.
  const city = q.split(",")[0].trim().replace(/\s*\(mosel\)$/, "");
  for (const k of destinations) {
    if (k.startsWith("airport-") || ["other", "unknown"].includes(k)) continue;
    const term = k === "zell-mosel" ? "zell" : k;
    if (city === term || city === term.replace(/-/g, " ")) return k;
  }
  return "other";
}

export type PlaceFeature = {
  id?: string;
  text_de?: string;
  short_code?: string;
  text?: string;
  place_type?: string[];
  context?: { id: string; text: string; text_de?: string; short_code?: string }[];
};
/** Selected structured feature only. District/address strings never identify a town. */
export function classifyPlace(feature?: PlaceFeature, airport?: string): Destination {
  if (airport) return classifyDestination("", airport);
  if (!feature) return "unknown";
  const name = (feature.text || "").trim();
  if (feature.place_type?.includes("poi")) {
    const landmark = classifyDestination(name);
    if (landmark.startsWith("airport-") || ["reichsburg", "burg-eltz"].includes(landmark)) return landmark;
  }
  const city = feature.place_type?.some(t => t === "place" || t === "locality")
    ? name
    : feature.context?.find(c => c.id.startsWith("place."))?.text
      || feature.context?.find(c => c.id.startsWith("locality."))?.text;
  if (!city) return "unknown";
  const result = classifyDestination(city);
  return result.startsWith("airport-") ? "other" : result;
}

// Place-level keys only: region/country, provider place ID and municipality name.
// Never construct these from an address, district, postcode, locality or search text.
const localityKeyPattern = /^locality:[A-Z]{2}(?:-[A-Z0-9]{1,5})?:place\.[A-Za-z0-9_-]{1,80}:[\p{L}\p{M}][\p{L}\p{M} .’'()\/-]{0,99}$/u;
export function isAnalyticsPlace(value: unknown): value is string {
  return typeof value === "string" && (destinations.includes(value as Destination) || localityKeyPattern.test(value));
}
export function resolvedAnalyticsPlace(feature?: PlaceFeature, airport?: string): string {
  if (airport) return classifyDestination("", airport);
  if (!feature) return "unknown";
  // Recognized airports and landmarks remain useful destination categories.
  if (feature.place_type?.includes("poi")) {
    const landmark = classifyDestination(feature.text || "");
    if (landmark.startsWith("airport-") || ["reichsburg", "burg-eltz"].includes(landmark)) return landmark;
  }
  const town = feature.place_type?.includes("place") ? feature : feature.context?.find(c => c.id.startsWith("place."));
  if (!town) return "unknown";
  const name = (town.text_de || town.text || "").normalize("NFC").trim().replace(/\s+/g, " ");
  const known = classifyDestination(name);
  const country = feature.context?.find(c => c.id.startsWith("country."))?.short_code?.toUpperCase();
  const region = feature.context?.find(c => c.id.startsWith("region."))?.short_code?.toUpperCase();
  if ((!country || country === "DE") && (!region || region === "DE-RP") && !["other","unknown"].includes(known) && !known.startsWith("airport-")) return known;
  const area = region && country && region.startsWith(country + "-") ? region : country;
  const key = `locality:${area || ""}:${town.id || ""}:${name}`;
  return localityKeyPattern.test(key) ? key : "unknown";
}
export function analyticsPlaceLabel(value?: string | null): string {
  if (!value || value === "unknown") return "Locality not identified";
  if (value === "other") return "Outside the former list (historical)";
  if (localityKeyPattern.test(value)) {
    const parts = value.split(":");
    return `${parts[3]} · ${parts[1]}`;
  }
  return destinationLabels[value as Destination] || "Locality not identified";
}
