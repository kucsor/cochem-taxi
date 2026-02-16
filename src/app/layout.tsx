import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Poppins } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { Analytics } from '@/components/analytics';

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

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
    <html className={`dark ${inter.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">
        <Analytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
