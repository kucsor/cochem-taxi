"use client";

import { motion } from "framer-motion";
import { Phone, Calculator, Menu, Home, ChevronUp } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function BottomNav() {
  const pathname = usePathname();

  // Extract lang from pathname or default to 'de'
  const lang = pathname?.split('/')[1] || 'de';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent('click_scroll_top');
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="mx-2 mb-2 glass rounded-2xl px-2 py-2 flex items-center justify-around shadow-2xl">
          {/* Home */}
          <Link
            href={`/${lang}`}
            onClick={() => trackEvent('click_home_nav')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors min-w-[60px]"
          >
            <Home className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Home</span>
          </Link>

          {/* Calculator */}
          <Link
            href={`/${lang}#rechner`}
            onClick={() => trackEvent('click_calculator')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors min-w-[60px]"
          >
            <Calculator className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Preis</span>
          </Link>

          {/* Call Button - Prominent */}
          <motion.a
            href="tel:026718080"
            whileTap={{ scale: 0.95 }}
            onClick={() => trackEvent('click_call_now')}
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 glow-gold">
              <Phone className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-[10px] text-primary mt-1 font-medium">Anrufen</span>
          </motion.a>

          {/* Services */}
          <Link
            href={`/${lang}#services`}
            onClick={() => trackEvent('click_services_nav')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors min-w-[60px]"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Service</span>
          </Link>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors min-w-[60px]"
          >
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Top</span>
          </button>
        </div>
      </motion.nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="h-20 md:hidden" />
    </>
  );
}
