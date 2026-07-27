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
};

const ConsentContext = createContext<ConsentContextValue>({
  consent: "unset",
  hydrated: false,
  accept: () => {},
  decline: () => {},
});

/**
 * Gate for everything that sets third-party cookies (Google Analytics, the
 * GetYourGuide widget). Nothing loads until the visitor accepts - required by
 * DSGVO / TDDDG in Germany.
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

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hydrated,
      accept: () => persist("granted"),
      decline: () => persist("denied"),
    }),
    [consent, hydrated, persist]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  return useContext(ConsentContext);
}
