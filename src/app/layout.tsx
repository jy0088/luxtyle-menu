import './globals.css';
import type { Metadata, Viewport } from 'next';
import PWARegister from './PWARegister';

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Luxtyle Menu',
  description: 'Bei Yuan Tea & Boba · Yang Guo Fu Malatang · Tomo Gelato',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Luxtyle',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Luxtyle Digital Menu',
    description: 'San Diego · 7315 Clairemont Mesa Blvd',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        {/* PWA iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Luxtyle" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        {/* Splash screens iOS — optional but nice */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
