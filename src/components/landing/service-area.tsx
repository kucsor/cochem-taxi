import { sanitizeHtml } from '@/lib/sanitize';

type ServiceAreaProps = {
  dict: {
    title: string;
    content: string;
  };
};

export function ServiceArea({ dict }: ServiceAreaProps) {
  const sanitizedContent = sanitizeHtml(dict.content);

  return (
    <section className="w-full py-8 md:py-12 bg-background flex flex-col items-center">
      <div className="container px-4 md:px-6 max-w-4xl text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground font-headline">
          {dict.title}
        </h2>
        <div
          className="text-muted-foreground text-lg leading-relaxed space-y-4 [&_strong]:text-foreground [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </section>
  );
}
