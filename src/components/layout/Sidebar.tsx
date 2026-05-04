"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import {
  CalendarDays,
  Briefcase,
  BookOpen,
  BarChart2,
  User,
  Zap,
} from "lucide-react";

const navItems = [
  { href: ROUTES.APP.TODAY, icon: CalendarDays, label: "Today" },
  { href: ROUTES.APP.JOBS, icon: Briefcase, label: "My Jobs" },
  { href: ROUTES.APP.JOURNAL, icon: BookOpen, label: "Journal" },
  { href: ROUTES.APP.REPORTS, icon: BarChart2, label: "Reports" },
  { href: ROUTES.APP.ACCOUNT, icon: User, label: "Account" },
];

interface SidebarProps {
  isPro?: boolean;
  username?: string;
  initials?: string;
}

export function Sidebar({ isPro = false, username, initials }: SidebarProps) {
  const pathname = usePathname();

  // Helper to fallback initials if not provided
  const displayInitials = initials
    ? initials
    : username
      ? username.substring(0, 2).toUpperCase()
      : "SM";

  return (
    <aside className="hidden lg:flex flex-col w-[240px] bg-white border-r border-border h-screen sticky top-0 shrink-0">
      {/* Header */}
      <div className="flex flex-col py-6 px-6 border-b border-border">
        <span className="font-sora font-bold text-[22px] text-primary-navy leading-[1.2] mb-1">
          Notary Day
        </span>
        <span className="font-inter text-[13px] text-muted leading-tight">
          Smart scheduling for notaries
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-[14px] px-3 py-2.5 rounded-[8px] text-[15px] font-inter font-medium transition-colors",
                isActive
                  ? "text-interactive-blue bg-interactive-blue/[0.04]"
                  : "text-slate-body hover:bg-slate-50",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive
                    ? "text-interactive-blue"
                    : "text-slate-body opacity-80",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 flex flex-col gap-[22px]">
        {/* Can I Take This? Button */}
        <button className="w-full h-12 rounded-[10px] bg-primary-navy text-white font-inter font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#1A3D6B] transition-colors shadow-[0_2px_4px_rgba(15,44,78,0.2)]">
          <Zap className="w-[18px] h-[18px]" fill="none" strokeWidth={2} />
          <span>Can I Take This?</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-1 mb-2">
          <div className="w-[42px] h-[42px] rounded-full bg-primary-navy flex items-center justify-center text-white font-sora font-bold text-[15px] shrink-0">
            {displayInitials}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-inter font-bold text-[14px] text-primary-navy leading-none mb-1.5 truncate">
              {username || "Sarah Mitchell"}
            </span>
            <span className="font-inter text-[13px] text-muted leading-none">
              {isPro ? "Pro plan" : "Free version"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
