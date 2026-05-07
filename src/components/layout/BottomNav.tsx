"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import {
  CalendarDays,
  Briefcase,
  BookOpen,
  Settings,
  Zap,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";

const bottomNavItems = [
  { href: ROUTES.APP.TODAY, icon: CalendarDays, label: "Today" },
  { href: ROUTES.APP.JOBS, icon: Briefcase, label: "Jobs" },
  { href: "CITT", icon: Zap, label: "CITT" },
  { href: ROUTES.APP.JOURNAL, icon: BookOpen, label: "Journal" },
  { href: ROUTES.APP.ACCOUNT, icon: Settings, label: "Settings" },
];

interface BottomNavProps {
  isPro?: boolean;
  username?: string;
}

export function BottomNav({ isPro = false, username }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-area-bottom lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="h-[60px] flex items-center justify-around px-1">
        {bottomNavItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href !== "CITT" &&
            (pathname === href || (href !== "/" && pathname.startsWith(href)));

          if (href === "CITT") {
            const openCITT = useUIStore.getState().openCITT;
            return (
              <button
                key="citt-trigger"
                onClick={() => openCITT()}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-slate-secondary"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-navy to-interactive-blue flex items-center justify-center -mt-6 border-4 border-bg shadow-lg">
                  <Zap className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="text-[10px] font-inter font-medium mt-1">
                  CITT
                </span>
              </button>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                isActive ? "text-primary-navy" : "text-slate-secondary",
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
