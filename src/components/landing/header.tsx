"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type Dictionary = {
  companyName: string;
  legalLink: string;
};

export function Header({ dict, lang }: { dict: Dictionary; lang: string }) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const otherLang = lang === 'de' ? 'en' : 'de';
  const currentLangLabel = lang === 'de' ? 'DE' : 'EN';
  const otherLangLabel = otherLang === 'de' ? 'DE' : 'EN';

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

            {/* Language Selector - Clean Button */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <span>{currentLangLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown - Solid card style */}
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 py-2 bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl min-w-[140px] overflow-hidden z-50"
                >
                  <Link
                    href={`/${otherLang}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsLangOpen(false)}
                  >
                    <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold">
                      {otherLangLabel}
                    </span>
                    <span className="font-medium">{otherLang === 'de' ? 'Deutsch' : 'English'}</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Spacer for fixed header - bigger for mobile */}
      <div className="h-20 md:h-28" />
    </>
  );
}