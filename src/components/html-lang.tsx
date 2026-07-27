"use client";

import { useEffect } from "react";

/**
 * The root layout hardcodes <html lang="de"> and sits above the [lang]
 * segment, so it cannot know the active locale. This corrects the attribute
 * after hydration; the SSR HTML still says "de" on /en - fixing that requires
 * moving html/body into the [lang] layout (routing restructure, deferred).
 */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
