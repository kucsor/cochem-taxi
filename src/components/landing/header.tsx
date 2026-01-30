"use client";

import { motion } from "framer-motion";
import { Phone, Menu, X, MapPin } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/tracking";
import { LanguageSwitcher } from "@/components/language-switcher";

type Dictionary = {
  companyName: string;
  legalLink: string;
};

export function Header({ dict, lang }: { dict: Dictionary; lang: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#rechner", label: "Preis" },
    { href: "#services", label: "Service" },
    { href: "#warum-wir", label: "Warum" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-3 pt-2 md:px-4 md:pt-4"
      >
        <nav className="max-w-6xl mx-auto glass rounded-2xl px-3 py-2 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo - smaller on mobile */}
            <motion.a 
              href="/"
              className="flex items-center gap-1.5 md:gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center glow-gold-subtle group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <span className="font-bold text-base md:text-lg text-white hidden sm:block">
                {dict.companyName}
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="text-sm text-muted-foreground hover:text-white transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:block">
                <LanguageSwitcher currentLang={lang} />
              </div>
              
              {/* Mobile call button - always visible */}
              <motion.a
                href="tel:026718080"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => trackEvent('click_call_now')}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors glow-gold-subtle"
              >
                <Phone className="w-4 h-4" />
                <span className="font-semibold text-sm">02671 8080</span>
              </motion.a>

              {/* Desktop call button */}
              <motion.a
                href="tel:026718080"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => trackEvent('click_call_now')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors glow-gold-subtle"
              >
                <Phone className="w-4 h-4" />
                <span className="font-semibold text-sm">02671 8080</span>
              </motion.a>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={false}
            animate={{ 
              height: isMenuOpen ? "auto" : 0,
              opacity: isMenuOpen ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="pt-3 pb-2 space-y-1 border-t border-white/10 mt-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-white/10 mt-2">
                <LanguageSwitcher currentLang={lang} />
              </div>
            </div>
          </motion.div>
        </nav>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-24" />
    </>
  );
}