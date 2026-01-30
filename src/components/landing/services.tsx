"use client";

import { motion } from "framer-motion";
import { Hotel, Castle, Plane, Shield, Clock, Star, ArrowUpRight } from "lucide-react";

type Dictionary = {
  title: string;
  description: string;
  items: {
    hotel: { title: string; description: string };
    castle: { title: string; description: string };
    airport: { title: string; description: string };
  };
};

export function Services({ dict }: { dict: Dictionary }) {
  const services = [
    {
      key: "hotel",
      icon: Hotel,
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      size: "col-span-1 row-span-1",
    },
    {
      key: "castle",
      icon: Castle,
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      size: "col-span-1 row-span-1",
    },
    {
      key: "airport",
      icon: Plane,
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      size: "col-span-1 row-span-1",
    },
  ] as const;

  const features = [
    { icon: Shield, text: "Versicherte Fahrten" },
    { icon: Clock, text: "Pünktliche Abholung" },
    { icon: Star, text: "5-Sterne Service" },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Unsere Leistungen</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Ihr </span>
            <span className="text-gradient-gold">Taxi-Service</span>
            <span className="text-white"> in Cochem</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict.description}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            const item = dict.items[service.key as keyof typeof dict.items];
            
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`group relative overflow-hidden rounded-2xl glass-card glass-card-hover p-6 cursor-pointer ${service.size}`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${service.iconColor}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Mehr erfahren</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </motion.div>
            );
          })}
        </div>

        {/* Features Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 px-5 py-3 rounded-full glass"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{feature.text}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}