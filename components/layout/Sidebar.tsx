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
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/LanguageProvider";

const navigation = [
  { key: "nav.dashboard", href: "/dashboard", icon: HomeIcon },
  { key: "nav.customers", href: "/customers", icon: UserGroupIcon },
  { key: "nav.entries", href: "/entries", icon: DocumentChartBarIcon },
  { key: "nav.products", href: "/products", icon: CubeIcon },
  { key: "nav.billing", href: "/billing", icon: BanknotesIcon },
  { key: "nav.settings", href: "/settings", icon: Cog6ToothIcon },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

const Sidebar = ({ mobileOpen = false, onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
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
        z-50 flex h-screen w-[min(18rem,85vw)] flex-shrink-0 flex-col border-r border-primary/30 bg-gradient-to-b from-primary to-primary-muted text-primary-foreground shadow-card
        fixed inset-y-0 left-0 transform transition-transform duration-200 ease-out md:static md:translate-x-0 md:w-64
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <Link
          href="/dashboard"
          onClick={() => onNavigate?.()}
          className="text-xl font-bold tracking-tight"
        >
          DairyPro
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => onNavigate?.()}
            className={`flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all touch-manipulation ${
              pathname.startsWith(item.href)
                ? "bg-white/20 text-white shadow-sm"
                : "text-primary-foreground/85 hover:bg-white/10"
            }`}
          >
            <item.icon className="mr-3 h-5 w-5 shrink-0 opacity-90" />
            {t(item.key)}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60 px-2 mb-2">
          Shaibya Solutions
        </p>
        <Button
          variant="outline"
          className="min-h-[44px] w-full touch-manipulation justify-center border-white/30 bg-transparent text-primary-foreground hover:bg-white/10"
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
