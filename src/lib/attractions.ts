import type { LocalizedText } from '@/lib/locations';

/**
 * Attractions in and around Cochem.
 *
 * Every factual claim here (dates, dimensions, historical events) is taken
 * from the source listed on each entry - nothing is written from memory.
 * Deliberately omitted: prices and opening hours. Those change and a wrong
 * number on a taxi site costs a visitor their afternoon; the UI links people
 * to the official pages instead.
 *
 * `secretTip` is advice, not fact: how locals actually do it.
 */

export type AttractionCategory = 'castle' | 'history' | 'view' | 'nature' | 'culture' | 'event';

export interface Attraction {
  slug: string;
  name: LocalizedText;
  category: AttractionCategory;
  /** Approximate distance from Cochem town centre in km; 0 = in town. */
  distanceKm: number;
  /** Verified description - facts only. */
  description: LocalizedText;
  /** Insider advice. */
  secretTip: LocalizedText;
  /** Why a taxi is worth it here (omitted when it plainly is not). */
  taxiNote?: LocalizedText;
  /** Provenance for the factual claims above. */
  source: string;
}

export const attractions: Attraction[] = [
  {
    slug: 'reichsburg-cochem',
    name: { de: 'Reichsburg Cochem', en: 'Reichsburg Cochem (Cochem Castle)' },
    category: 'castle',
    distanceKm: 0,
    description: {
      de: 'Die Burg wurde 1051 erstmals urkundlich erwähnt, als Richeza - die älteste Tochter des Pfalzgrafen Ezzo und frühere Königin von Polen - sie ihrem Neffen Pfalzgraf Heinrich I. übertrug. 1151 machte König Konrad III. sie zur Reichsburg. Am 8. November 1688 wurde sie im Pfälzischen Erbfolgekrieg von französischen Truppen unter Maréchal de Boufflers eingenommen und am 19. Mai 1689 gesprengt. Fast zwei Jahrhunderte blieb sie Ruine, bis der Berliner Kaufmann Louis Fréderic Jacques Ravené sie zwischen 1868 und 1877 im neugotischen Stil des Historismus wieder aufbauen ließ.',
      en: 'The castle was first documented in 1051, when Richeza - eldest daughter of Count Palatine Ezzo and a former Queen of Poland - transferred it to her nephew, Count Palatine Henry I. In 1151 King Konrad III made it an imperial castle. On 8 November 1688 it was taken by French troops under Maréchal de Boufflers during the War of the Palatine Succession, and on 19 May 1689 it was blown up. It lay in ruins for almost two centuries until the Berlin merchant Louis Fréderic Jacques Ravené had it rebuilt between 1868 and 1877 in the neo-Gothic style of Historicism.',
    },
    secretTip: {
      de: 'Das Burginnere ist nur mit Führung zugänglich - wer spontan kommt, wartet in der Hochsaison. Der Fußweg hinauf ist kurz, aber steil; mit Kinderwagen oder in Sandalen wird er zur Qual. Der beste Moment ist der frühe Morgen: die Reisebusse kommen erst später, und das Licht auf der Talseite ist dann am schönsten.',
      en: 'The interior can only be seen on a guided tour - turn up unannounced in high season and you will wait. The walk up is short but steep; with a pushchair or in sandals it is punishing. The best moment is early morning: the coaches arrive later, and the light on the valley side is at its best.',
    },
    taxiNote: {
      de: 'Wir fahren bis zum Burgparkplatz - vor allem für den Rückweg bergab ein Segen.',
      en: 'We drive up to the castle car park - a relief on the way back down in particular.',
    },
    source: 'https://de.wikipedia.org/wiki/Reichsburg_Cochem',
  },
  {
    slug: 'bundesbankbunker',
    name: { de: 'Bundesbankbunker Cochem', en: 'Bundesbank Bunker Cochem' },
    category: 'history',
    distanceKm: 1,
    description: {
      de: 'Die Deutsche Bundesbank ließ zwischen 1962 und 1964 im Stadtteil Cond eine rund 1.500 Quadratmeter große Bunkeranlage etwa 30 Meter unter der Erde bauen. Von 1964 bis 1988 lagerten hier bis zu 15 Milliarden Mark einer geheimen Ersatzwährung - der sogenannten BBk II, gedruckt in Scheinen zu 10, 20, 50 und 100 DM. Sie sollte die Bundesrepublik im Kalten Krieg vor einer gezielt herbeigeführten Hyperinflation schützen. Die Anlage war streng geheim. Seit März 2016 ist sie als Dokumentationsstätte für Führungen zugänglich.',
      en: 'Between 1962 and 1964 the Deutsche Bundesbank built a bunker complex of some 1,500 square metres about 30 metres underground in the Cond district. From 1964 to 1988 it held up to 15 billion marks of a secret emergency currency - the BBk II, printed in 10, 20, 50 and 100 DM notes - meant to protect West Germany against a deliberately engineered hyperinflation during the Cold War. The facility was strictly secret. Since March 2016 it has been open for guided tours as a documentation centre.',
    },
    secretTip: {
      de: 'Das ist der bestgehütete Geheimtipp von Cochem - die meisten Tagesgäste erfahren nie davon. Von der Straße aus sieht man nichts: Der Zugang liegt unter einem unscheinbaren Wohn- und Schulungsgebäude, genau so war es gedacht. Der Besuch ist nur mit Führung möglich, und es geht 30 Meter unter die Erde - eine Jacke ist auch im Hochsommer keine schlechte Idee.',
      en: 'This is Cochem\'s best-kept secret - most day visitors never hear about it. From the street there is nothing to see: the entrance sits beneath an unremarkable residential and training building, exactly as intended. Entry is by guided tour only, and it goes 30 metres underground - a jacket is not a bad idea even in midsummer.',
    },
    source: 'https://de.wikipedia.org/wiki/Bundesbankbunker_Cochem',
  },
  {
    slug: 'sesselbahn-pinnerkreuz',
    name: { de: 'Sesselbahn zum Pinnerkreuz', en: 'Chairlift to the Pinnerkreuz' },
    category: 'view',
    distanceKm: 1,
    description: {
      de: 'Die Cochemer Sesselbahn bringt Besucher in offenen Zweier-Gondeln den Hang hinauf zum Pinnerkreuz, einem der bekanntesten Aussichtspunkte über der Stadt. Von der Bergstation führt ein felsiger Pfad mit einigen Stufen zum Aussichtspunkt; er ist durchgehend mit Handläufen gesichert, etwas Trittsicherheit braucht man trotzdem.',
      en: 'The Cochem chairlift carries visitors up the slope in open two-seater cabins to the Pinnerkreuz, one of the best-known viewpoints above the town. From the top station a rocky path with a few steps leads to the viewpoint; handrails run the whole way, but you still need to be reasonably sure-footed.',
    },
    secretTip: {
      de: 'Hinauf fahren, zu Fuß zurück. Der Abstieg durch die Weinberge dauert etwa eine halbe Stunde, kostet nichts und bietet die besseren Blicke auf die Burg - fast alle fahren beide Wege und verpassen genau das.',
      en: 'Ride up, walk down. The descent through the vineyards takes about half an hour, costs nothing, and gives you the better views of the castle - almost everyone rides both ways and misses exactly that.',
    },
    source: 'https://cochemer-sesselbahn.de/',
  },
  {
    slug: 'historische-senfmuehle',
    name: { de: 'Historische Senfmühle', en: 'Historic Mustard Mill' },
    category: 'culture',
    distanceKm: 0,
    description: {
      de: 'In der Historischen Senfmühle in Cochem wird seit über 200 Jahren Senf hergestellt - noch immer nach altem Verfahren. Die Mühle gehört zu den Sehenswürdigkeiten, die man im Ort zu Fuß erreicht.',
      en: 'Mustard has been produced at the Historic Mustard Mill in Cochem for over 200 years, still using the traditional process. The mill is one of the sights you can reach on foot within the town.',
    },
    secretTip: {
      de: 'Der perfekte Programmpunkt für einen Regentag - alles findet drinnen statt. Und im Gegensatz zu den üblichen Souvenirs kommt hier etwas mit nach Hause, das man tatsächlich benutzt.',
      en: 'The perfect rainy-day stop - it all happens indoors. And unlike the usual souvenirs, you go home with something you will actually use.',
    },
    source: 'https://www.urlaub-in-rheinland-pfalz.de/urlaub/6702/Historische_Senfmuehle_Cochem/index.htm',
  },
  {
    slug: 'burg-eltz',
    name: { de: 'Burg Eltz', en: 'Eltz Castle' },
    category: 'castle',
    distanceKm: 30,
    description: {
      de: 'Die Burg Eltz liegt versteckt im Wald des Eltzbachtals und gilt als eine der schönsten Burgen Deutschlands. Mit dem Auto führt der Weg über Münstermaifeld zum Parkplatz an der Antoniuskapelle; von dort sind es noch rund 800 Meter zu Fuß, alternativ fährt in der Saison ein Pendelbus. Wer wandern möchte, startet in Moselkern: Ein etwa 4,5 Kilometer langer Weg führt am Elzbach entlang zur Burg.',
      en: 'Eltz Castle lies hidden in the woods of the Eltz valley and counts among the most beautiful castles in Germany. By car the route runs via Münstermaifeld to the car park at the Antoniuskapelle; from there it is roughly another 800 metres on foot, or a shuttle bus runs in season. If you would rather walk, start at Moselkern: a trail of about 4.5 kilometres follows the Elzbach up to the castle.',
    },
    secretTip: {
      de: 'Das berühmte Postkartenmotiv sieht man nicht vom Parkplatz aus, sondern auf dem Wanderweg von Moselkern: Die Burg taucht plötzlich hinter einer Waldbiegung auf. Der ideale Plan: mit dem Zug oder Taxi nach Moselkern, hochwandern, und sich oben am Parkplatz wieder abholen lassen - so läuft man den schönen Weg, aber nicht zweimal.',
      en: 'The famous postcard view is not from the car park but from the Moselkern trail: the castle appears suddenly around a bend in the woods. The ideal plan is to take a train or taxi to Moselkern, walk up, and be collected at the car park at the top - you get the beautiful approach without walking it twice.',
    },
    taxiNote: {
      de: 'Mit öffentlichen Verkehrsmitteln ist die Burg ab Cochem umständlich zu erreichen - wir fahren direkt bis zum Besucherparkplatz.',
      en: 'Getting there from Cochem by public transport is awkward - we drive you straight to the visitor car park.',
    },
    source: 'https://www.moselkern.de/wandern-zur-burg-eltz',
  },
  {
    slug: 'calmont',
    name: { de: 'Calmont bei Bremm', en: 'The Calmont near Bremm' },
    category: 'nature',
    distanceKm: 18,
    description: {
      de: 'Der Calmont zwischen Eller und Bremm gilt als steilster Weinberg Europas: rund 380 Meter hoch, mit einer Neigung von bis zu etwa 65 Grad. Durch den Riesling-Steilhang führt ein rund fünf Kilometer langer Erlebnisweg mit Klettersteig-Abschnitten, die mit Stahlseilen, Klammern und Leitern gesichert sind. Trittsicherheit, Schwindelfreiheit und festes Schuhwerk sind Voraussetzung.',
      en: 'The Calmont between Eller and Bremm is considered the steepest vineyard in Europe: around 380 metres high, with gradients reaching roughly 65 degrees. A trail of about five kilometres runs through the Riesling slope, including via ferrata sections secured with steel cables, clamps and ladders. Sure-footedness, a head for heights and sturdy footwear are essential.',
    },
    secretTip: {
      de: 'Nicht als Rundweg planen. Wer den Klettersteig in eine Richtung geht und sich am Ausstieg abholen lässt, spart Kraft und die Rückweg-Diskussion. Wichtig: Der Handyempfang im Steig ist unzuverlässig - die Abholung vorher fest vereinbaren, nicht unterwegs anrufen wollen.',
      en: 'Do not plan it as a loop. Walk the via ferrata one way and arrange to be picked up at the exit - it saves your legs and the argument about the way back. Important: mobile reception on the route is unreliable, so agree the pickup in advance rather than counting on a call from up there.',
    },
    taxiNote: {
      de: 'Hinfahrt zum Einstieg, Abholung am Ausstieg - genau dafür werden wir hier am häufigsten gebucht.',
      en: 'Drop-off at the start, pickup at the exit - that is what we are booked for here most often.',
    },
    source: 'https://www.bergwelten.com/a/calmont-klettersteig',
  },
  {
    slug: 'beilstein',
    name: { de: 'Beilstein', en: 'Beilstein' },
    category: 'culture',
    distanceKm: 11,
    description: {
      de: 'Beilstein wird das "Dornröschen der Mosel" genannt: ein mittelalterlicher Ortskern mit engen Gassen, Fachwerk und der Burgruine Metternich hoch über dem Ort. Der Ort ist klein - man geht ihn in einer guten Stunde ab - und in der Saison entsprechend voll.',
      en: 'Beilstein is called the "Sleeping Beauty of the Moselle": a medieval centre of narrow lanes and half-timbered houses, with the ruins of Metternich Castle high above. The village is small - an hour covers it - and correspondingly busy in season.',
    },
    secretTip: {
      de: 'Der Ausweichplan, wenn Cochem überfüllt ist. Die Parkplätze am Ortsrand sind in der Saison allerdings schnell belegt, weshalb sich die Anfahrt ohne eigenes Auto hier besonders lohnt. Am schönsten ist es am späten Nachmittag, wenn die Tagesgäste weg sind.',
      en: 'The fallback when Cochem is heaving. The car parks on the edge of the village fill fast in season, which is exactly why arriving without your own car pays off here. It is at its best in the late afternoon, once the day trippers have gone.',
    },
    source: 'https://en.visitmosel.de/',
  },
  {
    slug: 'moselpromenade',
    name: { de: 'Moselpromenade & Fotoblick von Cond', en: 'Moselle promenade & the view from Cond' },
    category: 'view',
    distanceKm: 0,
    description: {
      de: 'Die Moselpromenade zieht sich am Ufer entlang durch Cochem, mit Blick auf die Weinberge und die Reichsburg. Auf der gegenüberliegenden Uferseite liegt der Stadtteil Cond, von dem aus sich Burg und Altstadt in einem Bild einfangen lassen.',
      en: 'The Moselle promenade runs along the bank through Cochem, looking out on the vineyards and the Reichsburg. On the opposite bank lies the Cond district, from where castle and old town line up in a single frame.',
    },
    secretTip: {
      de: 'Das klassische Cochem-Foto entsteht nicht in der Altstadt, sondern drüben in Cond - von dort hat man Burg, Brücke und Altstadt zusammen im Bild. Am besten am frühen Abend, wenn die Sonne von Westen auf die Burg fällt.',
      en: 'The classic Cochem photograph is not taken in the old town but over in Cond - from there castle, bridge and old town sit in one shot. Best in the early evening, when the sun hits the castle from the west.',
    },
    source: 'https://www.cochem.de/',
  },
  {
    slug: 'heimat-und-weinfest',
    name: { de: 'Heimat- und Weinfest', en: 'Heimat- und Weinfest (wine festival)' },
    category: 'event',
    distanceKm: 0,
    description: {
      de: 'Das Heimat- und Weinfest ist das größte Fest in Cochem und findet 2026 vom 27. bis 31. August statt. Auf dem Marktplatz und entlang der Moselpromenade schenken die Moselwinzer ihre Weine und Sekte aus. Höhepunkt ist der Festumzug am Sonntag im frühen Nachmittag durch die Altstadt, gefolgt von einem Feuerwerk am Abend.',
      en: 'The Heimat- und Weinfest is the biggest festival in Cochem and runs from 27 to 31 August in 2026. Moselle winemakers pour their wines and sparkling wines on the market square and along the promenade. The highlight is the parade through the old town on Sunday in the early afternoon, followed by fireworks in the evening.',
    },
    secretTip: {
      de: 'In diesen Tagen ist die Altstadt abends dicht - und ein Taxi bekommt man dann nicht spontan. Wer nach dem Feuerwerk zurück in die Nachbarorte will, sollte die Rückfahrt am Vortag bestellen. Wer nur den Umzug sehen will: Sonntagfrüh anreisen, da ist noch alles ruhig.',
      en: 'On those days the old town is packed by evening - and a taxi is not something you get on the spot. If you are heading back to one of the neighbouring villages after the fireworks, book the return the day before. If you only want the parade: arrive early on Sunday, while it is still calm.',
    },
    taxiNote: {
      de: 'Festtage sind unsere vollsten Tage - bitte rechtzeitig vorbestellen.',
      en: 'Festival days are our busiest - please book well ahead.',
    },
    source: 'https://cochem.de/kalender/heimat-und-weinfest-3/',
  },
];

export function getAttraction(slug: string): Attraction | undefined {
  return attractions.find((item) => item.slug === slug);
}
