"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { Copy, Check, Link2 } from "lucide-react";
import { cn, unwrap, getBookingUrl } from "@/lib/utils";
import api from "@/lib/api";
import {
  BOOKING_SERVICE_LIST,
  buildBookingPageServices,
  normalizeBookingServices,
  from24h,
  to24h,
} from "@/lib/booking";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_TIMES = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];
const END_TIMES = [
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

interface DayHours {
  start: string;
  end: string;
  enabled: boolean;
}

export default function BookingSetupForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [bio, setBio] = useState("");
  const [services, setServices] = useState<string[]>([
    "General Notary",
    "Loan Refi",
    "Hybrid Signing",
  ]);
  const [hours, setHours] = useState<Record<string, DayHours>>({
    Mon: { start: "8:00 AM", end: "7:00 PM", enabled: true },
    Tue: { start: "8:00 AM", end: "7:00 PM", enabled: true },
    Wed: { start: "8:00 AM", end: "7:00 PM", enabled: true },
    Thu: { start: "8:00 AM", end: "7:00 PM", enabled: true },
    Fri: { start: "8:00 AM", end: "7:00 PM", enabled: true },
    Sat: { start: "9:00 AM", end: "4:00 PM", enabled: true },
    Sun: { start: "", end: "", enabled: false },
  });
  const [minNotice, setMinNotice] = useState(2);
  const [advanceLimit, setAdvanceLimit] = useState(30);
  const [bufferMins, setBufferMins] = useState(30);
  const [serviceAreaMiles, setServiceAreaMiles] = useState(30);

  useEffect(() => {
    api
      .get("/users/settings")
      .then((res) => {
        const s = unwrap<Record<string, unknown>>(res);
        if (typeof s?.booking_page_enabled === "boolean")
          setEnabled(s.booking_page_enabled);
        if (typeof s?.booking_page_bio === "string") setBio(s.booking_page_bio);
        if (Array.isArray(s?.booking_page_services) && s.booking_page_services.length) {
          setServices(
            normalizeBookingServices(s.booking_page_services).map((x) => x.name),
          );
        }
        if (s?.booking_page_active_hours) {
          const h: Record<string, DayHours> = {};
          for (const [day, v] of Object.entries(
            s.booking_page_active_hours as Record<string, { start?: string; end?: string }>,
          )) {
            h[day] = {
              start: v.start ? from24h(v.start) : "",
              end: v.end ? from24h(v.end) : "",
              enabled: !!(v.start && v.end),
            };
          }
          setHours((prev) => ({ ...prev, ...h }));
        }
        if (typeof s?.booking_min_notice_hours === "number")
          setMinNotice(s.booking_min_notice_hours);
        if (typeof s?.booking_advance_limit_days === "number")
          setAdvanceLimit(s.booking_advance_limit_days);
        if (typeof s?.booking_buffer_mins === "number")
          setBufferMins(s.booking_buffer_mins);
        if (typeof s?.service_area_miles === "number")
          setServiceAreaMiles(s.service_area_miles);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await api.patch("/users/settings", {
        bookingPageEnabled: enabled,
        bookingPageBio: bio,
        booking_page_services: buildBookingPageServices(services),
        booking_page_active_hours: Object.fromEntries(
          DAYS.filter((d) => hours[d].enabled).map((d) => [
            d,
            { start: to24h(hours[d].start), end: to24h(hours[d].end) },
          ]),
        ),
        booking_min_notice_hours: minNotice,
        booking_advance_limit_days: advanceLimit,
        bookingBufferMins: bufferMins,
        serviceAreaMiles,
      });
      addToast({ type: "success", title: "Booking page settings saved" });
    } catch {
      addToast({ type: "error", title: "Failed to save" });
    }
  };

  const bookingUrl = getBookingUrl(user?.username);

  if (loading) {
    return (
      <div className="card p-4 mb-4 flex justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="card p-4 mb-4">
      <div className="flex justify-between gap-2 flex-wrap mb-3">
        <div className="flex-1 min-w-[200px]">
          <div className={cn("flex items-center gap-1.5 mb-1.5", enabled ? "font-semibold text-teal-success" : "font-semibold text-muted")}>
            {enabled ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5" />} {enabled ? "Your booking page is live" : "Booking page is off"}
          </div>
          <div className="font-mono text-[12px] text-navy break-words">{bookingUrl}</div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            className="btn-sm"
            style={{ borderColor: "var(--teal-b)", color: "var(--teal)" }}
            onClick={() => {
              navigator.clipboard.writeText(bookingUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
          </button>
          <button
            className="btn-sm"
            style={{ background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" }}
            onClick={() => router.push("/bookings/preview")}
          >
            <Link2 className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-[8px] border border-border mb-3">
        <div>
          <div className="font-inter text-[12px] font-semibold text-navy">Accept bookings</div>
          <div className="font-inter text-[11px] text-slate-secondary">
            Turn your public page on or off. Turning it off hides all booking times.
          </div>
        </div>
        <div
          className="w-[38px] h-[20px] rounded-full relative flex-shrink-0 cursor-pointer"
          style={{ background: enabled ? "var(--navy)" : "var(--border)" }}
          onClick={() => setEnabled((e) => !e)}
        >
          <div
            className="w-4 h-4 bg-white rounded-full absolute top-0.5"
            style={{ left: enabled ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }}
          />
        </div>
      </div>

      <span className="slbl">Services you accept</span>
      <div className="flex gap-1.5 flex-wrap mb-3.5">
        {BOOKING_SERVICE_LIST.map((s) => (
          <div
            key={s.signing_type}
            className={cn("tpill", services.includes(s.name) && "on")}
            onClick={() =>
              setServices((prev) =>
                prev.includes(s.name) ? prev.filter((x) => x !== s.name) : [...prev, s.name],
              )
            }
          >
            {s.name}
          </div>
        ))}
      </div>

      <span className="slbl">Short bio</span>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="NNA Certified Signing Agent serving your area. 5+ years experience."
        className="w-full min-h-[64px] border border-border rounded-[8px] p-2.5 font-inter text-[12px] text-slate resize-none mb-3.5"
      />

      <span className="slbl">Working hours</span>
      <div className="border border-border rounded-[10px] overflow-hidden mb-3.5">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-2 p-2 border-b border-border flex-wrap">
            <span className="font-inter text-[11px] font-medium text-navy w-9 flex-shrink-0">{day}</span>
            <div
              className="w-[34px] h-[18px] rounded-full relative flex-shrink-0 cursor-pointer"
              style={{ background: hours[day].enabled ? "var(--navy)" : "var(--border)" }}
              onClick={() =>
                setHours((h) => ({
                  ...h,
                  [day]: { ...h[day], enabled: !h[day].enabled },
                }))
              }
            >
              <div
                className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5"
                style={{ left: hours[day].enabled ? 18 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.2)" }}
              />
            </div>
            {hours[day].enabled ? (
              <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                <select
                  className="h-8 border border-border rounded-[6px] px-1.5 font-inter text-[11px] text-navy flex-1 min-w-[80px]"
                  value={hours[day].start}
                  onChange={(e) =>
                    setHours((h) => ({ ...h, [day]: { ...h[day], start: e.target.value } }))
                  }
                >
                  {START_TIMES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <span className="font-inter text-[10px] text-slate-secondary">to</span>
                <select
                  className="h-8 border border-border rounded-[6px] px-1.5 font-inter text-[11px] text-navy flex-1 min-w-[80px]"
                  value={hours[day].end}
                  onChange={(e) =>
                    setHours((h) => ({ ...h, [day]: { ...h[day], end: e.target.value } }))
                  }
                >
                  {END_TIMES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
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
            <input
              className="inp"
              style={{ width: 56, textAlign: "center" }}
              value={minNotice}
              onChange={(e) => setMinNotice(Number(e.target.value))}
            />
            <span className="font-inter text-[11px] text-slate-secondary">hours</span>
          </div>
          <span className="hint">Clients cannot book within this window</span>
        </div>
        <div className="field">
          <label className="lbl">Advance limit</label>
          <div className="flex gap-1.5 items-center">
            <input
              className="inp"
              style={{ width: 56, textAlign: "center" }}
              value={advanceLimit}
              onChange={(e) => setAdvanceLimit(Number(e.target.value))}
            />
            <span className="font-inter text-[11px] text-slate-secondary">days</span>
          </div>
          <span className="hint">Clients can book up to this many days ahead</span>
        </div>
        <div className="field">
          <label className="lbl">Buffer between bookings</label>
          <div className="flex gap-1.5 items-center">
            <input
              className="inp"
              style={{ width: 56, textAlign: "center" }}
              value={bufferMins}
              onChange={(e) => setBufferMins(Number(e.target.value))}
            />
            <span className="font-inter text-[11px] text-slate-secondary">min</span>
          </div>
        </div>
        <div className="field">
          <label className="lbl">Service area</label>
          <div className="flex gap-1.5 items-center">
            <input
              className="inp"
              style={{ width: 56, textAlign: "center" }}
              value={serviceAreaMiles}
              onChange={(e) => setServiceAreaMiles(Number(e.target.value))}
            />
            <span className="font-inter text-[11px] text-slate-secondary">miles</span>
          </div>
        </div>
      </div>

      <div className="alert al-blue mb-3.5">
        <span className="text-blue flex-shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </span>
        <div className="font-inter text-[11px] leading-[1.4]">
          Availability is checked in real time, including existing jobs, scanback windows,
          and drive time. Clients only see slots that genuinely work.
        </div>
      </div>

      <button className="btn-p" onClick={handleSave}>
        Save booking page settings
      </button>
    </div>
  );
}