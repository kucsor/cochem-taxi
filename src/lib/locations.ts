
export interface LocationData {
  slug: string;
  name: string; // Display name (e.g., "Klotten")
}

export const locations: LocationData[] = [
  { slug: 'taxi-klotten', name: 'Klotten' },
  { slug: 'taxi-valwig', name: 'Valwig' },
  { slug: 'taxi-valwigerberg', name: 'Valwigerberg' },
  { slug: 'taxi-bruttig-fankel', name: 'Bruttig-Fankel' },
  { slug: 'taxi-ernst', name: 'Ernst' },
  { slug: 'taxi-beilstein', name: 'Beilstein' },
  { slug: 'taxi-landkern', name: 'Landkern' },
  { slug: 'taxi-faid', name: 'Faid' },
];

export function getLocation(slug: string): LocationData | undefined {
  return locations.find((loc) => loc.slug === slug);
}
