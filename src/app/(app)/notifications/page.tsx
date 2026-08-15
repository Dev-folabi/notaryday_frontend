"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications.api";
import { useUIStore } from "@/store/uiStore";
import { Bell, Mail, DollarSign, Sparkles, ScanLine } from "lucide-react";
import api from "@/lib/api";

const CATEGORY: Record<string, "payment" | "import" | "gap" | "scanback"> = {
  PAYMENT_RECEIVED: "payment",
  INVOICE_PAID: "payment",
  PAYMENT_FAILED: "payment",
  JOB_IMPORTED: "import",
  EMAIL_IMPORT: "import",
  GAP_FOUND: "gap",
  BOOKING_RECEIVED: "gap",
  SCANBACK_DUE: "scanback",
  SCANBACK_REMINDER: "scanback",
  BOOKING_CONFIRMED: "import",
};

const CATEGORY_STYLE: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  payment: { bg: "var(--teal-bg)", color: "var(--teal)", icon: <DollarSign className="w-4 h-4" /> },
  import: { bg: "var(--blue-bg)", color: "var(--blue)", icon: <Mail className="w-4 h-4" /> },
  gap: { bg: "var(--violet-bg)", color: "var(--violet)", icon: <Sparkles className="w-4 h-4" /> },
  scanback: { bg: "var(--amber-bg)", color: "var(--amber)", icon: <ScanLine className="w-4 h-4" /> },
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await notificationsApi.list();
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any[];
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      await Promise.all(
        (notifications as any[])
          .filter((n) => !n.is_read)
          .map((n) => api.patch(`/notifications/${n.id}/read`)),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      addToast({ type: "info", title: "All notifications marked as read" });
    },
  });

  const unread = (notifications as any[]).filter((n) => !n.is_read);

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Notifications</div>
        <button
          onClick={() => markAll.mutate()}
          disabled={unread.length === 0}
          className="bg-transparent border-none font-inter text-[11px] font-medium text-blue cursor-pointer"
        >
          Mark all read
        </button>
      </div>

      <div className="con">
        <div className="alert al-blue mb-4">
          <Bell className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
          <div className="font-inter text-[11px] leading-[1.4]">
            These are your in app notifications. Payment failure and plan expiry
            are always sent. Manage preferences in Account &gt; Notifications.
          </div>
        </div>

        <span className="slbl">Recent</span>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : (notifications as any[]).length === 0 ? (
          <div className="empty-box">
            <Bell className="w-9 h-9 text-slate-secondary mx-auto mb-2" />
            <p className="font-inter text-sm text-slate-secondary">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-2">
            {(notifications as any[]).map((n: any) => {
              const cat = CATEGORY[n.type] ?? "import";
              const style = CATEGORY_STYLE[cat];
              const isUnread = !n.is_read;
              return (
                <div
                  key={n.id}
                  className="card p-3 flex gap-2.5"
                  style={{
                    borderLeft: isUnread
                      ? "3px solid var(--navy)"
                      : "1px solid var(--border)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-0.5 flex-wrap">
                      <span className="font-inter text-[12px] font-semibold text-primary-navy">{n.title}</span>
                      <span className="font-inter text-[10px] text-muted whitespace-nowrap">{n.time_ago ?? n.created_at}</span>
                    </div>
                    <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mb-1.5 break-words">
                      {n.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
