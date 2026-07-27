"use client";

import { Phone, Calculator, Menu, Home, ChevronUp } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { scrollBehavior } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type Section = "home" | "rechner" | "services";

export function BottomNav() {
  const pathname = usePathname();
  const [active, setActive] = useState<Section>("home");

  // Extract lang from pathname or default to 'de'
  const lang = pathname?.split('/')[1] || 'de';
  const isHomePage = pathname === `/${lang}`;

  // Scroll-spy: highlight the section currently in the middle of the screen.
  // The observed elements only exist on pages that render those sections.
  useEffect(() => {
    const targets = [
      document.getElementById("rechner"),
      document.getElementById("services"),
    ].filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) {
      setActive("home");
      return;
    }

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        if (visible.has("rechner")) setActive("rechner");
        else if (visible.has("services")) setActive("services");
        else setActive("home");
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    trackEvent('click_scroll_top');
  };

  const itemClass =
    "flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-all duration-200 min-w-[60px] active:scale-95";

  const iconClass = (isActive: boolean) =>
    cn("w-5 h-5 transition-colors duration-200", isActive ? "text-primary" : "text-muted-foreground");

  const labelClass = (isActive: boolean) =>
    cn("text-[10px] transition-colors duration-200", isActive ? "text-primary font-medium" : "text-muted-foreground");

  const homeActive = isHomePage && active === "home";
  const rechnerActive = active === "rechner";
  const servicesActive = active === "services";

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav
        aria-label="Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-in slide-in-from-bottom duration-500 delay-500 fill-mode-forwards"
      >
        <div className="mx-2 mb-2 glass-nav rounded-2xl px-2 py-2 flex items-center justify-around shadow-2xl">
          {/* Home */}
          <Link
            href={`/${lang}`}
            onClick={() => trackEvent('click_home_nav')}
            aria-current={homeActive ? 'true' : undefined}
            className={itemClass}
          >
            <Home className={iconClass(homeActive)} />
            <span className={labelClass(homeActive)}>Home</span>
          </Link>

          {/* Calculator */}
          <Link
            href={`/${lang}#rechner`}
            onClick={() => trackEvent('click_calculator')}
            aria-current={rechnerActive ? 'true' : undefined}
            className={itemClass}
          >
            <Calculator className={iconClass(rechnerActive)} />
            <span className={labelClass(rechnerActive)}>Preis</span>
          </Link>

          {/* Call Button - Prominent */}
          <a
            href="tel:026718080"
            onClick={() => trackEvent('click_call_now')}
            className="flex flex-col items-center justify-center -mt-6 active:scale-95 transition-transform duration-200"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 glow-gold animate-pulse-glow">
              <Phone className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-[10px] text-primary mt-1 font-medium">Anrufen</span>
          </a>

          {/* Services */}
          <Link
            href={`/${lang}#services`}
            onClick={() => trackEvent('click_services_nav')}
            aria-current={servicesActive ? 'true' : undefined}
            className={itemClass}
          >
            <Menu className={iconClass(servicesActive)} />
            <span className={labelClass(servicesActive)}>Service</span>
          </Link>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className={itemClass}
          >
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Top</span>
          </button>
        </div>
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="h-20 md:hidden" />
    </>
  );
}
