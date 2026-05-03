"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SubscriptionPage from "@/app/(app)/subscription/page";

export default function HardLockOverlay({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip lock check for public routes or the subscription page itself
    const publicRoutes = ["/", "/login", "/signup", "/subscription"];
    if (publicRoutes.includes(pathname)) {
      setLoading(false);
      return;
    }

    async function checkStatus() {
      try {
        const res = await fetch("/api/subscription-status");
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error("Failed to fetch subscription status:", err);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [pathname]);

  if (loading) return children;

  // If locked, show full screen overlay with pricing
  if (status?.isLocked) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-y-auto">
        <div className="flex-1 bg-background/95 backdrop-blur-md pb-20">
          <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25-2.25Z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Account Locked</h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Your {status.status === "expired" ? "trial has expired" : "subscription has ended"}. 
              To continue managing your dairy business, please select a plan below.
            </p>
          </div>
          
          <div className="pointer-events-auto">
            <SubscriptionPage />
          </div>
        </div>
      </div>
    );
  }

  return children;
}
