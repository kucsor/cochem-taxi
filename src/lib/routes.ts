import { formatFareEstimate } from '@/lib/fare';
import type { FaqItem, LocalizedFaq, LocalizedList, LocalizedText } from '@/lib/locations';

/**
 * High-intent transfer routes from Cochem. These are separate from the village
 * pages in `locations.ts`: longer trips, booked ahead, with their own search
 * demand ("Taxi Cochem Burg Eltz", "Transfer Flughafen Hahn").
 */
export interface RouteData {
  slug: string;
  /** Destination name used in headings and metadata. */
  destination: LocalizedText;
  /** Approximate driving distance from Cochem, in km. */
  distanceKm: number;
  /** Approximate driving time from Cochem, in minutes. */
  driveMinutes: number;
  intro: LocalizedText;
  highlights: LocalizedList;
  faq: LocalizedFaq;
  /** Search term handed to the GetYourGuide widget on this page. */
  activitiesQuery: string;
}

export const routes: RouteData[] = [
  {
    slug: 'burg-eltz',
    destination: { de: 'Burg Eltz', en: 'Eltz Castle' },
    distanceKm: 30,
    driveMinutes: 35,
    activitiesQuery: 'Burg Eltz',
    intro: {
      de: 'Die Burg Eltz gehört zu den bekanntesten Burgen Deutschlands - und ist gleichzeitig eine der am schwersten erreichbaren. Mit öffentlichen Verkehrsmitteln ist die Anreise ab Cochem aufwendig und mit langen Wartezeiten verbunden. Mit dem Taxi fahren Sie direkt bis zum Besucherparkplatz Antoniuskapelle, von dort verkehrt in der Saison ein Pendelbus zur Burg, alternativ laufen Sie rund 30 Minuten durch den Wald.',
      en: 'Eltz Castle is one of the best-known castles in Germany - and also one of the hardest to reach. Getting there from Cochem by public transport is slow and involves long waiting times. By taxi you are driven straight to the Antoniuskapelle visitor car park; from there a shuttle bus runs to the castle in season, or you can walk about 30 minutes through the woods.',
    },
    highlights: {
      de: [
        'Direkte Fahrt zum Besucherparkplatz Antoniuskapelle',
        'Keine Umstiege und keine Wartezeiten auf Anschlüsse',
        'Rückfahrt zur vereinbarten Uhrzeit - auch für Gruppen',
        'Kombinierbar mit einem Stopp in Treis-Karden oder Moselkern',
      ],
      en: [
        'Direct drive to the Antoniuskapelle visitor car park',
        'No changes and no waiting for connections',
        'Return trip at an agreed time - groups welcome',
        'Can be combined with a stop in Treis-Karden or Moselkern',
      ],
    },
    faq: {
      de: [
        {
          question: 'Wie komme ich von Cochem am besten zur Burg Eltz?',
          answer: 'Die schnellste Verbindung ist die direkte Fahrt mit dem Taxi bis zum Besucherparkplatz. Mit Bus und Bahn müssen Sie in der Regel mehrfach umsteigen und zusätzlich vom Bahnhof Moselkern rund eine Stunde durch das Eltzbachtal wandern.',
        },
        {
          question: 'Können Sie uns nach der Burgbesichtigung wieder abholen?',
          answer: 'Ja. Vereinbaren Sie die Abholzeit am besten schon bei der Hinfahrt. Für eine Führung inklusive Schatzkammer sollten Sie ungefähr zwei Stunden einplanen. Am Parkplatz ist der Handyempfang meist ausreichend, im Eltzbachtal jedoch nicht durchgehend.',
        },
      ],
      en: [
        {
          question: 'What is the best way to get from Cochem to Eltz Castle?',
          answer: 'The fastest option is a direct taxi to the visitor car park. By bus and train you normally have to change several times and then walk about an hour up the Eltz valley from Moselkern station.',
        },
        {
          question: 'Can you pick us up again after visiting the castle?',
          answer: 'Yes. It is best to agree the pickup time when we drive you there. Allow roughly two hours for a guided tour including the treasury. Mobile reception at the car park is usually fine, but not consistent down in the Eltz valley.',
        },
      ],
    },
  },
  {
    slug: 'flughafen-hahn',
    destination: { de: 'Flughafen Frankfurt-Hahn', en: 'Frankfurt-Hahn Airport' },
    distanceKm: 40,
    driveMinutes: 40,
    activitiesQuery: 'Mosel',
    intro: {
      de: 'Der Flughafen Frankfurt-Hahn liegt rund 40 Kilometer von Cochem entfernt im Hunsrück. Für frühe Abflüge und späte Ankünfte ist das Taxi oft die einzige verlässliche Option, da die Busverbindungen nur zu wenigen Zeiten fahren. Wir holen Sie an Ihrer Adresse ab und bringen Sie direkt zum Terminal - mit Gepäck und ohne Umsteigen.',
      en: 'Frankfurt-Hahn Airport is about 40 kilometres from Cochem, in the Hunsrück hills. For early departures and late arrivals a taxi is often the only reliable option, as buses run only at a few times of day. We collect you at your address and drive you straight to the terminal - with your luggage and without changing.',
    },
    highlights: {
      de: [
        'Direkter Transfer von der Haustür zum Terminal',
        'Auch nachts und am frühen Morgen möglich',
        'Platz für Gepäck, Großraumwagen für 5 bis 8 Personen',
        'Abholung bei Ankunft - wir beobachten die Landezeit',
      ],
      en: [
        'Door-to-terminal transfer',
        'Available at night and in the early morning',
        'Room for luggage, large vehicles for 5 to 8 passengers',
        'Arrival pickups - we keep an eye on your landing time',
      ],
    },
    faq: {
      de: [
        {
          question: 'Wie früh sollte ich den Flughafentransfer bestellen?',
          answer: 'Bestellen Sie den Transfer möglichst ein bis zwei Tage im Voraus, besonders für Abflüge vor 6 Uhr. Planen Sie neben den rund 40 Minuten Fahrzeit auch ausreichend Zeit für Check-in und Sicherheitskontrolle ein.',
        },
        {
          question: 'Gibt es einen Festpreis für die Fahrt zum Flughafen Hahn?',
          answer: 'Für längere Strecken wie den Flughafentransfer können Sie uns bei der telefonischen Bestellung nach einem Festpreis fragen. Der Rechner auf dieser Seite zeigt Ihnen vorab einen unverbindlichen Schätzwert.',
        },
      ],
      en: [
        {
          question: 'How far in advance should I book an airport transfer?',
          answer: 'Book one to two days ahead where possible, especially for departures before 6 a.m. Besides the roughly 40 minutes of driving, allow enough time for check-in and security.',
        },
        {
          question: 'Is there a fixed price for the trip to Frankfurt-Hahn?',
          answer: 'For longer trips such as airport transfers you can ask us about a fixed price when booking by phone. The calculator on this page gives you a non-binding estimate up front.',
        },
      ],
    },
  },
  {
    slug: 'koblenz',
    destination: { de: 'Koblenz', en: 'Koblenz' },
    distanceKm: 55,
    driveMinutes: 50,
    activitiesQuery: 'Koblenz',
    intro: {
      de: 'Koblenz liegt rund 55 Kilometer moselabwärts von Cochem, dort wo Mosel und Rhein am Deutschen Eck zusammenfließen. Die Bahnverbindung ist gut, aber wer früh morgens, spät abends oder mit viel Gepäck unterwegs ist, fährt mit dem Taxi entspannter. Wir bringen Sie zum Hauptbahnhof, zur Innenstadt oder direkt zu Ihrer Wunschadresse.',
      en: 'Koblenz lies about 55 kilometres downstream from Cochem, where the Moselle meets the Rhine at the Deutsches Eck. Train connections are good, but travelling early, late or with a lot of luggage is more comfortable by taxi. We take you to the main station, the city centre or straight to your address.',
    },
    highlights: {
      de: [
        'Fahrt zum Hauptbahnhof Koblenz oder in die Innenstadt',
        'Sinnvoll bei frühen ICE-Verbindungen und viel Gepäck',
        'Auch als Rückfahrt nach Konzerten und Veranstaltungen',
        'Zustieg direkt an Ihrer Adresse in Cochem',
      ],
      en: [
        'Trips to Koblenz main station or the city centre',
        'Useful for early ICE connections and heavy luggage',
        'Also for return trips after concerts and events',
        'Pickup directly at your address in Cochem',
      ],
    },
    faq: {
      de: [
        {
          question: 'Wann lohnt sich das Taxi nach Koblenz gegenüber der Bahn?',
          answer: 'Vor allem außerhalb der Betriebszeiten der Bahn, bei Anschlüssen mit langen Umsteigezeiten, bei Reisen mit mehreren Personen und mit viel Gepäck. Zu viert ist die Fahrt pro Person deutlich günstiger als vier Einzelfahrscheine plus Umstiege.',
        },
      ],
      en: [
        {
          question: 'When is a taxi to Koblenz better than the train?',
          answer: 'Mainly outside train operating hours, when connections involve long waits, when travelling as a group, or with a lot of luggage. For four people the fare per head compares well with four separate tickets plus changes.',
        },
      ],
    },
  },
  {
    slug: 'trier',
    destination: { de: 'Trier', en: 'Trier' },
    distanceKm: 90,
    driveMinutes: 75,
    activitiesQuery: 'Trier',
    intro: {
      de: 'Trier, die älteste Stadt Deutschlands, liegt rund 90 Kilometer moselaufwärts von Cochem. Die Fahrt dauert etwa 75 Minuten über die A1 beziehungsweise entlang der Mosel. Wir fahren Sie zur Porta Nigra, zum Hauptbahnhof oder zu Ihrem Hotel - für diese Strecke bitten wir um eine rechtzeitige Vorbestellung.',
      en: 'Trier, the oldest city in Germany, lies about 90 kilometres upstream from Cochem. The drive takes roughly 75 minutes via the A1 motorway or along the Moselle. We take you to the Porta Nigra, the main station or your hotel - please book this route well in advance.',
    },
    highlights: {
      de: [
        'Porta Nigra, Kaiserthermen und Trierer Dom',
        'Fahrt über die A1 oder die landschaftliche Moselroute',
        'Geeignet für Tagesausflüge mit Rückfahrt am Abend',
        'Großraumwagen für Gruppen bis 8 Personen',
      ],
      en: [
        'Porta Nigra, Imperial Baths and Trier Cathedral',
        'Via the A1 motorway or the scenic Moselle route',
        'Suitable for day trips with an evening return',
        'Large vehicles for groups of up to 8 people',
      ],
    },
    faq: {
      de: [
        {
          question: 'Ist ein Tagesausflug nach Trier mit Rückfahrt möglich?',
          answer: 'Ja. Viele Gäste lassen sich morgens nach Trier bringen und abends wieder abholen. Sprechen Sie uns bei der Bestellung darauf an, damit wir Hin- und Rückfahrt gemeinsam einplanen können.',
        },
      ],
      en: [
        {
          question: 'Is a day trip to Trier with a return journey possible?',
          answer: 'Yes. Many guests are driven to Trier in the morning and collected again in the evening. Mention it when booking so we can schedule both legs together.',
        },
      ],
    },
  },
];

