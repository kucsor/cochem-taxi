"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  end: number;
  durationMs?: number;
  /** Formats the animated value; defaults to rounding to an integer. */
  format?: (value: number) => string;
  suffix?: string;
  className?: string;
};

/**
 * Animates a number from 0 to `end` when it scrolls into view (fire-once).
 * Respects prefers-reduced-motion by rendering the final value immediately.
 *
 * Screen readers: the animated span is aria-hidden and a visually hidden
 * sibling carries the final value, so assistive tech never hears the
 * intermediate ticks.
 */
export function CountUp({
  end,
  durationMs = 800,
  format = (value) => String(Math.round(value)),
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      setDone(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          setValue(end * eased);
          if (t < 1) {
            frame = requestAnimationFrame(tick);
          } else {
            setDone(true);
          }
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [end, durationMs]);

  const finalText = `${format(end)}${suffix}`;

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{done ? finalText : `${format(value)}${suffix}`}</span>
      <span className="sr-only">{finalText}</span>
    </span>
  );
}
