"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

const NOTIFS = [
  ["Pre-signing reminder", "30 minutes before each signing.", "Push + SMS"],
  ["Scanback reminder", "Fires when you mark a Loan Refi or Hybrid complete.", "Push"],
  ["New booking received", "A client submitted a request through your booking page.", "Push"],
  ["Job imported", "An email was forwarded and parsed successfully.", "Push"],
  ["Payment received", "A client has paid an invoice via Stripe.", "Push"],
  ["Plan expiring", "3 days before your annual plan renews.", "Email", true],
  ["Payment failed", "A Stripe renewal payment was declined.", "Email + Push", true],
];

const CLIENT_NOTIFS = [
  ["Appointment reminder", "Sent 24 hours before the signing.", "Email"],
  ["Invoice email", "Sent when you tap Send invoice.", "Email"],
  ["Booking confirmation", "Sent to clients when a booking page request is confirmed.", "Email"],
];

export default function NotificationsSettingsPage() {
  const { addToast } = useUIStore();
  const [prefs, setPrefs] = useState<boolean[]>(NOTIFS.map(() => true));
  const [clientPrefs, setClientPrefs] = useState<boolean[]>(CLIENT_NOTIFS.map(() => true));

  const toggle = (i: number) => {
    const next = [...prefs];
    next[i] = !next[i];
    setPrefs(next);
  };
  const toggleClient = (i: number) => {
    const next = [...clientPrefs];
    next[i] = !next[i];
    setClientPrefs(next);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Notifications</div>
      </div>

      <div className="con">
        <div className="alert al-blue mb-3.5">
          <span className="text-blue flex-shrink-0 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg></span>
          <div className="font-inter text-[11px] leading-[1.4]">Payment failure and plan expiry notifications are always sent, they cannot be disabled. All others are optional.</div>
        </div>

        <div className="card p-4 mb-4">
          <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><Bell className="w-4 h-4" /> Your notifications</div>
          {NOTIFS.map(([title, desc, ch, lock], i) => (
            <div key={String(title)} className="flex justify-between gap-3 py-2.5 border-b border-border">
              <div className="flex-1 min-w-[180px]">
                <div className="font-inter text-[12px] font-semibold text-navy">{title as string}{lock ? <span className="font-inter text-[9px] text-muted font-normal ml-1">Always on</span> : null}</div>
                <div className="font-inter text-[11px] text-slate-secondary leading-[1.3] mt-0.5">{desc as string}</div>
                <div className="mt-1"><span className="font-inter text-[9px] font-semibold text-muted bg-background border border-border rounded-[4px] px-1.5 py-0.5">{ch as string}</span></div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => { if (!lock) toggle(i); }}
                  className="w-[38px] h-5 rounded-full relative"
                  style={{ background: prefs[i] ? "var(--navy)" : "var(--border)", opacity: lock ? 0.5 : 1 }}
                >
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5" style={{ left: prefs[i] ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-3"><button onClick={() => addToast({ type: "success", title: "Notification preferences saved" })} className="btn-p" style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}><Check className="w-4 h-4" /> Save preferences</button></div>
        </div>

        <div className="card p-4 mb-4">
          <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg> Client notifications</div>
          <p className="font-inter text-[11px] text-slate-secondary mb-2.5 leading-[1.4]">These go to your clients automatically. Disabling them affects your clients experience.</p>
          {CLIENT_NOTIFS.map(([title, desc, ch], i) => (
            <div key={String(title)} className="flex justify-between gap-3 py-2.5 border-b border-border">
              <div className="flex-1 min-w-[180px]">
                <div className="font-inter text-[12px] font-semibold text-navy">{title as string}</div>
                <div className="font-inter text-[11px] text-slate-secondary leading-[1.3] mt-0.5">{desc as string}</div>
                <div className="mt-1"><span className="font-inter text-[9px] font-semibold text-muted bg-background border border-border rounded-[4px] px-1.5 py-0.5">{ch as string}</span></div>
              </div>
              <div className="flex-shrink-0">
                <button onClick={() => toggleClient(i)} className="w-[38px] h-5 rounded-full relative" style={{ background: clientPrefs[i] ? "var(--navy)" : "var(--border)" }}>
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5" style={{ left: clientPrefs[i] ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
