"use client";

import type { ReactNode } from "react";
import { useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const openNav = useCallback(() => setMobileNavOpen(true), []);
  const closeNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="flex min-h-screen bg-page text-foreground relative selection:bg-primary/20 selection:text-primary">
      {/* Subtle Light Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-page">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl mix-blend-multiply opacity-50 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl mix-blend-multiply opacity-50 transform -translate-x-1/3 translate-y-1/3" />
      </div>
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden touch-manipulation"
          onClick={closeNav}
        />
      ) : null}
      <Sidebar mobileOpen={mobileNavOpen} onNavigate={closeNav} />
      <div className="flex min-w-0 min-h-screen flex-1 flex-col">
        <AppHeader onOpenMobileNav={openNav} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 md:p-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
    </div>
  );
}
