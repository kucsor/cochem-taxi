"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function AdminPwa() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installing, setInstalling] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/admin-sw.js", {
        scope: "/admin", updateViaCache: "none",
      }).catch(() => { /* Dashboard remains usable without installation. */ });
    }
    const capture = (event: Event) => {
      if (window.matchMedia("(display-mode: standalone)").matches) return;
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const installed = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  if (!prompt) return null;
  return (
    <aside aria-label="Install Cochem Insights" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 20px", background: "#17202e", color: "#f8fafc", fontSize: 14 }}>
      <span>Keep Cochem Insights on your home screen.</span>
      <button disabled={installing} style={{ padding: "8px 16px", borderRadius: 8, background: "#fbbf24", color: "#101827", fontWeight: 700 }} onClick={async () => {
        setInstalling(true);
        try { await prompt.prompt(); await prompt.userChoice; }
        catch { /* The native browser menu remains available. */ }
        finally { setPrompt(null); setInstalling(false); }
      }}>Install app</button>
    </aside>
  );
}
