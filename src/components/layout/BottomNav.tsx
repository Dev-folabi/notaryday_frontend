"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import {
  CalendarDays,
  Briefcase,
  BarChart2,
  User,
  Zap,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";

// Prototype bottom nav: Today | Jobs | [CITT FAB] | Reports | Account
const LEFT_ITEMS = [
  { href: ROUTES.APP.TODAY, icon: CalendarDays, label: "Today" },
  { href: ROUTES.APP.JOBS, icon: Briefcase, label: "Jobs" },
];

const RIGHT_ITEMS = [
  { href: ROUTES.APP.REPORTS, icon: BarChart2, label: "Reports" },
  { href: ROUTES.APP.ACCOUNT, icon: User, label: "Account" },
];

interface BottomNavProps {
  isPro?: boolean;
  username?: string;
}

export function BottomNav({ isPro = false, username }: BottomNavProps) {
  const pathname = usePathname();
  const openCITT = useUIStore((s) => s.openCITT);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="relative" style={{ height: "68px" }}>
        {/* Notched SVG background: white fill matches existing nav bg */}
        <svg
          className="absolute inset-0 w-full h-full drop-shadow-[0_-1px_0_rgba(226,232,240,1)]"
          viewBox="0 0 375 68"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M0,0
               L140,0
               Q158,0 163,8
               Q175,30 187.5,30
               Q200,30 212,8
               Q217,0 235,0
               L375,0
               L375,68
               L0,68
               Z"
            fill="white"
          />
        </svg>

        {/* Nav item row */}
        <div className="absolute inset-0 flex items-center justify-around px-2">
          {/* Left items */}
          {LEFT_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary-navy" : "text-slate-secondary"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-inter font-medium transition-colors",
                    active
                      ? "text-primary-navy font-semibold"
                      : "text-slate-secondary"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Centre spacer for FAB cutout */}
          <div className="flex-1" aria-hidden="true" />

          {/* Right items */}
          {RIGHT_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary-navy" : "text-slate-secondary"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-inter font-medium transition-colors",
                    active
                      ? "text-primary-navy font-semibold"
                      : "text-slate-secondary"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Centre CITT FAB: floats above the notch, icon only */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[26px] z-50">
          <button
            onClick={() => openCITT()}
            aria-label="Can I Take This?"
            className={cn(
              "w-[60px] h-[60px] rounded-full",
              "bg-gradient-to-br from-primary-navy to-interactive-blue",
              "flex items-center justify-center",
              "shadow-[0_6px_20px_rgba(15,44,78,0.45)]",
              "border-[3px] border-bg",
              "hover:scale-105 active:scale-95 transition-transform duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
            )}
          >
            <Zap className="w-[24px] h-[24px] text-white" fill="white" strokeWidth={0} />
          </button>
        </div>
      </div>
    </nav>
  );
}
