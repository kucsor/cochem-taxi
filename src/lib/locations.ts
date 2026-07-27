import { formatFareEstimate } from '@/lib/fare';

export type LocalizedText = { de: string; en: string };
export type LocalizedList = { de: string[]; en: string[] };
export type FaqItem = { question: string; answer: string };
export type LocalizedFaq = { de: FaqItem[]; en: FaqItem[] };

export interface LocationData {
  slug: string;
  /** Display name (e.g., "Klotten") */
  name: string;
  postalCode: string;
  /** Approximate driving distance from Cochem town centre, in km. */
  distanceKm: number;
  /** Approximate driving time from Cochem, in minutes. */
  driveMinutes: number;
  /** Two to three sentences of unique introduction text. */
  intro: LocalizedText;
  /** Reasons people order a taxi to/from this village. */
  highlights: LocalizedList;
  /** Questions specific to this village - generic price/time ones are generated. */
  faq: LocalizedFaq;
}

export const locations: LocationData[] = [
  {
    slug: 'taxi-klotten',
    name: 'Klotten',
    postalCode: '56818',
    distanceKm: 3.5,
    driveMinutes: 7,
    intro: {
      de: 'Klotten liegt nur wenige Minuten flussabwärts von Cochem und ist damit unser kürzester Einsatzort. Weil der Ort direkt an der B49 liegt, sind wir in der Regel sehr schnell bei Ihnen. Besonders gefragt sind Fahrten zum Wild- und Freizeitpark Klotten sowie Rückfahrten von den Weingütern im Ort.',
      en: 'Klotten sits just a few minutes downstream from Cochem, making it our shortest run. Because the village lies directly on the B49 main road, we usually reach you very quickly. The most common trips are to the Klotten Wildlife and Leisure Park and rides back from the local wineries.',
    },
    highlights: {
      de: [
        'Wild- und Freizeitpark Klotten - beliebt bei Familien mit Kindern',
        'Weingüter und Straußwirtschaften im Ortskern',
        'Bahnhof Cochem in unter 10 Minuten erreichbar',
        'Wanderparkplätze am Brauselay-Klettersteig',
      ],
      en: [
        'Klotten Wildlife and Leisure Park - a favourite with families',
        'Wineries and traditional wine taverns in the village centre',
        'Cochem railway station reachable in under 10 minutes',
        'Trailheads for the Brauselay via ferrata',
      ],
    },
    faq: {
      de: [
        {
          question: 'Fahren Sie auch zum Wild- und Freizeitpark Klotten?',
          answer: 'Ja. Wir fahren Sie direkt bis zum Parkeingang und holen Sie zur vereinbarten Zeit wieder ab. Für die Rückfahrt am Nachmittag empfehlen wir eine Vorbestellung, da dann viele Familien gleichzeitig aufbrechen.',
        },
      ],
      en: [
        {
          question: 'Do you also drive to the Klotten Wildlife and Leisure Park?',
          answer: 'Yes. We drop you off directly at the park entrance and pick you up at an agreed time. For afternoon return trips we recommend booking in advance, as many families leave at the same time.',
        },
      ],
    },
  },
  {
    slug: 'taxi-valwig',
    name: 'Valwig',
    postalCode: '56812',
    distanceKm: 5,
    driveMinutes: 9,
    intro: {
      de: 'Valwig liegt auf der gegenüberliegenden Moselseite, nur wenige Kilometer von Cochem entfernt. Der Weinort ist bekannt für seine Steillagen und die urigen Straußwirtschaften. Gerade abends nach einer Weinprobe ist das Taxi die sichere Wahl für den Rückweg.',
      en: 'Valwig lies on the opposite bank of the Moselle, only a few kilometres from Cochem. The wine village is known for its steep vineyards and rustic wine taverns. After an evening wine tasting, a taxi is the safe way home.',
    },
    highlights: {
      de: [
        'Straußwirtschaften und Weinproben im Ort',
        'Moselsteig-Etappen mit Start und Ziel in Valwig',
        'Fährverbindung und Moselbrücke Richtung Cochem',
        'Ruhige Ferienwohnungen und Pensionen',
      ],
      en: [
        'Wine taverns and tastings in the village',
        'Moselsteig hiking stages starting and ending in Valwig',
        'Ferry connection and Moselle bridge towards Cochem',
        'Quiet holiday flats and guesthouses',
      ],
    },
    faq: {
      de: [
        {
          question: 'Holen Sie uns nach einer Weinprobe in Valwig ab?',
          answer: 'Ja, das ist eine unserer häufigsten Fahrten. Sagen Sie uns am besten schon bei der Bestellung, wann Sie fertig sind - dann steht der Wagen pünktlich vor der Straußwirtschaft.',
        },
      ],
      en: [
        {
          question: 'Will you pick us up after a wine tasting in Valwig?',
          answer: 'Yes, this is one of our most frequent trips. Tell us your planned finishing time when you book and the car will be waiting outside the wine tavern.',
        },
      ],
    },
  },
  {
    slug: 'taxi-valwigerberg',
    name: 'Valwigerberg',
    postalCode: '56812',
    distanceKm: 7,
    driveMinutes: 13,
    intro: {
      de: 'Valwigerberg liegt auf der Höhe über dem Moseltal und ist zu Fuß nur mit einem längeren Anstieg zu erreichen. Genau deshalb wird das Taxi hier oft gebucht - besonders von Wanderern und Gästen der Ferienhöfe. Die Strecke führt über die Serpentinen hinauf und dauert etwas länger als die reine Kilometerzahl vermuten lässt.',
      en: 'Valwigerberg sits on the plateau above the Moselle valley and can only be reached on foot via a long climb. That is exactly why taxis are booked here so often, especially by hikers and guests of the holiday farms. The route winds up the hairpin bends, so it takes slightly longer than the distance suggests.',
    },
    highlights: {
      de: [
        'Ferienhöfe und Reiterhöfe auf der Höhe',
        'Aussichtspunkte über das Moseltal',
        'Startpunkt für Wanderungen Richtung Valwig und Cochem',
        'Kein regelmäßiger Busverkehr am Abend',
      ],
      en: [
        'Holiday farms and riding stables on the plateau',
        'Viewpoints over the Moselle valley',
        'Starting point for hikes towards Valwig and Cochem',
        'No regular bus service in the evening',
      ],
    },
    faq: {
      de: [
        {
          question: 'Lohnt sich das Taxi von Valwig hinauf nach Valwigerberg?',
          answer: 'Für die meisten Gäste ja. Der Anstieg zu Fuß dauert je nach Tempo 45 bis 60 Minuten, mit dem Taxi sind es wenige Minuten - besonders angenehm mit Gepäck oder nach einer Wanderung.',
        },
      ],
      en: [
        {
          question: 'Is a taxi from Valwig up to Valwigerberg worth it?',
          answer: 'For most guests, yes. The climb on foot takes 45 to 60 minutes depending on your pace, while the taxi takes only a few minutes - especially welcome with luggage or after a long hike.',
        },
      ],
    },
  },
  {
    slug: 'taxi-bruttig-fankel',
    name: 'Bruttig-Fankel',
    postalCode: '56814',
    distanceKm: 8,
    driveMinutes: 12,
    intro: {
      de: 'Bruttig-Fankel besteht aus zwei Ortsteilen direkt an der Mosel und ist für seine Fachwerkhäuser und Weingüter bekannt. Wir fahren beide Ortsteile an - sagen Sie uns bei der Bestellung einfach, ob es nach Bruttig oder nach Fankel gehen soll. Viele Fahrten gehen abends zurück nach Cochem oder morgens zum Bahnhof.',
      en: 'Bruttig-Fankel consists of two districts right on the Moselle and is known for its half-timbered houses and wineries. We serve both districts - simply tell us whether you need Bruttig or Fankel when booking. Many rides go back to Cochem in the evening or to the station in the morning.',
    },
    highlights: {
      de: [
        'Historische Fachwerkhäuser und Weingüter',
        'Moselradweg und Anlegestellen der Ausflugsschiffe',
        'Zwei Ortsteile - Abholung direkt an der Adresse',
        'Beliebt für Gruppenfahrten nach Weinproben',
      ],
      en: [
        'Historic half-timbered houses and wineries',
        'Moselle cycle path and excursion boat landings',
        'Two districts - pickup directly at your address',
        'Popular for group rides after wine tastings',
      ],
    },
    faq: {
      de: [
        {
          question: 'Können Sie eine größere Gruppe von Bruttig-Fankel abholen?',
          answer: 'Ja. Für 5 bis 8 Personen setzen wir einen Großraumwagen ein. Bitte geben Sie die Personenzahl bei der Bestellung an, damit wir das passende Fahrzeug einplanen - der Tarif für Großraumfahrzeuge liegt etwas höher.',
        },
      ],
      en: [
        {
          question: 'Can you pick up a larger group from Bruttig-Fankel?',
          answer: 'Yes. For 5 to 8 people we send a large vehicle. Please state the number of passengers when booking so we can schedule the right car - the large-vehicle tariff is slightly higher.',
        },
      ],
    },
  },
  {
    slug: 'taxi-ernst',
    name: 'Ernst',
    postalCode: '56814',
    distanceKm: 6,
    driveMinutes: 10,
    intro: {
      de: 'Ernst ist ein kleiner Weinort zwischen Cochem und Bruttig, direkt am Moselufer gelegen. Die Anfahrt ist kurz und führt entlang der Uferstraße. Häufig gebucht werden Fahrten zu den Weingütern sowie Transfers zum Bahnhof Cochem für die Weiterfahrt Richtung Koblenz oder Trier.',
      en: 'Ernst is a small wine village between Cochem and Bruttig, right on the bank of the Moselle. The drive is short and follows the riverside road. Typical bookings are trips to the wineries and transfers to Cochem station for onward travel towards Koblenz or Trier.',
    },
    highlights: {
      de: [
        'Weingüter direkt am Moselufer',
        'Kurze Anfahrt über die Uferstraße',
        'Transfers zum Bahnhof Cochem',
        'Ferienwohnungen mit Moselblick',
      ],
      en: [
        'Wineries directly on the riverbank',
        'Short drive along the riverside road',
        'Transfers to Cochem railway station',
        'Holiday flats with Moselle views',
      ],
    },
    faq: {
      de: [
        {
          question: 'Wie früh sollte ich das Taxi für den Zug ab Cochem bestellen?',
          answer: 'Planen Sie ab Ernst rund 20 Minuten Puffer ein: etwa 10 Minuten Fahrzeit plus Zeit für Gepäck und Bahnsteig. Bei Frühfahrten vor 6 Uhr bitten wir um Vorbestellung am Vortag.',
        },
      ],
      en: [
        {
          question: 'How early should I book a taxi for a train from Cochem?',
          answer: 'Allow around 20 minutes from Ernst: roughly 10 minutes of driving plus time for luggage and the platform. For early trips before 6 a.m. please book the day before.',
        },
      ],
    },
  },
  {
    slug: 'taxi-beilstein',
    name: 'Beilstein',
    postalCode: '56814',
    distanceKm: 11,
    driveMinutes: 16,
    intro: {
      de: 'Beilstein wird nicht ohne Grund "Dornröschen der Mosel" genannt: Der mittelalterliche Ortskern mit Burg Metternich zieht täglich Besucher an. Parkplätze sind im Ort knapp, deshalb ist die Anreise mit dem Taxi oft die entspanntere Lösung. Wir fahren Sie bis zum Ortseingang, von wo aus alles fußläufig erreichbar ist.',
      en: 'Beilstein is called the "Sleeping Beauty of the Moselle" for good reason: the medieval centre with Metternich Castle draws visitors every day. Parking in the village is scarce, so arriving by taxi is often the more relaxed option. We drop you at the village entrance, from where everything is within walking distance.',
    },
    highlights: {
      de: [
        'Burg Metternich hoch über dem Ort',
        'Mittelalterlicher Ortskern - autofrei und eng bebaut',
        'Sehr begrenzte Parkmöglichkeiten für Tagesgäste',
        'Anlegestelle der Moselschifffahrt',
      ],
      en: [
        'Metternich Castle high above the village',
        'Medieval centre - car-free and densely built',
        'Very limited parking for day visitors',
        'Moselle boat trip landing stage',
      ],
    },
    faq: {
      de: [
        {
          question: 'Warum lohnt sich die Anfahrt nach Beilstein mit dem Taxi?',
          answer: 'Der historische Ortskern ist eng und die wenigen Parkplätze am Ortsrand sind in der Saison meist belegt. Mit dem Taxi entfällt die Parkplatzsuche, und Sie können den Ort direkt zu Fuß erkunden - auf Wunsch holen wir Sie später wieder ab.',
        },
      ],
      en: [
        {
          question: 'Why is it worth taking a taxi to Beilstein?',
          answer: 'The historic centre is narrow and the few car parks on the edge of the village are usually full in season. A taxi removes the parking hunt and you can explore the village on foot straight away - we will collect you again later if you wish.',
        },
      ],
    },
  },
  {
    slug: 'taxi-landkern',
    name: 'Landkern',
    postalCode: '56814',
    distanceKm: 9,
    driveMinutes: 14,
    intro: {
      de: 'Landkern liegt auf der Höhe zwischen Cochem und Kaisersesch, abseits des Moseltals. Die Busverbindungen sind hier vor allem am Wochenende dünn, deshalb ist das Taxi eine feste Größe für Berufspendler und Gäste. Die Fahrt führt über die Höhenstraße und ist auch bei winterlichem Wetter zuverlässig machbar.',
      en: 'Landkern lies on the plateau between Cochem and Kaisersesch, away from the Moselle valley. Bus connections here are thin, especially at weekends, so taxis are a fixture for commuters and guests alike. The route runs along the upland road and remains reliable even in winter weather.',
    },
    highlights: {
      de: [
        'Höhenlage zwischen Moseltal und Eifel',
        'Dünner Busverkehr, besonders am Wochenende',
        'Anbindung Richtung Kaisersesch und A48',
        'Ruhige Lage für Ferienunterkünfte',
      ],
      en: [
        'Upland location between the Moselle valley and the Eifel',
        'Sparse bus service, particularly at weekends',
        'Connections towards Kaisersesch and the A48 motorway',
        'Quiet setting for holiday accommodation',
      ],
    },
    faq: {
      de: [
        {
          question: 'Fahren Sie auch früh morgens von Landkern nach Cochem?',
          answer: 'Ja, wir sind rund um die Uhr erreichbar. Für Fahrten vor 6 Uhr - etwa zum Frühzug ab Cochem - bestellen Sie bitte am Vortag, dann ist der Wagen sicher eingeplant. Zwischen 22 und 6 Uhr gilt der Nachttarif.',
        },
      ],
      en: [
        {
          question: 'Do you also drive from Landkern to Cochem early in the morning?',
          answer: 'Yes, we are reachable around the clock. For trips before 6 a.m. - for example to catch an early train from Cochem - please book the day before so the car is reserved. The night tariff applies between 10 p.m. and 6 a.m.',
        },
      ],
    },
  },
  {
    slug: 'taxi-faid',
    name: 'Faid',
    postalCode: '56814',
    distanceKm: 6,
    driveMinutes: 11,
    intro: {
      de: 'Faid liegt auf der Höhe westlich von Cochem und ist über die Serpentinenstraße schnell erreichbar. Der Ort ist ein beliebter Ausgangspunkt für Wanderungen und beherbergt mehrere Ferienunterkünfte. Wir fahren Faid regelmäßig an - sowohl für Transfers zum Bahnhof als auch für Rückfahrten am Abend.',
      en: 'Faid sits on the plateau west of Cochem and is quickly reached via the winding hill road. The village is a popular starting point for hikes and has several holiday accommodations. We serve Faid regularly, both for station transfers and for evening return trips.',
    },
    highlights: {
      de: [
        'Ausgangspunkt für Wanderungen rund um Cochem',
        'Ferienwohnungen und Gasthöfe im Ort',
        'Schnelle Anbindung über die Höhenstraße',
        'Nähe zum Cochemer Krankenhaus',
      ],
      en: [
        'Starting point for hikes around Cochem',
        'Holiday flats and guesthouses in the village',
        'Fast connection via the upland road',
        'Close to the Cochem hospital',
      ],
    },
    faq: {
      de: [
        {
          question: 'Fahren Sie von Faid auch zu Arztterminen nach Cochem?',
          answer: 'Ja, Fahrten zu Arztpraxen und zum Krankenhaus in Cochem gehören zu unserem Alltag. Auf Wunsch warten wir vor Ort oder holen Sie nach dem Termin zu einer vereinbarten Zeit wieder ab.',
        },
      ],
      en: [
        {
          question: 'Do you also drive from Faid to medical appointments in Cochem?',
          answer: 'Yes, trips to doctors and the hospital in Cochem are part of our daily routine. On request we wait on site or collect you again at an agreed time after your appointment.',
        },
      ],
    },
  },
  {
    slug: 'taxi-treis-karden',
    name: 'Treis-Karden',
    postalCode: '56253',
    distanceKm: 12,
    driveMinutes: 15,
    intro: {
      de: 'Treis-Karden liegt moselabwärts Richtung Koblenz und besteht aus den beiden Ortsteilen Treis und Karden, getrennt durch die Mosel. Bekannt ist der Ort für die Stiftskirche St. Castor und als Ausgangspunkt zur Burg Eltz. Wir fahren beide Ortsteile sowie den Bahnhof Treis-Karden an.',
      en: 'Treis-Karden lies downstream towards Koblenz and consists of the two districts Treis and Karden, separated by the Moselle. The village is known for the St. Castor collegiate church and as a starting point for Eltz Castle. We serve both districts as well as Treis-Karden station.',
    },
    highlights: {
      de: [
        'Stiftskirche St. Castor in Karden',
        'Bahnhof Treis-Karden an der Moselstrecke',
        'Ausgangspunkt für Wanderungen zur Burg Eltz',
        'Zwei Ortsteile beidseits der Mosel',
      ],
      en: [
        'St. Castor collegiate church in Karden',
        'Treis-Karden station on the Moselle railway line',
        'Starting point for hikes to Eltz Castle',
        'Two districts on both sides of the Moselle',
      ],
    },
    faq: {
      de: [
        {
          question: 'Bringen Sie uns von Treis-Karden zur Burg Eltz?',
          answer: 'Ja. Von Treis-Karden aus ist die Burg Eltz in rund 20 Minuten erreichbar. Viele Gäste lassen sich zum Wanderparkplatz bringen und laufen das letzte Stück durch den Eltzbachtal-Wald. Vereinbaren Sie die Rückfahrt am besten gleich mit.',
        },
      ],
      en: [
        {
          question: 'Can you take us from Treis-Karden to Eltz Castle?',
          answer: 'Yes. Eltz Castle is about 20 minutes away from Treis-Karden. Many guests are dropped at the hikers car park and walk the last stretch through the Eltz valley woodland. It is best to arrange the return trip at the same time.',
        },
      ],
    },
  },
  {
    slug: 'taxi-ediger-eller',
    name: 'Ediger-Eller',
    postalCode: '56814',
    distanceKm: 12,
    driveMinutes: 17,
    intro: {
      de: 'Ediger-Eller ist einer der besterhaltenen historischen Weinorte an der Mosel, mit engen Gassen und einem denkmalgeschützten Ortsbild. Der Bahnhof Ediger-Eller liegt etwas außerhalb, weshalb Transfers ins Ortszentrum häufig gebucht werden. Auch die Weinlagen am Calmont gehören zu unseren regelmäßigen Zielen.',
      en: 'Ediger-Eller is one of the best-preserved historic wine villages on the Moselle, with narrow lanes and a listed village centre. The station lies slightly outside the village, which is why transfers into the centre are booked frequently. The Calmont vineyards are another regular destination.',
    },
    highlights: {
      de: [
        'Denkmalgeschützter Ortskern mit engen Gassen',
        'Bahnhof außerhalb - kurzer Transfer ins Zentrum',
        'Zugang zum Calmont-Klettersteig',
        'Weingüter und Vinotheken im Ort',
      ],
      en: [
        'Listed village centre with narrow lanes',
        'Station outside the village - short transfer to the centre',
        'Access to the Calmont via ferrata',
        'Wineries and wine shops in the village',
      ],
    },
    faq: {
      de: [
        {
          question: 'Holen Sie Wanderer am Calmont-Klettersteig ab?',
          answer: 'Ja. Der Klettersteig endet je nach Route bei Bremm oder Ediger-Eller. Sagen Sie uns bei der Bestellung, an welchem Ausstieg Sie herauskommen und wann - wir holen Sie dort ab. Nach dem Klettersteig ist eine Vorbestellung sinnvoll, da im Tal oft kein Empfang ist.',
        },
      ],
      en: [
        {
          question: 'Do you pick up hikers at the Calmont via ferrata?',
          answer: 'Yes. Depending on the route the trail ends near Bremm or Ediger-Eller. Tell us which exit you will use and when, and we will meet you there. Booking ahead makes sense, as mobile reception in the valley is often poor.',
        },
      ],
    },
  },
  {
    slug: 'taxi-senheim',
    name: 'Senheim',
    postalCode: '56820',
    distanceKm: 15,
    driveMinutes: 20,
    intro: {
      de: 'Senheim liegt in einer Moselschleife zwischen Cochem und Zell und ist über die Moselbrücke mit dem Ortsteil Senhals verbunden. Der Ort lebt vom Weinbau und vom Radtourismus am Moselradweg. Wir fahren Senheim und Senhals gleichermaßen an, auch mit Fahrradanhänger nach Absprache.',
      en: 'Senheim lies in a bend of the Moselle between Cochem and Zell and is connected to its district Senhals by the Moselle bridge. The village lives from viticulture and cycle tourism along the Moselle cycle path. We serve both Senheim and Senhals, and can arrange bicycle transport on request.',
    },
    highlights: {
      de: [
        'Lage direkt am Moselradweg',
        'Weingüter mit Verkostungen',
        'Ortsteil Senhals auf der anderen Moselseite',
        'Campingplatz und Ferienunterkünfte',
      ],
      en: [
        'Located directly on the Moselle cycle path',
        'Wineries offering tastings',
        'Senhals district on the opposite bank',
        'Campsite and holiday accommodation',
      ],
    },
    faq: {
      de: [
        {
          question: 'Können Sie Fahrräder mitnehmen?',
          answer: 'In begrenztem Umfang ja - bitte melden Sie Fahrräder unbedingt bei der Bestellung an, damit wir ein passendes Fahrzeug einplanen können. Für mehrere Räder oder E-Bikes sprechen Sie uns bitte frühzeitig telefonisch an.',
        },
      ],
      en: [
        {
          question: 'Can you carry bicycles?',
          answer: 'To a limited extent, yes - please mention bicycles when booking so we can assign a suitable vehicle. For several bikes or e-bikes, call us well in advance.',
        },
      ],
    },
  },
  {
    slug: 'taxi-bremm',
    name: 'Bremm',
    postalCode: '56814',
    distanceKm: 18,
    driveMinutes: 22,
    intro: {
      de: 'Bremm liegt am Fuß des Calmont, des steilsten Weinbergs Europas. Der Ort ist Ziel vieler Tagesgäste, die den Calmont-Klettersteig gehen oder die Aussicht auf die Moselschleife genießen wollen. Wir bringen Sie zum Einstieg des Klettersteigs und holen Sie am Ausstieg wieder ab.',
      en: 'Bremm lies at the foot of the Calmont, the steepest vineyard in Europe. The village attracts day visitors who want to tackle the Calmont via ferrata or enjoy the view over the Moselle loop. We take you to the start of the trail and collect you at the exit.',
    },
    highlights: {
      de: [
        'Calmont - steilster Weinberg Europas',
        'Klettersteig mit Ein- und Ausstieg bei Bremm',
        'Aussichtspunkt auf die Moselschleife',
        'Weingüter mit Steillagenweinen',
      ],
      en: [
        'Calmont - the steepest vineyard in Europe',
        'Via ferrata with entry and exit near Bremm',
        'Viewpoint over the Moselle loop',
        'Wineries producing steep-slope wines',
      ],
    },
    faq: {
      de: [
        {
          question: 'Wie planen wir die Fahrt zum Calmont-Klettersteig?',
          answer: 'Wir bringen Sie morgens zum Einstieg bei Bremm. Für den Klettersteig sollten Sie je nach Kondition zwei bis drei Stunden einplanen. Vereinbaren Sie die Abholung am Ausstieg gleich bei der Hinfahrt - im Steig selbst ist der Handyempfang unzuverlässig.',
        },
      ],
      en: [
        {
          question: 'How do we plan a trip to the Calmont via ferrata?',
          answer: 'We take you to the entry point near Bremm in the morning. Depending on fitness, allow two to three hours for the trail. Arrange the pickup at the exit when we drive you there - mobile reception on the route itself is unreliable.',
        },
      ],
    },
  },
  {
    slug: 'taxi-briedern',
    name: 'Briedern',
    postalCode: '56820',
    distanceKm: 13,
    driveMinutes: 18,
    intro: {
      de: 'Briedern liegt zwischen Senheim und Beilstein an einer ruhigen Moselschleife. Der Ort ist bei Radfahrern und Wanderern beliebt, hat aber nur eine eingeschränkte Busanbindung. Fahrten nach Cochem oder zum Bahnhof gehören deshalb zu unseren Standardstrecken.',
      en: 'Briedern lies between Senheim and Beilstein on a quiet bend of the Moselle. The village is popular with cyclists and hikers but has only limited bus service. Trips to Cochem or the railway station are therefore among our standard routes.',
    },
    highlights: {
      de: [
        'Ruhige Lage an der Mosel',
        'Moselradweg direkt am Ort',
        'Eingeschränkter Busverkehr am Abend',
        'Nähe zu Beilstein und Senheim',
      ],
      en: [
        'Quiet location on the Moselle',
        'Moselle cycle path right by the village',
        'Limited bus service in the evening',
        'Close to Beilstein and Senheim',
      ],
    },
    faq: {
      de: [
        {
          question: 'Fahren Sie abends von Briedern zurück nach Cochem?',
          answer: 'Ja, auch spät. Wir sind 24 Stunden erreichbar, zwischen 22 und 6 Uhr gilt der Nachttarif. Bei Rückfahrten nach einem Restaurantbesuch empfiehlt sich eine kurze telefonische Vorbestellung.',
        },
      ],
      en: [
        {
          question: 'Do you drive back from Briedern to Cochem in the evening?',
          answer: 'Yes, including late at night. We are available 24 hours; the night tariff applies between 10 p.m. and 6 a.m. For return trips after dinner, a short phone booking in advance is recommended.',
        },
      ],
    },
  },
  {
    slug: 'taxi-kaisersesch',
    name: 'Kaisersesch',
    postalCode: '56759',
    distanceKm: 13,
    driveMinutes: 17,
    intro: {
      de: 'Kaisersesch liegt in der Eifel oberhalb des Moseltals und ist Endpunkt der Bahnstrecke von Andernach. Viele Fahrgäste nutzen das Taxi für die Verbindung zwischen Bahnhof Kaisersesch und Cochem oder den Moselorten. Auch Fahrten zur Autobahnauffahrt A48 sind häufig.',
      en: 'Kaisersesch lies in the Eifel above the Moselle valley and is the terminus of the railway line from Andernach. Many passengers use a taxi to connect between Kaisersesch station and Cochem or the Moselle villages. Trips to the A48 motorway junction are also common.',
    },
    highlights: {
      de: [
        'Bahnhof Kaisersesch - Endpunkt der Strecke aus Andernach',
        'Anbindung an die A48 Richtung Koblenz und Trier',
        'Historischer Stadtkern mit Stadtmauerresten',
        'Gewerbegebiet und Arbeitgeber in der Region',
      ],
      en: [
        'Kaisersesch station - terminus of the line from Andernach',
        'Access to the A48 motorway towards Koblenz and Trier',
        'Historic town centre with remains of the town wall',
        'Business park and regional employers',
      ],
    },
    faq: {
      de: [
        {
          question: 'Verbinden Sie den Bahnhof Kaisersesch mit Cochem?',
          answer: 'Ja, das ist eine unserer häufigsten Verbindungen. Die Fahrt dauert etwa 17 Minuten. Wenn Sie uns Ihre Ankunftszeit nennen, warten wir am Bahnhof - auch wenn sich der Zug verspätet.',
        },
      ],
      en: [
        {
          question: 'Do you connect Kaisersesch station with Cochem?',
          answer: 'Yes, this is one of our most frequent connections. The drive takes around 17 minutes. Give us your arrival time and we will wait at the station - even if your train is delayed.',
        },
      ],
    },
  },
  {
    slug: 'taxi-ulmen',
    name: 'Ulmen',
    postalCode: '56766',
    distanceKm: 25,
    driveMinutes: 25,
    intro: {
      de: 'Ulmen liegt in der Vulkaneifel, bekannt durch den Ulmener Maar direkt am Ortsrand und die Burgruine. Die Fahrt von Cochem führt über die Höhen der Eifel und dauert rund 25 Minuten. Wir fahren Ulmen unter anderem für Transfers zur A48 und zu Ferienunterkünften in der Vulkaneifel an.',
      en: 'Ulmen lies in the Volcanic Eifel, known for the Ulmener Maar crater lake on the edge of town and the castle ruins. The drive from Cochem crosses the Eifel uplands and takes around 25 minutes. We serve Ulmen for transfers to the A48 motorway and to holiday accommodation in the Volcanic Eifel.',
    },
    highlights: {
      de: [
        'Ulmener Maar - jüngster Vulkankrater Deutschlands',
        'Burgruine Ulmen über dem Ort',
        'Anschluss an die A48',
        'Ferienunterkünfte in der Vulkaneifel',
      ],
      en: [
        'Ulmener Maar - the youngest volcanic crater in Germany',
        'Ulmen castle ruins above the town',
        'Connection to the A48 motorway',
        'Holiday accommodation in the Volcanic Eifel',
      ],
    },
    faq: {
      de: [
        {
          question: 'Ist die Strecke Cochem - Ulmen auch im Winter befahrbar?',
          answer: 'In der Regel ja. Die Höhenstraßen der Eifel werden geräumt, bei starkem Schneefall kann die Fahrt aber etwas länger dauern. Rufen Sie im Zweifel kurz an - wir sagen Ihnen, wie die Lage aktuell ist.',
        },
      ],
      en: [
        {
          question: 'Is the Cochem - Ulmen route passable in winter?',
          answer: 'Usually yes. The Eifel upland roads are cleared, though heavy snowfall can make the journey take a little longer. If in doubt, give us a quick call and we will tell you the current situation.',
        },
      ],
    },
  },
  {
    slug: 'taxi-zell-mosel',
    name: 'Zell (Mosel)',
    postalCode: '56856',
    distanceKm: 30,
    driveMinutes: 35,
    intro: {
      de: 'Zell an der Mosel ist vor allem für den Wein "Zeller Schwarze Katz" bekannt und liegt rund 30 Kilometer moselaufwärts von Cochem. Die Fahrt entlang der Mosel ist landschaftlich reizvoll und dauert etwa 35 Minuten. Gebucht wird die Strecke häufig für Weinproben, Feste und Transfers zwischen Hotels.',
      en: 'Zell on the Moselle is best known for its "Zeller Schwarze Katz" wine and lies about 30 kilometres upstream from Cochem. The drive along the river is scenic and takes roughly 35 minutes. The route is often booked for wine tastings, festivals and hotel transfers.',
    },
    highlights: {
      de: [
        'Weinort der "Zeller Schwarzen Katz"',
        'Weinfeste und Vinotheken im Ortskern',
        'Moselpromenade und Schiffsanlegestelle',
        'Beliebte Strecke für Hoteltransfers',
      ],
      en: [
        'Home of the "Zeller Schwarze Katz" wine',
        'Wine festivals and wine shops in the centre',
        'Moselle promenade and boat landing stage',
        'Popular route for hotel transfers',
      ],
    },
    faq: {
      de: [
        {
          question: 'Lohnt sich eine Vorbestellung für die Fahrt nach Zell?',
          answer: 'Ja, unbedingt. Zell liegt rund 35 Minuten entfernt, wir planen die Fahrt daher fest ein. Besonders während der Weinfeste im Sommer und Herbst sollten Sie frühzeitig bestellen - dann sind die Wagen schnell ausgebucht.',
        },
      ],
      en: [
        {
          question: 'Should I book in advance for a trip to Zell?',
          answer: 'Yes, definitely. Zell is around 35 minutes away, so we schedule the trip as a fixed booking. During the wine festivals in summer and autumn in particular, book early - cars fill up quickly.',
        },
      ],
    },
  },
];

