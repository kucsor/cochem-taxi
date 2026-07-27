import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import type { FaqItem } from "@/lib/locations";
import { faqSchema } from "@/lib/schema";

/**
 * FAQ block used on the location and transfer pages. Emits FAQPage structured
 * data so the questions can appear directly in Google results.
 */
export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className="w-full max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(items)) }}
      />
      <Reveal duration={0.6}>
        <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold font-headline text-center mb-6">
          {title}
        </h2>
        <Accordion type="single" collapsible className="glass-card rounded-2xl border border-white/10 px-4 md:px-6">
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`} className="border-white/10">
              <AccordionTrigger className="text-left text-base font-medium transition-colors duration-200 hover:text-primary data-[state=open]:text-primary">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