export function getRoute(slug: string): RouteData | undefined {
  return routes.find((route) => route.slug === slug);
}

/** Same idea as `buildLocationFaq`: data-driven price/time entries plus written ones. */
export function buildRouteFaq(route: RouteData, lang: 'de' | 'en'): FaqItem[] {
  const dayPrice = formatFareEstimate(route.distanceKm, { locale: lang });
  const largePrice = formatFareEstimate(route.distanceKm, { locale: lang, large: true });
  const destination = route.destination[lang];

  const generated: FaqItem[] = lang === 'de'
    ? [
        {
          question: `Was kostet ein Taxi von Cochem nach ${destination}?`,
          answer: `Für die rund ${route.distanceKm} km lange Strecke liegt der Schätzwert tagsüber bei etwa ${dayPrice} im Standardfahrzeug und bei etwa ${largePrice} im Großraumwagen für 5 bis 8 Personen. Der Wert ist unverbindlich - maßgeblich ist der Taxameter beziehungsweise ein vorab vereinbarter Festpreis.`,
        },
        {
          question: `Wie lange dauert die Fahrt von Cochem nach ${destination}?`,
          answer: `Rechnen Sie mit etwa ${route.driveMinutes} Minuten reiner Fahrzeit. Je nach Verkehrslage und Wetter kann es etwas länger dauern - planen Sie bei Terminen und Abflügen daher einen Puffer ein.`,
        },
      ]
    : [
        {
          question: `How much does a taxi from Cochem to ${destination} cost?`,
          answer: `For the roughly ${route.distanceKm} km trip the estimate is around ${dayPrice} in a standard car and around ${largePrice} in a large vehicle for 5 to 8 passengers during the day. The figure is non-binding - the taximeter or a fixed price agreed in advance applies.`,
        },
        {
          question: `How long does the drive from Cochem to ${destination} take?`,
          answer: `Allow around ${route.driveMinutes} minutes of driving time. Traffic and weather can add to that, so build in a buffer for appointments and flights.`,
        },
      ];

  return [...generated, ...route.faq[lang]];
}
