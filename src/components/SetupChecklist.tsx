"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Bell, Calendar, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "@/api/users.api";
import { pushSupported } from "@/lib/push";
import { queryKeys } from "@/lib/queryClient";

interface SetupItem {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  proOnly: boolean;
}

const SETUP_ITEMS: SetupItem[] = [
  {
    key: "payment",
    label: "Add payment details",
    description: "Required for invoices and getting paid",
    href: "/settings?tab=profile",
    icon: CreditCard,
    proOnly: false,
  },
  {
    key: "notifications",
    label: "Enable push notifications",
    description: "Get alerts for bookings, reminders, and ETAs",
    href: "/settings?tab=notifications",
    icon: Bell,
    proOnly: false,
  },
  {
    key: "calendar",
    label: "Connect Google Calendar",
    description: "Sync confirmed jobs to your calendar",
    href: "/settings?tab=calendar",
    icon: Calendar,
    proOnly: true,
  },
];

function isPaymentInfoSet(paymentInfo: unknown): boolean {
  if (!paymentInfo || typeof paymentInfo !== "object") return false;
  const info = paymentInfo as Record<string, unknown>;
  return Object.values(info).some(
    (v) => typeof v === "string" && v.trim().length > 0,
  );
}

function isPushEnabled(
  notificationPrefs: Record<string, boolean> | null | undefined,
): boolean {
  if (notificationPrefs?.push_enabled === false) return false;
  return pushSupported();
}

export default function SetupChecklist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";
  const [dismissing, setDismissing] = useState(false);

  if (!user?.onboarding_completed) return null;
  if (user.settings?.setup_checklist_dismissed) return null;

  const settings = user.settings;
  const completed: Record<string, boolean> = {
    payment: isPaymentInfoSet(settings?.payment_info),
    notifications: isPushEnabled(settings?.notification_prefs),
    calendar: isPro && settings?.google_calendar_connected === true,
  };

  const incompleteItems = SETUP_ITEMS.filter((item) => {
    if (item.proOnly && !isPro) return false;
    return !completed[item.key];
  });

  if (incompleteItems.length === 0) return null;

  const dismiss = async () => {
    setDismissing(true);
    try {
      await usersApi.updateSettings({ setupChecklistDismissed: true });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    } catch {
      setDismissing(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-[14px] px-4 py-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-inter text-sm font-semibold text-primary-navy">
          Finish setting up
        </p>
        <button
          onClick={dismiss}
          disabled={dismissing}
          className="p-1 rounded hover:bg-bg transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-slate-secondary" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {incompleteItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-bg transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-bg border border-amber-b flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-amber" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-medium text-primary-navy group-hover:text-interactive-blue transition-colors">
                  {item.label}
                </p>
                <p className="font-inter text-xs text-slate-secondary">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
