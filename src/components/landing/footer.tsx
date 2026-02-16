"use client";

import { Mail, Clock, MapPin, ExternalLink, Heart } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { Reveal } from "@/components/ui/reveal";

type Dictionary = {
  companyName: string;
  openingHoursTitle: string;
  openingHoursContent: string;
  copyright: string;
  legalLink: string;
  tagline: string;
  quickContact: string;
  email: string;
  rights: string;
};

export function Footer({ dict, lang }: { dict: Dictionary; lang: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-20 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Reveal
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          duration={0.6}
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
              {dict.tagline || "Your reliable partner for trips in, around and from Cochem. Whatever your destination, we are here for you."}
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
            <h3 className="font-semibold text-white">{dict.quickContact || "Quick Contact"}</h3>
            <a
              href="mailto:contact@cochem-taxi.de"
              className="flex items-center gap-3 p-4 rounded-xl glass-card hover:bg-primary/10 transition-colors group hover:scale-105 active:scale-95 duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{dict.email || "E-Mail"}</div>
                <div className="text-sm font-semibold text-white">contact@cochem-taxi.de</div>
              </div>
            </a>
          </div>
        </Reveal>

        {/* Bottom Bar */}
        <Reveal
          className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"
          duration={0.6}
          delay={0.2}
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} {dict.companyName}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">{dict.rights || "All rights reserved"}</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={`/${lang}/legal`}
              onClick={() => trackEvent('view_legal')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition-colors p-3 min-h-[44px]"
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
        </Reveal>
      </div>
    </footer>
  );
}
