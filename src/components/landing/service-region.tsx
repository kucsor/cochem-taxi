import { Badge } from "../ui/badge";

const regions = [
    "Cochem", "Treis-Karden", "Kaisersesch", "Ernst",
    "Klotten", "Bruttig-Fankel", "Ellenz-Poltersdorf", "Mesenich", "Beilstein"
]

type Dictionary = {
    title: string;
    andMore: string;
}

export function ServiceRegion({ dict }: { dict: Dictionary }) {
  return (
    <section className="w-full max-w-3xl mx-auto py-12 text-center" aria-labelledby="region-heading">
      <h2 id="region-heading" className="text-3xl font-bold font-headline">
        {dict.title}
      </h2>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {regions.map((region) => (
            <Badge key={region} variant="secondary" className="text-base px-4 py-1 transition-all duration-200 hover:bg-primary/20 hover:scale-105">
                {region}
            </Badge>
        ))}
         <Badge variant="outline" className="text-base px-4 py-1 transition-all duration-200 hover:bg-primary/20 hover:scale-105">
            {dict.andMore}
        </Badge>
      </div>
    </section>
  );
}
