import "@/app/globals.css";
import AdminPwa from "./admin-pwa";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  title: "Cochem Taxi · Insights",
  manifest: "/admin.webmanifest",
  applicationName: "Cochem Insights",
  appleWebApp: { capable: true, title: "Insights", statusBarStyle: "default" },
  icons: { icon: "/insights-192.png", apple: "/insights-192.png" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#101827" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body><AdminPwa />{children}</body>
    </html>
  );
}
