import type { Metadata, Viewport } from 'next';

// Staff-only area. Separate manifest + icon so "Add to Home Screen" from /staff/order
// installs a dedicated "SJ 叫货" app next to the customer menu PWA.
export const metadata: Metadata = {
  title: 'L$ Luxtyle Staff',
  description: '叫货 · 采买 · 仓库 / Ordering · Purchasing · Warehouse',
  manifest: '/staff/manifest.json',
  robots: { index: false, follow: false },
  icons: { apple: [{ url: '/icons/staff-192.png', sizes: '192x192' }] },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'L$' },
};

export const viewport: Viewport = {
  themeColor: '#1c1c1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
