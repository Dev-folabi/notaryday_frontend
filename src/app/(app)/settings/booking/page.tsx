"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { Copy, Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const SERVICES = ["General", "Loan Refi", "Hybrid", "Purchase Closing", "Field Inspection", "Apostille"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BookingSettingsPage() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [services, setServices] = useState<string[]>(["General", "Loan Refi", "Hybrid"]);
  const [hours, setHours] = useState<Record<string, [string, string, boolean]>>({
    Mon: ["8:00 AM", "7:00 PM", true],
    Tue: ["8:00 AM", "7:00 PM", true],
    Wed: ["8:00 AM", "7:00 PM", true],
    Thu: ["8:00 AM", "7:00 PM", true],
    Fri: ["8:00 AM", "7:00 PM", true],
    Sat: ["9:00 AM", "4:00 PM", true],
    Sun: ["", "", false],
  });
  const [minNotice, setMinNotice] = useState(2);
  const [advanceLimit, setAdvanceLimit] = useState(30);

  useEffect(() => {
    api.get("/users/settings").then((res: any) => {
      const s = (res as any).data?.data ?? (res as any).data ?? res;
      if (s?.booking_page_services?.length) setServices(s.booking_page_services.map((x: any) => x.name));
      if (s?.booking_page_active_hours) {
        const h: Record<string, [string, string, boolean]> = {};
        for (const [day, v] of Object.entries(s.booking_page_active_hours)) {
          const val = v as any;
          h[day] = [val.start ?? "", val.end ?? "", true];
        }
        setHours((prev) => ({ ...prev, ...h }));
      }
      if (typeof s?.booking_min_notice_hours === "number") setMinNotice(s.booking_min_notice_hours);
      if (typeof s?.booking_advance_limit_days === "number") setAdvanceLimit(s.booking_advance_limit_days);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await api.patch("/users/settings", {
        booking_page_services: services,
        booking_page_active_hours: Object.fromEntries(
          DAYS.map((d) => [d, { start: hours[d][0], end: hours[d][1] }]),
        ),
        booking_min_notice_hours: minNotice,
        booking_advance_limit_days: advanceLimit,
      });
      addToast({ type: "success", title: "Booking page settings saved" });
    } catch {
      addToast({ type: "error", title: "Failed to save" });
    }
  };

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${user?.username}`;

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Booking page</div>
      </div>

      <div className="con">
        <div className="card p-4 mb-4">
          <div className="flex justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="font-inter text-[11px] font-semibold text-teal-success mb-1.5 flex gap-1.5 items-center"><Check className="w-3.5 h-3.5" /> Your booking page is live</div>
              <div className="font-mono text-[12px] text-navy break-words">{bookingUrl}</div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button className="btn-sm" style={{ borderColor: "var(--teal-b)", color: "var(--teal)" }} onClick={() => { navigator.clipboard.writeText(bookingUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
              <button className="btn-sm" style={{ background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" }} onClick={() => window.open(bookingUrl, "_blank")}>
                <Link2 className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
          </div>

          <span className="slbl mt-3">Services you accept</span>
          <div className="flex gap-1.5 flex-wrap mb-3.5">
            {SERVICES.map((t) => (
              <div
                key={t}
                className={cn("tpill", services.includes(t) && "on")}
                onClick={() =>
                  setServices((prev) =>
                    prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                  )
                }
              >
                {t}
              </div>
            ))}
          </div>

          <span className="slbl">Working hours</span>
          <div className="border border-border rounded-[10px] overflow-hidden mb-3.5">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-2 p-2 border-b border-border flex-wrap">
                <span className="font-inter text-[11px] font-medium text-navy w-9 flex-shrink-0">{day}</span>
                <div
                  className="w-[34px] h-[18px] rounded-full relative flex-shrink-0 cursor-pointer"
                  style={{ background: hours[day][2] ? "var(--navy)" : "var(--border)" }}
                  onClick={() => setHours((h) => ({ ...h, [day]: [h[day][0], h[day][1], !h[day][2]] }))}
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5" style={{ left: hours[day][2] ? 18 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                </div>
                {hours[day][2] ? (
                  <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                    <select className="h-8 border border-border rounded-[6px] px-1.5 font-inter text-[11px] text-navy flex-1 min-w-[80px]" value={hours[day][0]} onChange={(e) => setHours((h) => ({ ...h, [day]: [e.target.value, h[day][1], true] }))}>
                      {["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <span className="font-inter text-[10px] text-slate-secondary">to</span>
                    <select className="h-8 border border-border rounded-[6px] px-1.5 font-inter text-[11px] text-navy flex-1 min-w-[80px]" value={hours[day][1]} onChange={(e) => setHours((h) => ({ ...h, [day]: [h[day][0], e.target.value, true] }))}>
                      {["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="font-inter text-[11px] text-muted flex-1">Unavailable</span>
                )}
              </div>
            ))}
          </div>

          <span className="slbl">Booking rules</span>
          <div className="g2 mb-3.5">
            <div className="field">
              <label className="lbl">Minimum notice</label>
              <div className="flex gap-1.5 items-center">
                <input className="inp" style={{ width: 56, textAlign: "center" }} value={minNotice} onChange={(e) => setMinNotice(Number(e.target.value))} />
                <span className="font-inter text-[11px] text-slate-secondary">hours</span>
              </div>
              <span className="hint">Clients cannot book same day within this window</span>
            </div>
            <div className="field">
              <label className="lbl">Advance limit</label>
              <div className="flex gap-1.5 items-center">
                <input className="inp" style={{ width: 56, textAlign: "center" }} value={advanceLimit} onChange={(e) => setAdvanceLimit(Number(e.target.value))} />
                <span className="font-inter text-[11px] text-slate-secondary">days</span>
              </div>
              <span className="hint">Clients can book up to this many days ahead</span>
            </div>
          </div>

          <div className="alert al-blue mb-3.5">
            <span className="text-blue flex-shrink-0 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg></span>
            <div className="font-inter text-[11px] leading-[1.4]">Availability is checked in real time, including existing jobs, scanback windows, and drive time. Clients only see slots that genuinely work.</div>
          </div>

          <button className="btn-p" onClick={handleSave}>Save booking page settings</button>
        </div>
      </div>
    </div>
  );
}
