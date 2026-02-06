import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import { Inter, Poppins } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || '';

  return (
    <html className={`dark ${inter.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
          nonce={nonce}
        />
        <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
