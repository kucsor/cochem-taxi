import "@/app/globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cochem Taxi · Statistici",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="dark">
      <body>{children}</body>
    </html>
  );
}
