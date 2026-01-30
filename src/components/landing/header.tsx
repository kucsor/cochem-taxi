"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Dictionary = {
  companyName: string;
  legalLink: string;
};

export function Header({ dict, lang }: { dict: Dictionary; lang: string }) {
  const isDE = lang === 'de';
  const isEN = lang === 'en';

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

            {/* Language Toggle Switch */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 border border-white/10">
              {/* DE Button */}
              <Link href="/de">
                <motion.button
                  whileHover={{ scale: isDE ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isDE 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  DE
                </motion.button>
              </Link>

              {/* EN Button */}
              <Link href="/en">
                <motion.button
                  whileHover={{ scale: isEN ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isEN 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  EN
                </motion.button>
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Spacer for fixed header - bigger for mobile */}
      <div className="h-20 md:h-28" />
    </>
  );
}