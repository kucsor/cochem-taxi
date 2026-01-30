"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Dictionary = {
  companyName: string;
  legalLink: string;
};

export function Header({ dict, lang }: { dict: Dictionary; lang: string }) {
  const otherLang = lang === 'de' ? 'en' : 'de';
  const currentLangLabel = lang === 'de' ? 'DE' : 'EN';

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 md:px-6 md:pt-4"
      >
        <nav className="max-w-6xl mx-auto glass rounded-2xl px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo - just text in GOLD */}
            <motion.a 
              href={`/${lang}`}
              className="font-bold text-lg md:text-xl text-primary tracking-tight"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cochem Taxi
            </motion.a>

            {/* Language Toggle Button - Direct switch */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/${otherLang}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <span>{currentLangLabel}</span>
                <motion.span
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs opacity-60"
                >
                  ↔
                </motion.span>
                <span className="opacity-80">{otherLang.toUpperCase()}</span>
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      {/* Spacer for fixed header - bigger for mobile */}
      <div className="h-20 md:h-28" />
    </>
  );
}