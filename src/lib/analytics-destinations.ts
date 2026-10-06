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
  for (const k of [...destinations].sort((a, b) => b.length - a.length)) {
    if (k.startsWith("airport-") || ["other", "unknown"].includes(k)) continue;
    const term = k === "zell-mosel" ? "zell" : k.replace(/-/g, "[ -]");
    if (new RegExp(`(^|[^a-z])${term}($|[^a-z])`).test(q)) return k;
  }
  return "other";
}
