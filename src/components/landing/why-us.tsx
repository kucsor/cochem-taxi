"use client";

import { Reveal } from "@/components/ui/reveal";
import { Check, Users, Car, Package, HeartPulse, Award, Zap } from "lucide-react";

type Dictionary = {
  title: string;
  badge: string;
  features: string[];
  stats: {
    experience: string;
    availability: string;
    reliability: string;
  };
  cta: string;
};

export function WhyUs({ dict }: { dict: Dictionary }) {
  const features = [
    { icon: Users, text: dict.features[0], color: "from-blue-500/20 to-blue-600/20", iconColor: "text-blue-400" },
    { icon: Car, text: dict.features[1], color: "from-amber-500/20 to-orange-600/20", iconColor: "text-amber-400" },
    { icon: Package, text: dict.features[2], color: "from-emerald-500/20 to-teal-600/20", iconColor: "text-emerald-400" },
    { icon: HeartPulse, text: dict.features[3], color: "from-rose-500/20 to-pink-600/20", iconColor: "text-rose-400" },
  ];

  const stats = [
    { value: "10+", label: dict.stats?.experience || "Years experience" },
    { value: "24/7", label: dict.stats?.availability || "Availability" },
    { value: "100%", label: dict.stats?.reliability || "Reliable" },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4">
      <Reveal duration={0.6}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{dict.badge || "Why us?"}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-gold">{dict.title}</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal
                key={index}
                delay={index * 0.1}
                duration={0.5}
                className={`group relative overflow-hidden rounded-2xl glass-card glass-card-hover p-6 transition-transform duration-300 hover:scale-[1.02]`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10 flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-white font-medium text-lg">{feature.text}</span>
                    </div>
                    
                    <div className="h-1 w-12 bg-gradient-to-r from-primary/50 to-transparent rounded-full group-hover:w-24 transition-all duration-500" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Stats Row - Smaller text */}
        <div
          className="grid grid-cols-3 gap-4"
        >
          {stats.map((stat, index) => (
            <Reveal
              key={index}
              delay={0.4 + index * 0.1}
              duration={0.5}
              className="text-center p-3 md:p-4 rounded-xl glass-card transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className="text-xl md:text-2xl font-bold text-gradient-gold mb-1"
              >
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground leading-tight">{stat.label}</div>
            </Reveal>
          ))}
        </div>

        {/* Bottom CTA */}
        <Reveal
          delay={0.7}
          duration={0.5}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-primary/20">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-white font-medium">{dict.cta || "Call now and let's go!"}</span>
          </div>
        </Reveal>
      </Reveal>
    </section>
  );
}
