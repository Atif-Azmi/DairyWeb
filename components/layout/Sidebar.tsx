"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  HomeIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  BanknotesIcon,
  CubeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { useSubscription } from "@/hooks/useSubscription";
import { LockClosedIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { useI18n } from "@/components/i18n/LanguageProvider";
import Button from "@/components/ui/Button";

interface SidebarProps {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

const navigation = [
  { key: "nav.dashboard", href: "/dashboard", icon: HomeIcon },
  { key: "nav.customers", href: "/customers", icon: UserGroupIcon },
  { key: "nav.entries", href: "/entries", icon: DocumentChartBarIcon },
  { key: "nav.retail", href: "/retail", icon: ShoppingCartIcon },
  { key: "nav.products", href: "/products", icon: CubeIcon },
  { key: "nav.advances", href: "/advances", icon: WalletIcon },
  { key: "nav.billing", href: "/billing", icon: BanknotesIcon },
  { key: "nav.settings", href: "/settings", icon: Cog6ToothIcon },
];

const Sidebar = ({ mobileOpen = false, onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { subscription, loading: subLoading } = useSubscription();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await router.replace("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <aside
      className={`
        z-50 flex flex-shrink-0 flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-slate-200/60 bg-white/80 text-foreground
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        md:sticky md:top-4 md:m-4 md:h-[calc(100vh-2rem)] md:w-64 md:rounded-3xl md:translate-x-0
        ${mobileOpen ? "translate-x-0 w-[min(18rem,85vw)] h-screen bg-white" : "-translate-x-full md:translate-x-0 w-[min(18rem,85vw)] md:w-64"}
      `}
    >
      <div className="h-20 flex items-center justify-center border-b border-slate-100 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-t-3xl md:block hidden pointer-events-none" />
        <Link
          href="/dashboard"
          onClick={() => onNavigate?.()}
          className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent z-10 drop-shadow-sm"
        >
          DairyPro
        </Link>
      </div>

      {subscription && !subscription.isStandard && !subscription.isTrialActive && (
        <div className="px-4 py-2">
          <Link 
            href="/subscription"
            className="flex items-center p-3 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Link>
        </div>
      )}

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isLocked = !subLoading && subscription && 
            (item.href === "/billing" && !subscription.isStandard && !subscription.isTrialActive);
          
          return (
            <Link
              key={item.key}
              href={isLocked ? "/subscription" : item.href}
              onClick={() => onNavigate?.()}
              className={`group flex min-h-[44px] items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 touch-manipulation relative overflow-hidden ${
                pathname.startsWith(item.href)
                  ? "bg-primary/10 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] ring-1 ring-primary/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {pathname.startsWith(item.href) && (
                <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(5,150,105,0.4)]" />
              )}
              <item.icon className={`mr-3 h-5 w-5 shrink-0 transition-transform duration-300 ${pathname.startsWith(item.href) ? "text-primary opacity-100 scale-110" : "opacity-70 group-hover:scale-110 group-hover:text-primary"}`} />
              <span className="relative z-10 flex-1">{t(item.key)}</span>
              {isLocked && <LockClosedIcon className="h-3.5 w-3.5 text-slate-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 md:rounded-b-3xl">
        <div className="px-2 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
            Account Plan
          </p>
          <p className="text-xs font-bold text-primary flex items-center">
            {subLoading ? "..." : subscription?.plan === "plan2" ? "Premium" : subscription?.plan === "plan1" ? "Standard" : "Free Trial"}
            {subscription?.isTrialActive && <span className="ml-2 text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700">{subscription.daysLeftInTrial}d left</span>}
          </p>
        </div>
        
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-2 mb-3">
          <a 
            href="https://atif-azmi.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-primary hover:underline font-semibold"
          >
            Atif Azmi
          </a>
        </p>
        <Button
          variant="outline"
          className="min-h-[44px] w-full touch-manipulation justify-center border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 shadow-sm"
          onClick={signOut}
          disabled={signingOut}
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          {t("common.signOut")}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
