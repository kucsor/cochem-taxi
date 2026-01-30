"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";
import { motion } from "framer-motion";
import { Phone, ArrowDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Dictionary = {
    title: string;
    subtitle: string;
    callButton: string;
    phoneNumber: string;
}

export function Hero({ dict }: { dict: Dictionary }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center px-4 pt-4 pb-8 overflow-hidden">
      {/* Animated background elements - simplified for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[80px] md:blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-80 md:h-80 bg-orange-500/10 rounded-full blur-[60px] md:blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto pt-8 md:pt-12">
        {/* Badge - moved higher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass mb-4 md:mb-6"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
          <span className="text-xs md:text-sm text-muted-foreground">24/7 Verfügbar in Cochem</span>
        </motion.div>

        {/* Main title with gradient - smaller on mobile */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-3 md:mb-4"
        >
          <span className="text-white">Brauchen Sie ein</span>
          <br />
          <span className="text-gradient-gold animate-gradient-text">
            Taxi in Cochem?
          </span>
        </motion.h1>

        {/* Subtitle - smaller on mobile */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-2 md:mb-3 leading-relaxed px-2"
        >
          {dict.subtitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xs md:text-sm text-primary/80 mb-8 md:mb-12"
        >
          Schnell • Zuverlässig • Preiswert
        </motion.p>

        {/* CTA Buttons - stacked on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col gap-3 md:flex-row md:gap-4 justify-center items-center px-4"
        >
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 glow-gold-subtle transition-all duration-300 h-14 md:h-16 px-8 md:px-10 rounded-full text-base md:text-lg font-semibold w-full md:w-auto"
          >
            <a 
              href={`tel:${dict.phoneNumber.replace(/\s/g, '')}`} 
              onClick={() => trackEvent('click_call_now')}
              className="flex items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Phone className="w-5 h-5" />
              </motion.div>
              <span>{dict.callButton}</span>
              <span className="text-sm font-normal opacity-80 border-l border-primary-foreground/30 pl-3 hidden sm:inline">
                {dict.phoneNumber}
              </span>
            </a>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="group glass-card hover:bg-white/10 transition-all duration-300 h-14 md:h-16 px-6 md:px-8 rounded-full text-base md:text-lg border-white/20 w-full md:w-auto"
            onClick={() => {
              document.getElementById('rechner')?.scrollIntoView({ behavior: 'smooth' });
              trackEvent('click_calculator');
            }}
          >
            <span>Preis berechnen</span>
            <ArrowDown className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Trust indicators - smaller on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 md:mt-16 flex flex-wrap justify-center gap-4 md:gap-8 text-muted-foreground text-xs md:text-sm"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Jetzt verfügbar</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full" />
            <span>Ortskundige Fahrer</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full" />
            <span>Feste Preise</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator - smaller on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5 md:p-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}