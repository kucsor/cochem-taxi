"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/components/consent-provider";
import { trackEvent } from "@/lib/tracking";

export type ConsentDictionary = {
  title: string;
  description: string;
  accept: string;
  decline: string;
  moreInfo: string;
};

export function ConsentBanner({ dict, lang }: { dict: ConsentDictionary; lang: string }) {
  const { consent, hydrated, accept, decline } = useConsent();

  if (!hydrated || consent !== "unset") return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={dict.title}
      // Sits above the mobile bottom navigation.
      className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-24 md:pb-3"
    >
      <div className="mx-auto max-w-3xl glass-card rounded-2xl border border-white/10 p-4 shadow-2xl md:p-5">
        <h2 className="text-sm font-semibold text-foreground md:text-base">{dict.title}</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
          {dict.description}{" "}
          <Link href={`/${lang}/legal`} className="text-primary underline underline-offset-2">
            {dict.moreInfo}
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="h-11 rounded-full border-white/20 text-sm"
            onClick={() => {
              decline();
              trackEvent("consent_reject");
            }}
          >
            {dict.decline}
          </Button>
          <Button
            className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              accept();
              trackEvent("consent_accept");
            }}
          >
            {dict.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
