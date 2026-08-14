"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { usersApi } from "@/api/users.api";
import { Bell, Check, Mail } from "lucide-react";

const NOTIF_DEFS = [
  {
    key: "pre_sign_reminder",
    title: "Pre-signing reminder",
    desc: "30 minutes before each signing. Tap to navigate.",
    channel: "Push",
    lock: false,
  },
  {
    key: "scanback_reminder",
    title: "Scanback reminder",
    desc: "Fires when you mark a Loan Refi or Hybrid complete.",
    channel: "Push",
    lock: false,
  },
  {
    key: "new_booking_received",
    title: "New booking received",
    desc: "A client submitted a request through your booking page.",
    channel: "Push",
    lock: false,
  },
  {
    key: "job_imported",
    title: "Job imported",
    desc: "An email was forwarded and parsed successfully.",
    channel: "Push",
    lock: false,
  },
  {
    key: "payment_received",
    title: "Payment received",
    desc: "A client has paid an invoice via Stripe.",
    channel: "Push",
    lock: false,
  },
  {
    key: "plan_expiring",
    title: "Plan expiring",
    desc: "3 days before your annual plan renews.",
    channel: "Email",
    lock: true,
  },
  {
    key: "payment_failed",
    title: "Payment failed",
    desc: "A Stripe renewal payment was declined.",
    channel: "Email + Push",
    lock: true,
  },
];

const CLIENT_NOTIF_DEFS = [
  {
    key: "client_appointment_reminder",
    title: "Appointment reminder",
    desc: "Sent 24 hours before the signing. Includes date, time, and address.",
    channel: "Email",
  },
  {
    key: "client_invoice",
    title: "Invoice email",
    desc: 'Sent when you tap "Send invoice" on a completed job.',
    channel: "Email",
  },
  {
    key: "client_booking_confirmation",
    title: "Booking confirmation",
    desc: "Sent to clients when a booking page request is confirmed.",
    channel: "Email",
  },
];

const DEFAULT_NOTIF_PREFS: Record<string, boolean> = {
  ...Object.fromEntries(NOTIF_DEFS.map((n) => [n.key, true])),
  ...Object.fromEntries(CLIENT_NOTIF_DEFS.map((n) => [n.key, true])),
};

export default function NotificationsTab() {
  const { user } = useAuth();
  const { addToast } = useUIStore();

  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() => {
    const stored = (user?.settings as { notification_prefs?: Record<string, boolean> } | null)
      ?.notification_prefs;
    return { ...DEFAULT_NOTIF_PREFS, ...(stored ?? {}) };
  });

  const saveNotifPrefs = async () => {
    try {
      await usersApi.updateSettings({ notificationPrefs: notifPrefs });
      addToast({ type: "success", title: "Notification preferences saved" });
    } catch {
      addToast({ type: "error", title: "Could not save notification preferences" });
    }
  };

  const toggle = (key: string) =>
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <>
      <div className="alert al-blue mb-3.5">
        <span className="text-blue flex-shrink-0 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg></span>
        <div className="font-inter text-[11px] leading-[1.4]">Payment failure and plan expiry notifications are always sent, they cannot be disabled. All others are optional.</div>
      </div>
      <div className="card p-4 mb-4">
        <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><Bell className="w-4 h-4" /> Your notifications</div>
        {NOTIF_DEFS.map((n) => (
          <div key={n.key} className="flex justify-between gap-3 py-2.5 border-b border-border">
            <div className="flex-1 min-w-[180px]">
              <div className="font-inter text-[12px] font-semibold text-navy">{n.title}{n.lock ? <span className="font-inter text-[9px] text-muted font-normal ml-1">Always on</span> : null}</div>
              <div className="font-inter text-[11px] text-slate-secondary leading-[1.3] mt-0.5">{n.desc}</div>
              <div className="mt-1"><span className="font-inter text-[9px] font-semibold text-muted bg-background border border-border rounded-[4px] px-1.5 py-0.5">{n.channel}</span></div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => { if (!n.lock) toggle(n.key); }}
                className="w-[38px] h-5 rounded-full relative"
                style={{ background: notifPrefs[n.key] ? "var(--navy)" : "var(--border)", opacity: n.lock ? 0.5 : 1 }}
              >
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5" style={{ left: notifPrefs[n.key] ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-4 mb-4">
        <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><Mail className="w-4 h-4" /> Client notifications</div>
        <p className="font-inter text-[11px] text-slate-secondary mb-2.5 leading-[1.4]">These go to your clients automatically. Disabling them affects your clients&apos; experience.</p>
        {CLIENT_NOTIF_DEFS.map((n) => (
          <div key={n.key} className="flex justify-between gap-3 py-2.5 border-b border-border">
            <div className="flex-1 min-w-[180px]">
              <div className="font-inter text-[12px] font-semibold text-navy">{n.title}</div>
              <div className="font-inter text-[11px] text-slate-secondary leading-[1.3] mt-0.5">{n.desc}</div>
              <div className="mt-1"><span className="font-inter text-[9px] font-semibold text-muted bg-background border border-border rounded-[4px] px-1.5 py-0.5">{n.channel}</span></div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => toggle(n.key)}
                className="w-[38px] h-5 rounded-full relative"
                style={{ background: notifPrefs[n.key] ? "var(--navy)" : "var(--border)" }}
              >
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5" style={{ left: notifPrefs[n.key] ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-3"><button onClick={saveNotifPrefs} className="btn-p" style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}><Check className="w-4 h-4" /> Save preferences</button></div>
    </>
  );
}