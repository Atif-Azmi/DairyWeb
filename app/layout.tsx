import type { ReactNode } from "react";
import "../styles/globals.css";
import ClientI18nProvider from "@/components/i18n/ClientI18nProvider";

export const metadata = {
  title: "Dairy Management Pro — Shaibya Solutions",
  description: "Modern dairy management system",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        <ClientI18nProvider>{children}</ClientI18nProvider>
      </body>
    </html>
  );
}
