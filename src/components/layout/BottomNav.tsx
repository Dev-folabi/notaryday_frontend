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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-area-bottom lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="h-[60px] flex items-center justify-around px-1 relative">
        {/* Left items */}
        {LEFT_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
              isActive(href) ? "text-primary-navy" : "text-slate-secondary"
            )}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive(href) ? 2.5 : 2} />
            <span className="text-[10px] font-inter font-medium">{label}</span>
          </Link>
        ))}

        {/* Centre CITT FAB — floats above the nav bar */}
        <div className="flex flex-col items-center justify-center flex-1 h-full relative">
          <button
            onClick={() => openCITT()}
            aria-label="Can I Take This?"
            className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-primary-navy to-interactive-blue flex items-center justify-center absolute -top-[22px] shadow-[0_6px_20px_rgba(15,44,78,0.35)] border-[3px] border-bg hover:scale-105 active:scale-95 transition-transform z-10"
          >
            <Zap className="w-[18px] h-[18px] text-white" fill="white" strokeWidth={0} />
          </button>
          <span className="text-[10px] font-inter font-medium text-slate-secondary mt-[2px]">
            CITT
          </span>
        </div>

        {/* Right items */}
        {RIGHT_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
              isActive(href) ? "text-primary-navy" : "text-slate-secondary"
            )}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive(href) ? 2.5 : 2} />
            <span className="text-[10px] font-inter font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
