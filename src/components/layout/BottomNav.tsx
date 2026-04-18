"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Briefcase,
  TrendingUp,
  Receipt,
  Settings,
} from "lucide-react";

const bottomNavItems = [
  { href: "/", icon: CalendarDays, label: "Today" },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/earnings", icon: TrendingUp, label: "Earnings" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface BottomNavProps {
  isPro?: boolean;
}

export function BottomNav({ isPro = false }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-area-bottom lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="h-[60px] flex items-center justify-around px-1">
        {bottomNavItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                isActive ? "text-primary-navy" : "text-slate-secondary"
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