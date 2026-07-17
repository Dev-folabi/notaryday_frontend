"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import {
  CalendarDays,
  Clock,
  Briefcase,
  Sparkles,
  BookOpen,
  Mail,
  Link2,
  FileText,
  BarChart2,
  Bell,
  User,
  Zap,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";
import { toDateInputValue } from "@/lib/utils";
import type { Job } from "@/types/job";

interface SidebarProps {
  isPro?: boolean;
  username?: string;
  initials?: string;
  notifCount?: number;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  liveTag?: boolean;
  proOnly?: boolean;
  badgeKey?: string;
}

const NAV_SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Day",
    items: [
      { href: ROUTES.APP.TODAY, icon: CalendarDays, label: "Today" },
      { href: ROUTES.APP.ACTIVE, icon: Clock, label: "Active Signing", liveTag: true },
    ],
  },
  {
    label: "Jobs",
    items: [
      { href: ROUTES.APP.JOBS, icon: Briefcase, label: "My Jobs" },
      { href: ROUTES.APP.GAP, icon: Sparkles, label: "Gap Finder", proOnly: true },
      { href: ROUTES.APP.BOOKINGS, icon: Link2, label: "Bookings" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: ROUTES.APP.INVOICES, icon: FileText, label: "Invoices" },
      { href: ROUTES.APP.REPORTS, icon: BarChart2, label: "Reports" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: ROUTES.APP.JOURNAL, icon: BookOpen, label: "Journal" },
      { href: ROUTES.APP.IMPORT, icon: Mail, label: "Email Import" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: ROUTES.APP.NOTIFICATIONS, icon: Bell, label: "Notifications", badgeKey: "notif" },
      { href: ROUTES.APP.ACCOUNT, icon: User, label: "Account" },
    ],
  },
];

export function Sidebar({ isPro = false, username, initials, notifCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const openCITT = useUIStore((s) => s.openCITT);

  // Check if there is an active (IN_PROGRESS or SCANNING) job today
  const today = toDateInputValue(new Date());
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", "sidebar-active", today],
    queryFn: async () => {
      const res = await jobsApi.list({ date: today });
      const p = (res as any).data ?? res;
      return (p.data ?? p) as Job[];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const hasActiveJob = jobs.some(
    (j) => j.status === "IN_PROGRESS" || j.status === "SCANNING"
  );

  const displayInitials = initials
    ? initials
    : username
      ? username.substring(0, 2).toUpperCase()
      : "ND";

  return (
    <aside className="hidden lg:flex flex-col w-[240px] bg-white border-r border-border h-screen sticky top-0 shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="flex flex-col py-5 px-5 border-b border-border flex-shrink-0">
        <span className="font-sora font-bold text-[20px] text-primary-navy leading-none mb-1">
          Notary Day
        </span>
        <span className="font-inter text-[12px] text-muted">
          Smart scheduling for notaries
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-0.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            <span className="block px-2 pt-3 pb-1.5 font-inter text-[9px] font-semibold text-muted uppercase tracking-[0.6px]">
              {section.label}
            </span>
            {section.items.map(({ href, icon: Icon, label, liveTag, proOnly, badgeKey }) => {
              const isActive =
                pathname === href || (href !== "/" && pathname.startsWith(href));

              // Active Signing: show live badge only when there's an active job
              const showLive = liveTag && hasActiveJob;
              // Notifications badge
              const showNotifBadge = badgeKey === "notif" && notifCount > 0;

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] font-inter text-[13px] font-medium transition-colors mb-0.5 group",
                    isActive
                      ? "bg-blue-bg text-primary-navy font-semibold"
                      : "text-slate-body hover:bg-slate-50 hover:text-primary-navy"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] flex-shrink-0",
                      isActive ? "text-interactive-blue" : "text-slate-body opacity-70 group-hover:opacity-100"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="flex-1 truncate">{label}</span>

                  {/* Live badge for Active Signing */}
                  {showLive && (
                    <span className="text-[9px] font-bold bg-amber-bg text-amber-warning px-1.5 py-0.5 rounded-[4px] border border-amber-border flex-shrink-0">
                      Live
                    </span>
                  )}

                  {/* Pro badge */}
                  {proOnly && !isPro && (
                    <span className="text-[9px] font-bold bg-pro-gold/15 text-amber-warning px-1.5 py-0.5 rounded-[4px] border border-pro-gold/30 flex-shrink-0">
                      Pro
                    </span>
                  )}

                  {/* Notifications count */}
                  {showNotifBadge && (
                    <span className="text-[9px] font-bold bg-red-danger/10 text-red-danger px-1.5 py-0.5 rounded-full border border-red-danger/20 flex-shrink-0">
                      {notifCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 flex flex-col gap-3 border-t border-border flex-shrink-0">
        {/* Can I Take This? */}
        <button
          onClick={() => openCITT()}
          className="w-full h-11 rounded-[10px] bg-primary-navy text-white font-inter font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-navy-active transition-colors shadow-[0_2px_4px_rgba(15,44,78,0.2)]"
        >
          <Zap className="w-4 h-4" strokeWidth={2} />
          Can I Take This?
        </button>

        {/* User row */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-primary-navy flex items-center justify-center text-white font-sora font-bold text-[12px] flex-shrink-0">
            {displayInitials}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-inter font-semibold text-[13px] text-primary-navy leading-none mb-1 truncate">
              {username || "Notary"}
            </span>
            <span className="font-inter text-[11px] text-muted leading-none">
              {isPro ? "Pro plan" : "Free plan"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
