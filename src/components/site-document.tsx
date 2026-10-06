import '@/app/globals.css';
import { TaxiPwa } from '@/components/taxi-pwa';
import { SiteTracker } from '@/components/site-tracker';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Poppins } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { ConsentProvider } from '@/components/consent-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f1f1f',
};

export const metadata: Metadata = {
  // AdSense ownership verification; advertising is configured separately.
  other: {
    'google-adsense-account': 'ca-pub-4881673408960749',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/android-chrome-192x192.png',
  },
};

export function SiteDocument({children, lang}: {children: React.ReactNode; lang: string}) {
  return (
    <html lang={lang} className={`dark ${inter.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">
        <ConsentProvider>
          <TaxiPwa />
          <SiteTracker />
          {children}
        </ConsentProvider>
        <Toaster />
      </body>
    </html>
  );
}
