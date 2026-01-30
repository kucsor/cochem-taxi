import { getDictionary } from '@/lib/dictionaries'
import { Locale } from '@/i18n-config'
import Link from 'next/link';
import { X } from 'lucide-react';

export default async function LegalPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang)
  const legalDict = dict.legalPage;
  return (
    <div className="w-full max-w-4xl text-left self-start relative">
      <Link href={`/${lang}`} className="absolute top-0 right-0 text-muted-foreground hover:text-primary transition-colors" aria-label="Close">
        <X className="h-8 w-8" />
      </Link>
      <h1 className="text-4xl font-bold font-headline mb-8 text-foreground">{legalDict.title}</h1>
      
      <div className="space-y-8 text-muted-foreground">
        <section className="space-y-4">
          <h2 className="text-3xl font-bold font-headline text-foreground">{legalDict.impressumTitle}</h2>
          
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{legalDict.angabenTitle}</h3>
            <p dangerouslySetInnerHTML={{ __html: legalDict.betreiber }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{legalDict.kontaktTitle}</h3>
            <p dangerouslySetInnerHTML={{ __html: legalDict.kontaktContent }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{legalDict.verantwortlichTitle}</h3>
            <p dangerouslySetInnerHTML={{ __html: legalDict.verantwortlichContent }} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold font-headline text-foreground">{legalDict.disclaimerTitle}</h2>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{legalDict.unabhaengigkeitTitle}</h3>
            <p dangerouslySetInnerHTML={{ __html: legalDict.unabhaengigkeitContent }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{legalDict.tarifrechnerTitle}</h3>
            <p dangerouslySetInnerHTML={{ __html: legalDict.tarifrechnerContent }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{legalDict.inhalteTitle}</h3>
            <p dangerouslySetInnerHTML={{ __html: legalDict.inhalteContent }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{legalDict.linksTitle}</h3>
            <p dangerouslySetInnerHTML={{ __html: legalDict.linksContent }} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold font-headline text-foreground">{legalDict.datenschutzTitle}</h2>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-2 text-foreground">{legalDict.analyticsTitle}</h3>
            <p dangerouslySetInnerHTML={{ __html: legalDict.analyticsContent }} />
          </div>
        </section>
      </div>
    </div>
  )
}
