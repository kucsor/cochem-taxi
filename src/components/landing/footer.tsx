"use client";

import { motion } from "framer-motion";
import { Phone, Clock, MapPin, ExternalLink, Heart } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

type Dictionary = {
  companyName: string;
  openingHoursTitle: string;
  openingHoursContent: string;
  copyright: string;
  legalLink: string;
};

export function Footer({ dict, lang }: { dict: Dictionary; lang: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-20 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center glow-gold-subtle">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg text-white">{dict.companyName}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ihr zuverlässiger Partner für Fahrten in, um und ab Cochem. 
              Egal welches Ziel, wir sind für Sie da.
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-white">{dict.openingHoursTitle}</h3>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <p className="text-muted-foreground text-sm whitespace-pre-line">
                {dict.openingHoursContent}
              </p>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Schneller Kontakt</h3>
            <motion.a
              href="tel:026718080"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => trackEvent('click_call_now')}
              className="flex items-center gap-3 p-4 rounded-xl glass-card hover:bg-primary/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Telefon</div>
                <div className="text-lg font-semibold text-white">02671 8080</div>
              </div>
            </motion.a>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} {dict.companyName}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Alle Rechte vorbehalten</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={`/${lang}/legal`}
              onClick={() => trackEvent('view_legal')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {dict.legalLink}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>in Cochem</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}