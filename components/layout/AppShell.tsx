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
    <div className="flex min-h-screen bg-page text-foreground">
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
