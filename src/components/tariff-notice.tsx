"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { pricesPath } from "@/lib/site";
import type { Locale } from "@/i18n-config";

export type TariffNoticeDictionary = {
  text: string;
  linkLabel: string;
  dismiss: string;
};

export const TARIFF_NOTICE_STORAGE_KEY = "cochem-taxi-tariff-notice-2026-08";

/** The notice retires itself, so nobody has to remember to take it down. */
export const TARIFF_NOTICE_SHOW_UNTIL = "2026-10-31T23:59:59Z";

/**
 * Rendered server-side so it is present in the initial HTML - that keeps the
 * layout from shifting when it appears. Visitors who dismissed it (or who
 * arrive after the expiry date) get it hidden before first paint by the inline
 * script in the layout, so there is no shift for them either.
 */
export function TariffNotice({ dict, lang }: { dict: TariffNoticeDictionary; lang: Locale }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (new Date() > new Date(TARIFF_NOTICE_SHOW_UNTIL)) {
      setDismissed(true);
      return;
    }
    try {
      if (window.localStorage.getItem(TARIFF_NOTICE_STORAGE_KEY) === "dismissed") {
        setDismissed(true);
      }
    } catch {
      // Storage blocked - the notice simply stays visible.
    }
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(TARIFF_NOTICE_STORAGE_KEY, "dismissed");
    } catch {
      // Not persisted, but dismissed for this page view.
    }
    document.documentElement.classList.add("tariff-notice-hidden");
    setDismissed(true);
  };

  return (
    // Normal flow, right under the header spacer - no overlay.
    <div data-tariff-notice className="w-full px-4">
      <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl glass border border-primary/20 px-4 py-3">
        <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="flex-grow text-xs leading-relaxed text-muted-foreground md:text-sm">
          {dict.text}{" "}
          <Link
            href={pricesPath(lang)}
            className="font-medium text-primary underline underline-offset-2"
          >
            {dict.linkLabel}
          </Link>
        </p>
        <button
          onClick={dismiss}
          aria-label={dict.dismiss}
          className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
