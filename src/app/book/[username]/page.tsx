"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Info,
  Ban,
  SearchX,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { unwrap, getInitials, errMsg } from "@/lib/utils";
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

type PhotonFeature = {
  properties: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function StateView({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-14px border border-border p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 rounded-full bg-bg border-2 border-border flex items-center justify-center mx-auto mb-4 text-slate-secondary">
          {icon}
        </div>
        <h1 className="font-sora font-bold text-xl text-primary-navy mb-2">
          {title}
        </h1>
        <p className="font-inter text-sm text-slate-secondary leading-[1.5]">
          {body}
        </p>
      </div>
    </div>
  );
}

export default function PublicBookingPage() {
  const { username } = useParams<{ username: string }>();
  const [date, setDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );
  const [serviceType, setServiceType] = useState<string>("GENERAL");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    address: "",
    notes: "",
  });

  // Address autocomplete (Photon) — same pattern as the job/CITT forms
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const addrWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        addrWrapRef.current &&
        !addrWrapRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = form.address;
    if (!q || q.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en&countrycode=us`,
        );
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        setSuggestions(json.features || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.address]);

  const handleSelectAddress = (feature: PhotonFeature) => {
    const { name, street, city, state, postcode } = feature.properties;
    const label = [name || street, city, state, postcode]
      .filter(Boolean)
      .join(", ");
    setForm((f) => ({ ...f, address: label }));
    setShowSuggestions(false);
  };

  const {
    data: slotsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["booking-page", username, date, serviceType],
    queryFn: async () =>
      unwrap<SlotData>(await bookingApi.getSlots(username, date, serviceType)),
    enabled: !!username && !!date,
    retry: false,
  });

  const submitBooking = useMutation({
    mutationFn: async () => {
      await bookingApi.create(username, {
        ...form,
        service_type: serviceType,
        requested_time: selectedSlot,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setSubmitError(null);
    },
    onError: (e) => setSubmitError(errMsg(e, "Could not submit your request")),
  });

  const notary = slotsData?.notary ?? null;

  const services = useMemo(() => {
    const normalized = normalizeBookingServices(notary?.services);
    return normalized.length > 0 ? normalized : BOOKING_SERVICE_LIST;
  }, [notary?.services]);

  const dayKey = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return DAY_KEYS[d.getDay()];
  }, [date]);

  const activeHours = useMemo(() => {
    const hours = notary?.active_hours ?? {};
    const lower: Record<string, { start?: string; end?: string }> = {};
    for (const [k, v] of Object.entries(hours)) lower[k.toLowerCase()] = v;
    return lower[dayKey];
  }, [notary?.active_hours, dayKey]);

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
    for (
      let t = start.getTime();
      t + 30 * 60_000 <= end.getTime();
      t += 30 * 60_000
    ) {
      const d = new Date(t);
      out.push({
        iso: d.toISOString(),
        label: format(d, "h:mm a"),
        available: available.has(d.toISOString()),
      });
    }
    return out;
  }, [activeHours, date, slotsData]);

  const errorStatus = (error as { statusCode?: number } | undefined)
    ?.statusCode;

  if (submitted) {
    return (
      <StateView
        icon={<CheckCircle2 className="w-8 h-8 text-teal-success" />}
        title="Appointment requested"
        body={`${notary?.full_name ?? "Your notary"} will review your request and confirm shortly. A confirmation email will be sent to ${form.client_email}.`}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    if (errorStatus === 404) {
      return (
        <StateView
          icon={<SearchX className="w-8 h-8" />}
          title="Notary not found"
          body={`We couldn't find a notary at notaryday.app/book/${username}. Check the link and try again.`}
        />
      );
    }
    if (errorStatus === 400) {
      return (
        <StateView
          icon={<Ban className="w-8 h-8" />}
          title="Bookings are currently unavailable"
          body="This notary isn't accepting online bookings right now. Please contact them directly."
        />
      );
    }
    return (
      <StateView
        icon={<Info className="w-8 h-8" />}
        title="Something went wrong"
        body="We couldn't load the booking page right now. Please try again in a moment."
      />
    );
  }

  if (notary === null) {
    return (
      <StateView
        icon={<Ban className="w-8 h-8" />}
        title="Bookings are paused"
        body="This notary isn't accepting online bookings at the moment. Please check back later or contact them directly."
      />
    );
  }

  const minNotice = notary?.min_notice_hours ?? 0;

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border bg-white px-4 py-3 flex justify-between items-center">
        <div className="font-sora font-bold text-sm text-primary-navy">
          Notary Day
        </div>
        <span className="text-[11px] text-slate-secondary">
          Scheduling powered by Notary Day
        </span>
      </div>

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
                {services.map((s) => (
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
              <div className="relative" ref={addrWrapRef}>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                <input
                  placeholder="Enter the signing location address"
                  autoComplete="off"
                  value={form.address}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setForm({ ...form, address: e.target.value });
                    setShowSuggestions(true);
                  }}
                  className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                />
                {showSuggestions &&
                  (suggestions.length > 0 || isSearching) && (
                    <ul
                      className="absolute left-0 right-0 z-20 bg-white border border-border rounded-8px shadow-lg max-h-60 overflow-y-auto"
                      style={{ marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}
                    >
                      {isSearching && suggestions.length === 0 && (
                        <li className="px-3 py-2.5 text-[11px] text-slate-secondary text-center">
                          Searching addresses…
                        </li>
                      )}
                      {suggestions.map((s, i) => {
                        const { name, street, city, state, postcode } =
                          s.properties;
                        const label = [name || street, city, state, postcode]
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <li
                            key={i}
                            onClick={() => handleSelectAddress(s)}
                            className="px-3 py-2 text-xs text-slate border-b border-border cursor-pointer hover:bg-bg"
                          >
                            {label}
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <div className="flex items-center h-11">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                  ) : timeGrid.length === 0 ? (
                    <span className="font-inter text-xs text-slate-secondary">
                      No available times
                    </span>
                  ) : (
                    <span className="font-inter text-sm font-semibold text-primary-navy">
                      {selectedSlot
                        ? format(new Date(selectedSlot), "h:mm a")
                        : "Pick a time"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
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
                      {t.available ? t.label : "Unavail"}
                    </button>
                  ))}
                </div>
              )}
              {timeGrid.length > 0 &&
                selectedSlot &&
                minNotice > 0 && (
                  <p className="font-inter text-[10px] text-muted mt-2">
                    Requested slot is {minNotice} hour
                    {minNotice > 1 ? "s" : ""} from now or later.
                  </p>
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
                Special notes
              </label>
              <textarea
                placeholder="Gate codes, accessibility needs"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full min-h-[70px] border border-border rounded-8px p-3 font-inter text-sm resize-none"
              />
            </div>

            {submitError && (
              <p className="font-inter text-xs text-red-danger">{submitError}</p>
            )}

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
