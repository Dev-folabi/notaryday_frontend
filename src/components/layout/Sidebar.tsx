"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { Zap } from "lucide-react";
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

export const navItems = [
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

interface SidebarProps {
  isPro?: boolean;
  username?: string;
}

export function Sidebar({ isPro = false, username }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-[240px] bg-white border-r border-border h-screen sticky top-0 flex-shrink-0"
      aria-label="Desktop navigation"
    >
      {/* Wordmark - 56px height to match mobile topbar */}
      <div className="h-[56px] flex items-center px-5 border-b border-border">
        <span className="font-sora font-bold text-lg text-primary-navy tracking-tight">
          Notary Day
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {navItems.map(({ href, icon: Icon, label, pro }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={pro && !isPro ? "/settings/billing" : href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-inter font-medium transition-colors duration-150",
                  isActive
                    ? "bg-interactive-blue/10 text-interactive-blue"
                    : "text-slate-body hover:bg-bg",
                  pro && !isPro && "opacity-60",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {pro && !isPro && (
                  <span className="ml-auto text-[9px] font-semibold uppercase bg-pro-gold text-primary-navy px-1.5 py-0.5 rounded">
                    Pro
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-border">
        {!isPro && (
          <div className="mb-6 p-4 bg-primary-navy rounded-20px text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-interactive-blue/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-interactive-blue/30 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-pro-gold flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary-navy" />
                </div>
                <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-pro-gold">
                  Pro Engine
                </span>
              </div>
              <div className="font-sora font-bold text-sm mb-1 leading-tight">
                Gap Finder & Route Optimisation
              </div>
              <p className="font-inter text-[10px] text-white/50 mb-4 leading-relaxed">
                Increase your net profit by up to 24% per day.
              </p>
              <Link
                href="/settings/billing"
                className="flex items-center justify-center h-8 w-full bg-white text-primary-navy font-inter font-bold text-[10px] uppercase tracking-wider rounded-8px hover:bg-slate-50 transition-colors"
              >
                Try 7 Days Free
              </Link>
            </div>
          </div>
        )}

        {username && (
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-border text-primary-navy text-xs font-bold flex items-center justify-center font-inter">
              {getInitials(username)}
            </div>
            <div className="flex flex-col">
              <span className="font-inter text-xs font-bold text-primary-navy truncate max-w-[120px]">
                @{username}
              </span>
              <span className="font-inter text-[10px] text-slate-secondary font-medium">
                Standard Account
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-muted ml-auto hover:text-primary-navy cursor-pointer transition-colors" />
          </div>
        )}
      </div>
    </aside>
  );
}
