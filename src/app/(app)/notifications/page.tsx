"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO, isToday, isYesterday } from "date-fns";
import {
  Bell,
  CheckCircle2,
  MapPin,
  DollarSign,
  Calendar,
  Mail,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  BOOKING_RECEIVED: <Calendar className="w-4 h-4 text-violet" />,
  BOOKING_CONFIRMED: <CheckCircle2 className="w-4 h-4 text-teal-success" />,
  JOB_REMINDER: <MapPin className="w-4 h-4 text-interactive-blue" />,
  INVOICE_SENT: <DollarSign className="w-4 h-4 text-teal-success" />,
  PAYMENT_RECEIVED: <DollarSign className="w-4 h-4 text-teal-success" />,
  CLIENT_ETA: <Mail className="w-4 h-4 text-amber-warning" />,
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications/list");
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any[];
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Group by date
  const grouped: { label: string; items: any[] }[] = [];
  const today: any[] = [],
    yesterday: any[] = [],
    earlier: any[] = [];
  for (const n of notifications) {
    const d = parseISO(n.created_at);
    if (isToday(d)) today.push(n);
    else if (isYesterday(d)) yesterday.push(n);
    else earlier.push(n);
  }
  if (today.length) grouped.push({ label: "Today", items: today });
  if (yesterday.length) grouped.push({ label: "Yesterday", items: yesterday });
  if (earlier.length) grouped.push({ label: "Earlier", items: earlier });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-navy" />
          <h1 className="font-sora font-bold text-xl text-primary-navy">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="bg-red-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-border rounded-14px p-8 text-center">
            <Bell className="w-10 h-10 text-slate-secondary mx-auto mb-3" />
            <p className="font-inter text-sm text-slate-secondary">
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.label}>
                <div className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide mb-2">
                  {group.label}
                </div>
                <div className="flex flex-col gap-1.5">
                  {group.items.map((n: any) => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && markRead.mutate(n.id)}
                      className={cn(
                        "bg-white border rounded-10px px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors",
                        n.is_read
                          ? "border-border"
                          : "border-interactive-blue/30 bg-blue-bg/30",
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                        {TYPE_ICONS[n.type] ?? (
                          <Sparkles className="w-4 h-4 text-slate-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={cn(
                              "font-inter text-sm",
                              n.is_read
                                ? "text-slate-body"
                                : "font-semibold text-primary-navy",
                            )}
                          >
                            {n.title}
                          </span>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-interactive-blue flex-shrink-0" />
                          )}
                        </div>
                        <p className="font-inter text-xs text-slate-secondary truncate">
                          {n.body}
                        </p>
                        <span className="font-inter text-[10px] text-muted mt-1 block">
                          {formatDistanceToNow(parseISO(n.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {n.action_url && (
                        <Link
                          href={n.action_url}
                          className="font-inter text-[10px] text-interactive-blue font-semibold flex-shrink-0 mt-1"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
