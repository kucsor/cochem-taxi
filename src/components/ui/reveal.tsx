"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  /**
   * Stagger direct children via the `.stagger-children` CSS instead of
   * animating the container. Use this for card/badge grids - it replaces the
   * old pattern of nesting one Reveal per child.
   */
  stagger?: boolean;
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.8,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reduced motion: the hidden pre-state is a class, not an animation, so
    // the global CSS media query alone would leave content invisible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (stagger) {
    return (
      <div
        ref={ref}
        className={cn(
          className,
          // Children start hidden; once visible, .stagger-children runs the
          // nth-child delayed reveal-up on each of them.
          isVisible ? "stagger-children" : "[&>*]:opacity-0"
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        className,
        isVisible ? "reveal-up" : "opacity-0 translate-y-8"
      )}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationFillMode: "forwards"
      }}
    >
      {children}
    </div>
  );
}
