import Link from "next/link";
import { Badge } from "../ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { locations } from "@/lib/locations";
import type { Locale } from "@/i18n-config";

type Dictionary = {
    title: string;
    andMore: string;
}

/**
 * Internal links to every village page. These used to be plain badges, which
 * left the location pages reachable only through the sitemap.
 */
export function ServiceRegion({ dict, lang = 'de' }: { dict: Dictionary; lang?: Locale }) {
  return (
    <section className="w-full max-w-3xl mx-auto py-12 text-center" aria-labelledby="region-heading">
      <Reveal duration={0.6}>
        <h2 id="region-heading" className="text-3xl font-bold font-headline">
          {dict.title}
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="mt-8 flex flex-wrap justify-center gap-2">
        <Badge variant="secondary" className="text-base px-4 py-1">
          Cochem
        </Badge>
        {locations.map((location) => (
          <Link
            key={location.slug}
            href={`/${lang}/${location.slug}`}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Badge
              variant="secondary"
              className="text-base px-4 py-1 transition-all duration-200 hover:bg-primary/20 hover:scale-105"
            >
              {location.name}
            </Badge>
          </Link>
        ))}
         <Badge variant="outline" className="text-base px-4 py-1">
            {dict.andMore}
        </Badge>
      </Reveal>
    </section>
  );
}
