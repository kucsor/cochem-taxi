"use client";
import { setTrackingConsent } from "@/lib/tracking";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ConsentState = "unset" | "granted" | "denied";

const STORAGE_KEY = "cochem-taxi-consent-v2";

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

/** Consent controls the optional in-memory session identifier. */
export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>("unset");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Retire cookies and preference from the removed Google integration.
    for (const item of document.cookie.split(";")) {
      const name = item.split("=")[0].trim();
      if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      const parts = location.hostname.split(".");
      for (let i = 0; i < parts.length - 1; i++)
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${parts.slice(i).join(".")}`;
    }
    try {
      window.localStorage.removeItem("cochem-taxi-consent-v1");
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "granted" || stored === "denied") {
        setTrackingConsent(stored === "granted");
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
    setTrackingConsent(value === "granted");
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
    setTrackingConsent(false);
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
