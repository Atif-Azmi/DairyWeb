"use client";

import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface FeatureGateProps {
  children: React.ReactNode;
  feature: "premium" | "standard";
  fallback?: "lock" | "hide" | React.ReactNode;
  message?: string;
}

export default function FeatureGate({ 
  children, 
  feature, 
  fallback = "lock",
  message = "This feature requires a Premium Plan"
}: FeatureGateProps) {
  const { subscription, loading } = useSubscription();

  if (loading) return <div className="animate-pulse bg-slate-100 rounded-lg h-20 w-full" />;

  // Free trial unlocks everything
  if (subscription?.isTrialActive) return <>{children}</>;

  const isAllowed = feature === "premium" ? subscription?.isPremium : subscription?.isStandard;

  if (isAllowed) return <>{children}</>;

  if (fallback === "hide") return null;

  if (fallback === "lock") {
    return (
      <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:bg-slate-100/80">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link 
            href="/subscription"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform"
          >
            <LockClosedIcon className="h-4 w-4" />
            Upgrade to Unlock
          </Link>
        </div>
        <div className="filter blur-[1px] opacity-60 select-none pointer-events-none">
          {children}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <LockClosedIcon className="h-3 w-3" />
          {message}
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
}
