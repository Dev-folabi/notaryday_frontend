"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  X,
  LogOut,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";
import { toDateInputValue } from "@/lib/utils";
import type { Job } from "@/types/job";

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
    label: "Plan my day",
    items: [
      { href: ROUTES.APP.TODAY, icon: CalendarDays, label: "Today" },
      { href: ROUTES.APP.ACTIVE, icon: Clock, label: "Active Signing", liveTag: true },
      { href: ROUTES.APP.JOBS, icon: Briefcase, label: "My Jobs" },
      { href: ROUTES.APP.GAP, icon: Sparkles, label: "Gap Finder", proOnly: true },
    ],
  },
  {
    label: "Grow and Track",
    items: [
      { href: ROUTES.APP.JOURNAL, icon: BookOpen, label: "Journal" },
      { href: ROUTES.APP.IMPORT, icon: Mail, label: "Email Import" },
      { href: ROUTES.APP.BOOKINGS, icon: Link2, label: "Bookings" },
      { href: ROUTES.APP.INVOICES, icon: FileText, label: "Invoices" },
      { href: ROUTES.APP.REPORTS, icon: BarChart2, label: "Reports" },
    ],
  },
  {
    label: "System",
    items: [
      { href: ROUTES.APP.NOTIFICATIONS, icon: Bell, label: "Notifications", badgeKey: "notif" },
      { href: ROUTES.APP.ACCOUNT, icon: User, label: "Account" },
    ],
  },
];

interface MobileDrawerProps {
  isPro?: boolean;
  username?: string;
  notifCount?: number;
}

export function MobileDrawer({ isPro = false, username, notifCount = 0 }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setOpen = useUIStore((s) => s.setMobileMenuOpen);
  const openCITT = useUIStore((s) => s.openCITT);
  const { logoutMutation } = useAuth();

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
    (j) => j.status === "IN_PROGRESS" || j.status === "SCANNING",
  );

  const displayInitials = username
    ? username.substring(0, 2).toUpperCase()
    : "ND";

  return (
    <>
      <div
        className={cn("drawer-overlay", !isOpen && "hidden")}
        onClick={() => setOpen(false)}
      >
        <div
          className="drawer"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="drawer-hdr">
            <div>
              <div className="sb-wordmark">Notary Day</div>
              <span className="sb-tag">Smart scheduling for notaries</span>
            </div>
            <span className={cn("chip", isPro ? "c-pro" : "c-free")}>
              {isPro ? "Pro" : "Free"}
            </span>
            <button className="modal-close ml-2" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="drawer-nav">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <div className="sb-section">{section.label}</div>
                {section.items.map(({ href, icon: Icon, label, liveTag, proOnly, badgeKey }) => {
                  const isActive =
                    pathname === href || (href !== "/" && pathname.startsWith(href));
                  const showNotifBadge = badgeKey === "notif" && notifCount > 0;
                  const showLive = liveTag && hasActiveJob;

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn("si", isActive && "on")}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                      <span className="flex-1 truncate">{label}</span>

                      {showLive && (
                        <span className="si-badge" style={{ background: "var(--amber-2)", color: "var(--amber)", border: "1px solid var(--amber-b)" }}>
                          Live
                        </span>
                      )}
                      {proOnly && !isPro && (
                        <span className="si-badge" style={{ background: "var(--gold)", color: "var(--navy)" }}>
                          Pro
                        </span>
                      )}
                      {showNotifBadge && <span className="si-badge">{notifCount}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="border-t border-border p-3 flex flex-col gap-3">
            <button onClick={() => { setOpen(false); openCITT(); }} className="citt-sb">
              <Zap className="w-4 h-4" strokeWidth={2} />
              Can I Take This
            </button>
            <div className="sb-user">
              <div className="av">{displayInitials}</div>
              <div className="overflow-hidden">
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>{username || "Notary"}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>{isPro ? "Pro plan" : "Free plan"}</div>
              </div>
              <button
                className="flex items-center gap-1 ml-auto text-[12px] text-slate-secondary"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
