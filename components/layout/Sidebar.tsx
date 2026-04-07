"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-gradient-to-b from-primary to-primary-muted text-primary-foreground border-r border-primary/30 h-screen flex flex-col shadow-card">
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          DairyPro
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              pathname.startsWith(item.href)
                ? "bg-white/20 text-white shadow-sm"
                : "text-primary-foreground/85 hover:bg-white/10"
            }`}
          >
            <item.icon className="h-5 w-5 mr-3 opacity-90" />
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
          className="w-full justify-center border-white/30 text-primary-foreground hover:bg-white/10 bg-transparent"
          onClick={signOut}
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          {t("common.signOut")}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
