import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n-config';
import { i18n } from '@/i18n-config';
import { airports } from '@/lib/airports';
import { getDictionary } from '@/lib/dictionaries';
import { absoluteUrl, alternatesForLocale } from '@/lib/site';
import { breadcrumbSchema, taxiRouteSchema } from '@/lib/schema';
import { FareCalculator } from '@/components/landing/fare-calculator';

type Props = { params: Promise<{ lang: Locale; airport: string }> };
export function generateStaticParams() {
  return i18n.locales.flatMap(lang => airports.map(airport => ({ lang, airport: airport.slug })));
}
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {lang, airport} = await params;
  const item = airports.find(a => a.slug === airport);
  if (!item) return {};
  return { title: `Taxi Cochem ↔ ${item.name} Airport (${item.code})`, description: item[lang], alternates: alternatesForLocale(lang, l => `/${l}/flughafen/${item.slug}`) };
}
export default async function AirportPage({params}: Props) {
  const {lang, airport} = await params;
  const item = airports.find(a => a.slug === airport);
  if (!item) notFound();
  const dict = await getDictionary(lang);
  const de = lang === 'de';
  const title = `Taxi Cochem ↔ ${item.name} (${item.code})`;
  const url = absoluteUrl(`/${lang}/flughafen/${item.slug}`);
  const schemas = [taxiRouteSchema({name:title, description:item[lang], url, destination:item.name, telephone:'+4926718080'}), breadcrumbSchema([{name:'Cochem Taxi',url:absoluteUrl(`/${lang}`)},{name:title,url}])];
  return <div className="w-full max-w-5xl mx-auto space-y-10 py-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schemas)}} />
    <section className="text-center space-y-5">
      <h1 className="text-3xl md:text-5xl font-bold text-gradient-gold">{title}</h1>
      <p className="text-muted-foreground max-w-3xl mx-auto">{item[lang]}</p>
      <a className="inline-flex rounded-full bg-primary text-primary-foreground px-8 py-4 font-bold" href="tel:+4926718080">{de?'Taxi telefonisch anfragen':'Call to request a taxi'} · 02671 8080</a>
    </section>
    <FareCalculator dict={dict.fareCalculator} lang={lang} initialStartAddress="Cochem" initialDestinationAddress={item.address} />
    <section className="glass-card p-6 rounded-2xl space-y-4">
      <h2 className="text-2xl font-bold">{de?'Abfahrt und Fahrzeit planen':'Planning your departure and journey'}</h2>
      <p>{de?'Der Rechner ermittelt die Route für die eingegebenen Adressen. Fahrzeit und Preis sind unverbindliche Schätzungen. Planen Sie zusätzlich einen Puffer für Verkehr, Check-in und Sicherheitskontrolle ein. Richten Sie sich nach den Angaben Ihrer Fluggesellschaft.':'The calculator finds a route for the addresses you enter. Journey time and price are non-binding estimates. Allow extra time for traffic, check-in and security, following your airline’s advice.'}</p>
      <h2 className="text-2xl font-bold">{de?'Rückfahrt nach Cochem':'Return journey to Cochem'}</h2>
      <p>{de?'Für die Fahrt vom Flughafen nach Cochem können Sie Start und Ziel im Rechner tauschen. Vereinbaren Sie Abholzeit, Terminal und Treffpunkt telefonisch. Eine Berechnung bestätigt keine Fahrt.':'For an airport-to-Cochem trip, swap the start and destination in the calculator. Agree the pickup time, terminal and meeting point by phone. A price calculation does not confirm a ride.'}</p>
      <h2 className="text-2xl font-bold">{de?'Familien, Gruppen und Gepäck':'Families, groups and luggage'}</h2>
      <p>{de?'Nennen Sie beim Anruf die Personenzahl, Koffer und benötigte Kindersitze. Lassen Sie Verfügbarkeit, Fahrzeuggröße und Preis vor der Fahrt bestätigen. Für Fernfahrten kann eine telefonische Preisvereinbarung erforderlich sein.':'When calling, mention passenger numbers, suitcases and any child seats needed. Confirm availability, vehicle size and price before travelling. Long-distance transfers may require an agreed price by phone.'}</p>
    </section>
    <nav aria-label={de?'Weitere Flughäfen':'Other airports'} className="flex flex-wrap gap-3">{airports.filter(a=>a.slug!==item.slug).map(a=><Link className="glass-card px-4 py-3 rounded-xl" key={a.slug} href={`/${lang}/flughafen/${a.slug}`}>{a.name} ({a.code})</Link>)}</nav>
  </div>;
}
