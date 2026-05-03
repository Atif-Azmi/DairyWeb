"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  UserGroupIcon, 
  BanknotesIcon, 
  Cog6ToothIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid, 
  UserGroupIcon as UserGroupIconSolid, 
  BanknotesIcon as BanknotesIconSolid, 
  Cog6ToothIcon as Cog6ToothIconSolid 
} from "@heroicons/react/24/solid";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: "Customers", href: "/customers", icon: UserGroupIcon, activeIcon: UserGroupIconSolid },
    { name: "Add", href: "/entries", icon: PlusIcon, isCenter: true },
    { name: "Billing", href: "/billing", icon: BanknotesIcon, activeIcon: BanknotesIconSolid },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon, activeIcon: Cog6ToothIconSolid },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-center -mt-8 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 border-4 border-white active:scale-95 transition-transform"
              >
                <item.icon className="w-7 h-7 text-white" />
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 active:opacity-60 transition-opacity ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-bold tracking-tight uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
