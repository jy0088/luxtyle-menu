import './globals.css';
import type { Metadata, Viewport } from 'next';
import PWARegister from './PWARegister';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';

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
  icons: {
    apple: [
      { url: '/icons/icon-192.png' },
      { url: '/icons/icon-72.png', sizes: '72x72' },
      { url: '/icons/icon-96.png', sizes: '96x96' },
      { url: '/icons/icon-128.png', sizes: '128x128' },
      { url: '/icons/icon-192.png', sizes: '192x192' },
      { url: '/icons/icon-512.png', sizes: '512x512' },
    ],
  },
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
        {/* PWA manifest, apple-touch-icons and apple-mobile-web-app-* come from `metadata`
            so nested segments (e.g. /staff) can override them with their own manifest + icon. */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
