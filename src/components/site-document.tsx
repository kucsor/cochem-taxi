import '@/app/globals.css';
import { SiteTracker } from '@/components/site-tracker';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Poppins } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { Analytics } from '@/components/analytics';
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

/**
 * Google Analytics measurement ID for THIS site - from the GA4 property whose
 * web data stream points at cochem-taxi.de. Public by nature, since it ends up
 * in the page source either way.
 *
 * Must never be swapped for an ID from another property: that would quietly mix
 * this site's traffic into that project's reports and make both unusable.
 * Loads only after cookie consent (see src/components/analytics.tsx).
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-R1ZRPLYTDH';

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
          <Analytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
          <SiteTracker />
          {children}
        </ConsentProvider>
        <Toaster />
      </body>
    </html>
  );
}
