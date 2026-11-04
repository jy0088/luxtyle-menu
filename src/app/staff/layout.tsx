import type { Metadata, Viewport } from 'next';

// Staff-only area. Separate manifest + icon so "Add to Home Screen" from /staff/order
// installs a dedicated "SJ 叫货" app next to the customer menu PWA.
export const metadata: Metadata = {
  title: 'SJ 叫货单 · Luxtyle Staff',
  description: '员工叫货 · 审批 · 收货 / Staff ordering',
  manifest: '/staff/manifest.json',
  robots: { index: false, follow: false },
  icons: { apple: [{ url: '/icons/staff-192.png', sizes: '192x192' }] },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'SJ 叫货' },
};

export const viewport: Viewport = {
  themeColor: '#b4461c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
