import "@/app/globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cochem Taxi · Insights",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
