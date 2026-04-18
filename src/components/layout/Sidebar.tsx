"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Map,
  Briefcase,
  CalendarCheck,
  TrendingUp,
  Receipt,
  BookOpen,
  Settings,
  CreditCard,
} from "lucide-react";

const navItems = [
  { href: "/", icon: CalendarDays, label: "Today" },
  { href: "/map", icon: Map, label: "Map", pro: true },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/bookings", icon: CalendarCheck, label: "Bookings", pro: true },
  { href: "/earnings", icon: TrendingUp, label: "Earnings" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/reports", icon: BookOpen, label: "Reports", pro: true },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/settings/billing", icon: CreditCard, label: "Billing" },
];

interface SidebarProps {
  isPro?: boolean;
  username?: string;
}

export function Sidebar({ isPro = false, username }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] bg-white border-r border-border h-screen sticky top-0">
      <div className="h-[56px] flex items-center px-5 border-b border-border">
        <span className="font-sora font-bold text-lg text-primary-navy">
          Notary Day
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map(({ href, icon: Icon, label, pro }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={pro && !isPro ? "/settings/billing" : href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-inter font-medium",
                isActive
                  ? "bg-interactive-blue/10 text-interactive-blue"
                  : "text-slate-body hover:bg-bg",
                pro && !isPro && "opacity-60"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}