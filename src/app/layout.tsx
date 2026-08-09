import './globals.css';
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
 * Google Analytics measurement ID. Public by nature - it ends up in the page
 * source either way - so it ships as the default and needs no Vercel config.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID to point at a different property.
 * Loads only after cookie consent (see src/components/analytics.tsx).
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-L53813EW8Y';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f1f1f',
};

export const metadata: Metadata = {
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/android-chrome-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`dark ${inter.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">
        <ConsentProvider>
          <Analytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
          {children}
        </ConsentProvider>
        <Toaster />
      </body>
    </html>
  );
}
