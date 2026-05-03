import React from "react";
import Button from "./Button";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface FeatureLockProps {
  title: string;
  description: string;
  planRequired?: string;
}

export default function FeatureLock({ title, description, planRequired = "Premium (Plan 2)" }: FeatureLockProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl p-8 md:p-12 text-center space-y-6">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100 mb-2">
          <LockClosedIcon className="w-8 h-8 text-slate-400" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          {description} This feature is exclusive to our <span className="font-bold text-primary">{planRequired}</span> users.
        </p>

        <div className="pt-4">
          <Link href="/subscription">
            <Button size="lg" className="rounded-2xl px-8 h-14 text-lg font-bold shadow-lg shadow-primary/20">
              Upgrade to Unlock
            </Button>
          </Link>
        </div>
        
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black pt-4">
          DairyPro Premium Features
        </p>
      </div>
    </div>
  );
}
