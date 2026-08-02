"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import {
  MapPin,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Clock,
  CalendarDays,
  FileText,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { unwrap, getInitials } from "@/lib/utils";
import { BOOKING_SERVICE_LIST, normalizeBookingServices } from "@/lib/booking";

type NotaryInfo = {
  full_name?: string | null;
  username?: string;
  bio?: string | null;
  service_area_miles?: number | null;
  services?: unknown;
  active_hours?: Record<string, { start?: string; end?: string }> | null;
  min_notice_hours?: number | null;
};

type SlotData = { slots: string[]; notary: NotaryInfo | null };

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default function PublicBookingPage() {
  const { username } = useParams<{ username: string }>();
  const [date, setDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );
  const [serviceType, setServiceType] = useState<string>("GENERAL");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    address: "",
    document_type: "",
    notes: "",
  });

  const { data: slotsData, isLoading } = useQuery({
    queryKey: ["booking-page", username, date, serviceType],
    queryFn: async () =>
      unwrap<SlotData>(await bookingApi.getSlots(username, date, serviceType)),
    enabled: !!username && !!date,
  });

  const submitBooking = useMutation({
    mutationFn: async () => {
      await bookingApi.create(username, {
        ...form,
        service_type: serviceType,
        requested_time: selectedSlot,
      });
    },
    onSuccess: () => setSubmitted(true),
    onError: () => setSubmitted(false),
  });

  const notary = slotsData?.notary ?? null;

  const services = useMemo(() => {
    const normalized = normalizeBookingServices(notary?.services);
    return normalized.length > 0 ? normalized : BOOKING_SERVICE_LIST;
  }, [notary?.services]);

  const serviceOptions = useMemo(
    () => (serviceType === "GENERAL" && services.length ? services : services),
    [services, serviceType],
  );

  const dayKey = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return DAY_KEYS[d.getDay()];
  }, [date]);

  const activeHours = notary?.active_hours?.[dayKey];

  const timeGrid = useMemo(() => {
    if (!activeHours?.start || !activeHours?.end) return [];
    const [sh, sm] = activeHours.start.split(":").map(Number);
    const [eh, em] = activeHours.end.split(":").map(Number);
    const base = new Date(`${date}T00:00:00`);
    const start = new Date(base);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(base);
    end.setHours(eh, em, 0, 0);
    const available = new Set(slotsData?.slots ?? []);
    const out: { iso: string; label: string; available: boolean }[] = [];
    for (let t = start.getTime(); t + 30 * 60_000 <= end.getTime(); t += 30 * 60_000) {
      const d = new Date(t);
      out.push({
        iso: d.toISOString(),
        label: format(d, "h:mm a"),
        available: available.has(d.toISOString()),
      });
    }
    return out;
  }, [activeHours, date, slotsData]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-14px border border-border p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-teal-bg border-2 border-teal-b flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-teal-success" />
          </div>
          <h1 className="font-sora font-bold text-xl text-primary-navy mb-2">
            Appointment requested
          </h1>
          <p className="font-inter text-sm text-slate-secondary">
            {notary?.full_name ?? "Your notary"} will review your request and
            confirm shortly. A confirmation email will be sent to{" "}
            <span className="font-semibold text-navy">{form.client_email}</span>.
          </p>
        </div>
      </div>
    );
  }

  const minNotice = notary?.min_notice_hours ?? 0;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto md:flex md:min-h-screen">
        {/* Notary profile sidebar */}
        <div className="md:w-[320px] md:flex-shrink-0 md:border-r md:border-border bg-white px-5 py-6 md:min-h-screen">
          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-navy text-white text-lg font-bold flex items-center justify-center font-sora flex-shrink-0">
              {getInitials(notary?.full_name ?? notary?.username)}
            </div>
            <div>
              <div className="font-sora font-bold text-[15px] text-primary-navy">
                {notary?.full_name ?? "Notary"}
              </div>
              <div className="font-inter text-[11px] text-slate-secondary">
                NNA Certified Signing Agent
              </div>
            </div>
          </div>
          {notary?.bio && (
            <p className="font-inter text-xs text-slate leading-[1.5] mb-4">
              {notary.bio}
            </p>
          )}

          <div className="h-px bg-border my-4" />
          <div className="font-inter text-[11px] font-semibold text-slate-secondary uppercase tracking-wide mb-2">
            Services offered
          </div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {services.map((s) => (
              <span
                key={s.signing_type}
                className="bg-bg border border-border rounded-[6px] px-2 py-1 text-[11px] font-medium text-slate"
              >
                {s.name}
              </span>
            ))}
          </div>

          <div className="h-px bg-border my-4" />
          <div className="font-inter text-[11px] text-slate-secondary leading-[1.6] space-y-1.5">
            <div className="flex gap-1.5 items-center">
              <Clock className="w-3.5 h-3.5 text-slate-secondary" />
              {activeHours?.start && activeHours?.end
                ? `${format(new Date(`${date}T${activeHours.start}`), "h:mm a")} – ${format(new Date(`${date}T${activeHours.end}`), "h:mm a")}`
                : "Hours vary by day"}
            </div>
            {minNotice > 0 && (
              <div className="flex gap-1.5 items-center">
                <CalendarDays className="w-3.5 h-3.5 text-slate-secondary" />
                Minimum {minNotice} hour{minNotice > 1 ? "s" : ""} notice
              </div>
            )}
          </div>
        </div>

        {/* Booking form */}
        <div className="flex-1 px-5 py-6 md:py-10">
          <h1 className="font-sora font-bold text-lg text-primary-navy mb-1">
            Request a signing
          </h1>
          <p className="font-inter text-xs text-slate-secondary mb-5">
            Fill in your details and {notary?.full_name ?? "the notary"} will
            confirm your appointment.
          </p>

          <div className="flex flex-col gap-3 max-w-md">
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-slate-body">
                Type of signing <span className="text-red-danger">*</span>
              </label>
              <select
                value={serviceType}
                onChange={(e) => {
                  setServiceType(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full h-11 border border-border rounded-8px px-3 font-inter text-sm bg-white"
              >
                {serviceOptions.map((s) => (
                  <option key={s.signing_type} value={s.signing_type}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-slate-body">
                Signing address <span className="text-red-danger">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                <input
                  placeholder="Enter the signing location address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-slate-body">
                Preferred date <span className="text-red-danger">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot(null);
                }}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full h-11 border border-border rounded-8px px-3 font-inter text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-slate-body">
                Preferred time <span className="text-red-danger">*</span>
              </label>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                </div>
              ) : timeGrid.length === 0 ? (
                <div className="bg-white border border-border rounded-12px p-4 text-center">
                  <p className="font-inter text-xs text-slate-secondary">
                    No available times for this date. Try another day.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeGrid.map((t) => (
                    <button
                      key={t.iso}
                      disabled={!t.available}
                      onClick={() => setSelectedSlot(t.iso)}
                      className={`h-10 rounded-8px text-xs font-semibold border transition-colors ${
                        t.available
                          ? selectedSlot === t.iso
                            ? "border-primary-navy bg-primary-navy text-white"
                            : "border-border bg-white text-primary-navy hover:border-slate-secondary cursor-pointer"
                          : "bg-background text-muted cursor-default"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-slate-body">
                Your name <span className="text-red-danger">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                <input
                  placeholder="Full name"
                  value={form.client_name}
                  onChange={(e) =>
                    setForm({ ...form, client_name: e.target.value })
                  }
                  className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-slate-body">
                  Email address <span className="text-red-danger">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                  <input
                    placeholder="you@example.com"
                    type="email"
                    value={form.client_email}
                    onChange={(e) =>
                      setForm({ ...form, client_email: e.target.value })
                    }
                    className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-slate-body">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                  <input
                    placeholder="Optional"
                    value={form.client_phone}
                    onChange={(e) =>
                      setForm({ ...form, client_phone: e.target.value })
                    }
                    className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-slate-body">
                Document type
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                <input
                  placeholder="e.g. Deed of Trust (optional)"
                  value={form.document_type}
                  onChange={(e) =>
                    setForm({ ...form, document_type: e.target.value })
                  }
                  className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-slate-body">
                Special notes
              </label>
              <textarea
                placeholder="Gate codes, accessibility needs"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full min-h-[70px] border border-border rounded-8px p-3 font-inter text-sm resize-none"
              />
            </div>

            <button
              onClick={() => submitBooking.mutate()}
              disabled={
                !form.client_name ||
                !form.client_email ||
                !form.address ||
                !selectedSlot ||
                submitBooking.isPending
              }
              className="w-full h-11 bg-primary-navy text-white rounded-8px font-inter font-semibold text-sm disabled:opacity-50"
            >
              {submitBooking.isPending
                ? "Submitting..."
                : "Request appointment"}
            </button>
            <p className="font-inter text-[10px] text-muted text-center">
              Your request is checked against the notary&apos;s live schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
