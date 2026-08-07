"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
  X,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { unwrap, getInitials, errMsg } from "@/lib/utils";
import { BOOKING_SERVICE_LIST, normalizeBookingServices, from24h } from "@/lib/booking";

type NotaryInfo = {
  full_name?: string | null;
  username?: string;
  bio?: string | null;
  service_area_miles?: number | null;
  services?: unknown;
  active_hours?: Record<string, { start?: string; end?: string }> | null;
  min_notice_hours?: number | null;
  timezone?: string | null;
  timezone_abbr?: string | null;
};

type Slot = { time: string; iso: string };
type SlotData = { slots: Slot[]; notary: NotaryInfo | null };

type AlternativeSlot = {
  time: string;
  iso: string;
  duration_mins: number;
  note: string;
};

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
  const queryClient = useQueryClient();
  const [date, setDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );
  const [serviceType, setServiceType] = useState<string>("GENERAL");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [altOpen, setAltOpen] = useState(false);
  const [altLoading, setAltLoading] = useState(false);
  const [alts, setAlts] = useState<AlternativeSlot[]>([]);
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
    placeholderData: keepPreviousData,
    // Slots are live (they change the moment someone books), so never serve a
    // cached date without refetching — switching back to a date must be fresh.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const submitBooking = useMutation({
    mutationFn: async (slotOverride?: string) => {
      const booking = await bookingApi.create(username, {
        ...form,
        service_type: serviceType,
        requested_time: slotOverride ?? selectedSlot,
      });
      return unwrap<{ ref?: string | null }>(booking);
    },
    onSuccess: (data) => {
      setBookingRef(data.ref ?? null);
      setAltOpen(false);
      setSubmitted(true);
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ["booking-page", username] });
    },
    onError: (e) => {
      const code = (e as { code?: string })?.code;
      if (code === "SLOT_CONFLICT") {
        setSubmitError(null);
        void loadAlternatives();
      } else {
        setSubmitError(errMsg(e, "Could not submit your request"));
      }
    },
  });

  const resetForm = () => {
    setForm({ client_name: "", client_email: "", client_phone: "", address: "", notes: "" });
    setSelectedSlot(null);
    setBookingRef(null);
  };

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
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const service = services.find((s) => s.signing_type === serviceType);
    const totalBlock = (service?.duration_mins ?? 30) + (service?.scanback_mins ?? 0);
    const availMap = new Map((slotsData?.slots ?? []).map((s) => [s.time, s]));
    const out: { time: string; iso: string; label: string; available: boolean }[] =
      [];
    for (let m = startMin; m + totalBlock <= endMin; m += 30) {
      const time = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
        m % 60,
      ).padStart(2, "0")}`;
      const matched = availMap.get(time);
      out.push({
        time,
        iso: matched?.iso ?? "",
        label: from24h(time),
        available: !!matched,
      });
    }
    return out;
  }, [activeHours, services, serviceType, slotsData]);

  async function loadAlternatives() {
    setAltOpen(true);
    setAltLoading(true);
    const sel = timeGrid.find((t) => t.iso === selectedSlot);
    try {
      const res = await bookingApi.alternatives(
        username,
        date,
        sel?.time ?? "",
        serviceType,
      );
      setAlts(unwrap<{ slots: AlternativeSlot[] }>(res).slots);
    } catch {
      setAlts([]);
    } finally {
      setAltLoading(false);
    }
  }

  const selectedSlotLabel =
    timeGrid.find((t) => t.iso === selectedSlot)?.label ?? "";

  const selectedServiceName =
    services.find((s) => s.signing_type === serviceType)?.name ?? "";

  const errorStatus = (error as { statusCode?: number } | undefined)
    ?.statusCode;

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-[14px] border border-border shadow-lg w-full max-w-md">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-success/10 text-teal-success flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-sora font-bold text-[15px] text-primary-navy">
                  Appointment requested
                </div>
                <div className="font-inter text-[11px] text-slate-secondary">
                  {notary?.full_name ?? "Your notary"} will confirm your appointment shortly.
                </div>
              </div>
            </div>

            <div className="border border-border rounded-[10px] p-3 mb-3">
              <div className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide mb-1.5">
                Your booking
              </div>
              {[
                ["Notary", `${notary?.full_name ?? "Notary"}, NNA Certified Loan Signing Agent`],
                ["Service", selectedServiceName],
                ["Date", format(new Date(`${date}T00:00:00`), "EEEE, MMMM d, yyyy")],
                ["Time", selectedSlotLabel + (notary?.timezone_abbr ? ` (${notary.timezone_abbr})` : "")],
                ["Address", form.address],
                ["Client", form.client_name],
                ["Booking ref", bookingRef ?? "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex gap-2.5 py-1.5 border-b border-border last:border-b-0"
                >
                  <span className="font-inter text-[11px] text-slate-secondary font-medium w-20 flex-shrink-0">
                    {label}
                  </span>
                  <span className="font-inter text-[11px] text-primary-navy font-semibold flex-1 break-words">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-background rounded-[8px] px-3 py-2.5 text-center mb-3">
              <p className="font-inter text-[11px] text-slate-secondary leading-[1.5]">
                The notary will review your request and confirm by email. You can
                track it with booking ref{" "}
                <span className="font-semibold text-primary-navy">{bookingRef ?? "—"}</span>.
              </p>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                resetForm();
              }}
              className="btn-p w-full"
            >
              Done
            </button>
          </div>
        </div>
      </div>
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
                NNA Certified Loan Signing Agent
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
          confirm your appointment automatically.
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
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-slate-body">
                  Preferred time <span className="text-red-danger">*</span>
                </label>
                {isLoading ? (
                  <div className="flex items-center justify-center h-11">
                    <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                  </div>
                ) : timeGrid.length === 0 ? (
                  <div className="flex items-center h-11">
                    <span className="font-inter text-xs text-slate-secondary">
                      No available times
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {timeGrid.map((t) => (
                      <button
                        key={t.time}
                        disabled={!t.available}
                        onClick={() => setSelectedSlot(t.iso)}
                        className={`h-9 rounded-8px text-[11px] font-semibold border transition-colors ${
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
              </div>
            </div>

            {timeGrid.length > 0 && selectedSlot && minNotice > 0 && (
              <p className="font-inter text-[10px] text-muted">
                Requested slot is {minNotice} hour
                {minNotice > 1 ? "s" : ""} from now or later.
              </p>
            )}

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
              onClick={() => submitBooking.mutate(undefined)}
              disabled={
                !form.client_name ||
                !form.client_email ||
                !form.address ||
                !selectedSlot ||
                submitBooking.isPending
              }
              className="w-full h-11 bg-primary-navy text-white rounded-8px font-inter font-semibold text-sm disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {submitBooking.isPending ? (
                "Submitting..."
              ) : (
                <>
                  Request appointment <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
            <p className="font-inter text-[10px] text-muted text-center">
              Your request is checked against the notary&apos;s live schedule.
            </p>
          </div>
        </div>
      </div>

      {altOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[14px] w-full max-w-md relative">
            <button
              onClick={() => setAltOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg text-slate-secondary hover:text-primary-navy"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-5 pt-8">
              <div className="text-center mb-4">
                <div className="w-[52px] h-[52px] rounded-full border-2 flex items-center justify-center mx-auto mb-2.5 text-amber-warning"
                  style={{ background: "var(--amber-bg)", borderColor: "var(--amber-b)" }}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="font-sora font-bold text-[16px] text-primary-navy mb-1">
                  That time is not available
                </div>
                <div className="font-inter text-[12px] text-slate-secondary leading-[1.5]">
                  {notary?.full_name ?? "The notary"} has another commitment at{" "}
                  {selectedSlotLabel || "that time"} on{" "}
                  {format(new Date(`${date}T00:00:00`), "EEEE, MMMM d")}. Here are
                  the next available slots:
                </div>
              </div>

              {altLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                </div>
              ) : alts.length === 0 ? (
                <div className="text-center py-5 font-inter text-[12px] text-muted">
                  No alternatives right now. Please try another day.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {alts.map((a) => (
                    <div
                      key={a.iso}
                      className="bg-white border-[1.5px] border-border rounded-[10px] p-3 flex justify-between gap-2 items-center flex-wrap"
                    >
                      <div>
                        <div className="font-inter text-[12px] font-semibold text-primary-navy">
                          {format(new Date(a.iso), "EEEE, MMMM d")} ·{" "}
                          {from24h(a.time)}
                        </div>
                        <div className="font-inter text-[11px] text-slate-secondary">
                          ~{a.duration_mins} min · {a.note}
                        </div>
                      </div>
                      <button
                        onClick={() => submitBooking.mutate(a.iso)}
                        disabled={submitBooking.isPending}
                        className="h-9 px-3.5 rounded-[7px] bg-primary-navy text-white font-inter text-[11px] font-semibold disabled:opacity-50 whitespace-nowrap"
                      >
                        {submitBooking.isPending ? "Booking..." : "Book this"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 text-center">
                <button
                  onClick={() => setAltOpen(false)}
                  className="btn-gh"
                  style={{ height: 36 }}
                >
                  Cancel, I will contact the notary directly
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
