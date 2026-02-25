import './globals.css';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luxtyle Menu",
  description: "Luxtyle Digital Menu",
  manifest: "/manifest.json",
  themeColor: "#F5F2EC",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Luxtyle",
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}