export function getLocation(slug: string): LocationData | undefined {
  return locations.find((loc) => loc.slug === slug);
}

/**
 * Builds the FAQ shown on a location page: two data-driven entries (price and
 * duration, unique per village because the numbers differ) plus the entries
 * written specifically for that village.
 */
export function buildLocationFaq(location: LocationData, lang: 'de' | 'en'): FaqItem[] {
  const dayPrice = formatFareEstimate(location.distanceKm, { locale: lang });
  const nightPrice = formatFareEstimate(location.distanceKm, { locale: lang, night: true });

  const generated: FaqItem[] = lang === 'de'
    ? [
        {
          question: `Was kostet ein Taxi von Cochem nach ${location.name}?`,
          answer: `Für die rund ${location.distanceKm} km lange Strecke liegt der Preis tagsüber bei etwa ${dayPrice}, nachts (22 bis 6 Uhr) bei etwa ${nightPrice}. Es handelt sich um einen unverbindlichen Schätzwert - der genaue Fahrpreis richtet sich nach der tatsächlich gefahrenen Strecke und dem Taxameter.`,
        },
        {
          question: `Wie lange dauert die Fahrt von Cochem nach ${location.name}?`,
          answer: `Die Fahrt dauert normalerweise etwa ${location.driveMinutes} Minuten. Hinzu kommt die Anfahrtszeit unseres Wagens - bestellen Sie daher am besten rechtzeitig, besonders zu Stoßzeiten und in der Hauptsaison.`,
        },
      ]
    : [
        {
          question: `How much does a taxi from Cochem to ${location.name} cost?`,
          answer: `For the roughly ${location.distanceKm} km trip the price is around ${dayPrice} during the day and around ${nightPrice} at night (10 p.m. to 6 a.m.). This is a non-binding estimate - the final fare depends on the actual route driven and the taximeter.`,
        },
        {
          question: `How long does the drive from Cochem to ${location.name} take?`,
          answer: `The drive normally takes about ${location.driveMinutes} minutes, plus the time our car needs to reach you. Book in good time, especially during peak hours and the high season.`,
        },
      ];

  return [...generated, ...location.faq[lang]];
}
