"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ConsentState = "unset" | "granted" | "denied";

const STORAGE_KEY = "cochem-taxi-consent-v1";

type ConsentContextValue = {
  consent: ConsentState;
  /** False until localStorage has been read, so nothing flashes on first paint. */
  hydrated: boolean;
  accept: () => void;
  decline: () => void;
  /** Forgets the stored choice so the banner asks again. */
  reset: () => void;
};

const ConsentContext = createContext<ConsentContextValue>({
  consent: "unset",
  hydrated: false,
  accept: () => {},
  decline: () => {},
  reset: () => {},
});

/**
 * Gate for Google Analytics, which sets cookies. Nothing loads until the
 * visitor accepts - required by DSGVO / TDDDG in Germany.
 */
export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>("unset");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "granted" || stored === "denied") {
        setConsent(stored);
      }
    } catch {
      // Private mode or storage disabled - stay on "unset", nothing loads.
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((value: Exclude<ConsentState, "unset">) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Choice is not persisted, but it still applies for this page view.
    }
    setConsent(value);
  }, []);

  /**
   * Clears the stored decision so the banner asks again. Without this a visitor
   * who once chose "essential only" was stuck with it forever - the banner only
   * shows while the choice is unset - which is both a dead end for them and at
   * odds with the requirement that consent be as easy to withdraw as to give.
   */
  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing stored to clear; the in-memory reset below still applies.
    }
    setConsent("unset");
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hydrated,
      accept: () => persist("granted"),
      decline: () => persist("denied"),
      reset,
    }),
    [consent, hydrated, persist, reset]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  return useContext(ConsentContext);
}
