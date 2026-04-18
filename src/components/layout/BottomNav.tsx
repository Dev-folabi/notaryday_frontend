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
  { href: "/reports", icon: TrendingUp, label: "Reports", pro: true },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/settings/billing", icon: CreditCard, label: "Billing" },
];

interface BottomNavProps {
  isPro?: boolean;
  username?: string;
}

export function BottomNav({ isPro = false }: BottomNavProps) {
  const pathname = usePathname();

  // Only show 4 main items to make room for CITT FAB in the center
  const mainItems = navItems.slice(0, 4);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-area-bottom lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="h-[60px] flex items-center justify-around px-1">
        {mainItems.map(({ href, icon: Icon, label, pro }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={pro && !isPro ? "/settings/billing" : href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[60px]",
                isActive ? "text-primary-navy" : "text-slate-secondary",
                pro && !isPro && "opacity-60",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-inter font-medium">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
