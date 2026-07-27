"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Dictionary = {
  companyName: string;
  legalLink: string;
};

export function Header({ dict, lang }: { dict: Dictionary; lang: string }) {
  const isDE = lang === 'de';
  const isEN = lang === 'en';
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getLanguagePath = (targetLang: string) => {
    if (!pathname) return `/${targetLang}`;
    const segments = pathname.split('/');
    // segments[1] is the locale (e.g., 'de' or 'en')
    if (segments.length > 1) {
      segments[1] = targetLang;
      return segments.join('/');
    }
    return `/${targetLang}`;
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 md:px-6 md:pt-4 animate-in slide-in-from-top duration-500 ease-out fill-mode-forwards"
      >
        {/* The pill compacts and darkens once the page scrolls. The header is
            fixed and the layout spacer below is constant, so this never
            shifts page content. */}
        <nav
          aria-label="Hauptnavigation"
          className={cn(
            'max-w-6xl mx-auto glass-nav rounded-2xl px-4 md:px-8 transition-[padding,background-color,box-shadow] duration-300',
            scrolled ? 'py-2 md:py-2.5 glass-nav-scrolled' : 'py-3 md:py-4'
          )}
        >
          <div className="flex items-center justify-between">

            {/* Logo - just text in GOLD */}
            <Link
              href={`/${lang}`}
              className="font-bold text-lg md:text-xl text-primary tracking-tight hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              Cochem Taxi
            </Link>

            {/* Language Toggle Switch */}
            <div role="group" aria-label="Sprache / Language" className="flex items-center gap-1 p-1 rounded-xl bg-white/10 border border-white/10">
              {/* DE Button */}
              <Link
                href={getLanguagePath('de')}
                hrefLang="de"
                aria-label="Deutsch"
                aria-current={isDE ? 'true' : undefined}
                className={`relative px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px] ${
                  isDE
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                DE
              </Link>

              {/* EN Button */}
              <Link
                href={getLanguagePath('en')}
                hrefLang="en"
                aria-label="English"
                aria-current={isEN ? 'true' : undefined}
                className={`relative px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px] ${
                  isEN
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                EN
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer for fixed header - bigger for mobile */}
      <div className="h-20 md:h-28" />
    </>
  );
}
