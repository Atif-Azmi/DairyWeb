import type { ReactNode } from "react";
import { Outfit } from "next/font/google";
import "../styles/globals.css";
import ClientI18nProvider from "@/components/i18n/ClientI18nProvider";
import Script from "next/script";
import HardLockOverlay from "@/components/subscription/HardLockOverlay";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import type { Viewport } from "next";

export const metadata = {
  title: "DairyPro Management",
  description: "Modern dairy management system",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DairyPro",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable}`}>
      <body suppressHydrationWarning className="min-h-screen antialiased bg-page text-foreground font-sans">
        <ClientI18nProvider>
          <HardLockOverlay>
            {children}
          </HardLockOverlay>
        </ClientI18nProvider>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
