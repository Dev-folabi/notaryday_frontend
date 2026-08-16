"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { LOGO_URL } from "@/lib/logo";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import {
  MapPin,
  Check,
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
  DollarSign,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { unwrap, getInitials, errMsg } from "@/lib/utils";
import {
  BOOKING_SERVICE_LIST,
  normalizeBookingServices,
  from24h,
} from "@/lib/booking";

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
const DAY_LABELS: Record<string, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

function PublicHeader() {
  return (
    <div className="bg-white border-b border-border px-4 py-3 md:px-7 md:py-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <Image
          src={LOGO_URL}
          alt="Notary Day"
          width={28}
          height={28}
          unoptimized
        />
        <div className="font-sora font-bold text-[15px] text-primary-navy">
          Notary Day
        </div>
      </div>
      <span className="text-xs text-slate-secondary">
        Scheduling powered by Notary Day
      </span>
    </div>
  );
}

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
    <div className="min-h-screen bg-bg flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-[14px] border border-border p-8 text-center max-w-md w-full">
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
    document_type: "",
    base_fee: "",
  });

  // Address autocomplete (Photon), same pattern as the job/CITT forms
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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const submitBooking = useMutation({
    mutationFn: async (slotOverride?: string) => {
      const booking = await bookingApi.create(username, {
        ...form,
        service_type: serviceType,
        requested_time: slotOverride ?? selectedSlot,
        base_fee: feeValue,
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
    setForm({
      client_name: "",
      client_email: "",
      client_phone: "",
      address: "",
      notes: "",
      document_type: "",
      base_fee: "",
    });
    setSelectedSlot(null);
    setBookingRef(null);
  };

  const notary = slotsData?.notary ?? null;

  const services = useMemo(() => {
    const normalized = normalizeBookingServices(notary?.services);
    return normalized.length > 0 ? normalized : BOOKING_SERVICE_LIST;
  }, [notary?.services]);

  const feeValue = Number(form.base_fee);
  const feeValid = Number.isFinite(feeValue) && feeValue > 0;

  const slots = useMemo(() => slotsData?.slots ?? [], [slotsData]);

  const selectedSlotLabel = useMemo(() => {
    const s = slots.find((t) => t.iso === selectedSlot);
    return s ? from24h(s.time) : "";
  }, [slots, selectedSlot]);

  const selectedSlotTime = useMemo(() => {
    const s = slots.find((t) => t.iso === selectedSlot);
    return s?.time ?? "";
  }, [slots, selectedSlot]);

  const weekSummary = useMemo(() => {
    const hours = notary?.active_hours ?? {};
    const lower: Record<string, { start?: string; end?: string }> = {};
    for (const [k, v] of Object.entries(hours)) lower[k.toLowerCase()] = v;
    const out: { day: string; start: string; end: string }[] = [];
    for (const k of DAY_KEYS) {
      const h = lower[k];
      if (h?.start && h?.end) {
        out.push({ day: DAY_LABELS[k], start: h.start, end: h.end });
      }
    }
    return out;
  }, [notary?.active_hours]);

  async function loadAlternatives() {
    setAltOpen(true);
    setAltLoading(true);
    try {
      const res = await bookingApi.alternatives(
        username,
        date,
        selectedSlotTime,
        serviceType,
      );
      setAlts(unwrap<{ slots: AlternativeSlot[] }>(res).slots);
    } catch {
      setAlts([]);
    } finally {
      setAltLoading(false);
    }
  }

  const selectedServiceName =
    services.find((s) => s.signing_type === serviceType)?.name ?? "";

  const errorStatus = (error as { statusCode?: number } | undefined)
    ?.statusCode;

  const minNotice = notary?.min_notice_hours ?? 0;

  if (submitted) {
    const rows: [string, string][] = [
      [
        "Notary",
        `${notary?.full_name ?? "Notary"}, NNA Certified Loan Signing Agent`,
      ],
      ["Service", selectedServiceName],
      ["Date", format(new Date(`${date}T00:00:00`), "EEEE, MMMM d, yyyy")],
      [
        "Time",
        selectedSlotLabel +
          (notary?.timezone_abbr ? ` (${notary.timezone_abbr})` : ""),
      ],
      ["Signing fee", feeValid ? `$${feeValue.toFixed(2)}` : "—"],
      ["Address", form.address],
      ...(form.document_type
        ? [["Document type", form.document_type] as [string, string]]
        : []),
      ["Client", form.client_name],
      ["Booking ref", bookingRef ?? "—"],
    ];
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex flex-col items-center px-6 py-10">
          <div className="w-full max-w-[560px]">
            <div className="text-center mb-8">
              <div className="w-[72px] h-[72px] rounded-full bg-teal flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="font-sora font-bold text-2xl text-primary-navy mb-2">
                Appointment requested
              </div>
              <div className="font-inter text-sm text-slate-secondary">
                {notary?.full_name ?? "Your notary"} will confirm your
                appointment shortly. We&apos;ve sent your details to{" "}
                {form.client_email || "your email"}.
              </div>
            </div>

            <div className="card p-5 mb-6">
              <div className="font-inter text-[11px] font-semibold text-slate-secondary uppercase tracking-[0.5px] mb-3">
                Your booking
              </div>
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0"
                >
                  <span className="font-inter text-xs text-slate-secondary w-[90px] flex-shrink-0 pt-px">
                    {label}
                  </span>
                  <span className="font-inter text-[13px] text-primary-navy font-medium flex-1 break-words">
                    {value}
                  </span>
                </div>
              ))}
              <div className="pt-3.5 font-inter text-xs text-slate-secondary leading-[1.5]">
                You&apos;ll receive a confirmation email once{" "}
                {notary?.full_name ?? "the notary"} approves your request. Track
                it with booking ref{" "}
                <span className="font-semibold text-primary-navy">
                  {bookingRef ?? "—"}
                </span>
                .
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                resetForm();
              }}
              className="btn-p"
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
      <div className="min-h-screen bg-bg flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
        </div>
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

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <PublicHeader />

      <div className="mx-auto w-full max-w-[1080px] md:flex md:flex-1">
        {/* Notary profile sidebar */}
        <div className="md:w-[320px] md:flex-shrink-0 md:border-r md:border-border bg-white px-5 py-6 md:px-6 md:py-7">
          <div className="bp-notary-card">
            <div className="bp-avatar">
              {getInitials(notary?.full_name ?? notary?.username)}
            </div>
            <div>
              <div className="font-sora font-bold text-[16px] text-primary-navy">
                {notary?.full_name ?? "Notary"}
              </div>
              <div className="font-inter text-xs text-slate-secondary mt-0.5">
                NNA Certified Loan Signing Agent
              </div>
            </div>
          </div>

          {notary?.bio && (
            <p className="font-inter text-[13px] text-slate leading-[1.6] mb-4">
              {notary.bio}
            </p>
          )}

          <div className="dvdr" />

          <span className="slbl">Services offered</span>
          <div className="bp-types">
            {services.map((s) => (
              <span key={s.signing_type} className="bp-type">
                {s.name}
              </span>
            ))}
          </div>

          <div className="dvdr" />

          <div className="font-inter text-xs text-slate-secondary leading-[1.6]">
            {weekSummary.length > 0 ? (
              weekSummary.map((w) => (
                <div key={w.day} className="flex gap-1.5 items-center mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-secondary" />
                  <span>
                    {w.day} {from24h(w.start)} – {from24h(w.end)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex gap-1.5 items-center mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-secondary" />
                <span>Hours vary by day</span>
              </div>
            )}
            {minNotice > 0 && (
              <div className="flex gap-1.5 items-center">
                <Info className="w-3.5 h-3.5 text-slate-secondary" />
                <span>
                  Minimum {minNotice} hour{minNotice > 1 ? "s" : ""} notice
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Booking form */}
        <div className="flex-1 px-5 py-6 md:py-9 md:px-8">
          <h1 className="font-sora font-bold text-[20px] text-primary-navy mb-1">
            Request a signing
          </h1>
          <p className="font-inter text-[13px] text-slate-secondary mb-6">
            Fill in your details and {notary?.full_name ?? "the notary"} will
            confirm your appointment automatically.
          </p>

          <div className="flex flex-col gap-4 max-w-[460px]">
            <div className="flex flex-col gap-1.5">
              <label className="lbl">
                Type of signing <span className="req">*</span>
              </label>
              <select
                value={serviceType}
                onChange={(e) => {
                  setServiceType(e.target.value);
                  setSelectedSlot(null);
                }}
                className="sel"
              >
                {services.map((s) => (
                  <option key={s.signing_type} value={s.signing_type}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="lbl">
                Signing address <span className="req">*</span>
              </label>
              <div className="icw" ref={addrWrapRef}>
                <span className="ico">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  placeholder="Enter the signing location address"
                  autoComplete="off"
                  value={form.address}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setForm({ ...form, address: e.target.value });
                    setShowSuggestions(true);
                  }}
                  className="inp has-icon"
                />
                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                  <ul
                    className="absolute left-0 right-0 z-20 bg-white border border-border rounded-[8px] max-h-60 overflow-y-auto"
                    style={{
                      marginTop: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                    }}
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

            <div className="flex flex-col gap-1.5">
              <label className="lbl">
                Signing fee you&apos;ll pay <span className="req">*</span>
              </label>
              <div className="icw">
                <span className="ico">
                  <DollarSign className="w-4 h-4" />
                </span>
                <input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.base_fee}
                  onChange={(e) =>
                    setForm({ ...form, base_fee: e.target.value })
                  }
                  className="inp has-icon"
                />
              </div>
              <span className="hint">
                The amount you agree to pay for this signing, including travel.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="lbl">
                Preferred date <span className="req">*</span>
              </label>
              <div className="icw">
                <span className="ico">
                  <CalendarDays className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    const next = e.target.value;
                    const today = format(new Date(), "yyyy-MM-dd");
                    setDate(next && next < today ? today : next);
                    setSelectedSlot(null);
                  }}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="inp has-icon"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="lbl">
                Preferred time <span className="req">*</span>
              </label>
              {isLoading ? (
                <div className="flex items-center justify-center h-[42px]">
                  <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-border bg-background px-4 py-5 text-center">
                  <span className="mx-auto mb-2 w-9 h-9 rounded-full bg-white border border-border text-slate-secondary flex items-center justify-center">
                    <SearchX className="w-4 h-4" />
                  </span>
                  <div className="font-inter text-[13px] font-semibold text-navy">
                    No times available
                  </div>
                  <div className="font-inter text-[11px] text-slate-secondary mt-0.5 leading-[1.4]">
                    {notary?.full_name ?? "This notary"} has no free slots on{" "}
                    {format(new Date(`${date}T00:00:00`), "EEEE, MMMM d")}. Try
                    another date, or reach out directly.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {slots.map((s) => (
                    <button
                      key={s.iso}
                      type="button"
                      onClick={() => setSelectedSlot(s.iso)}
                      className={`time-slot ${selectedSlot === s.iso ? "on" : ""}`}
                    >
                      {from24h(s.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {slots.length > 0 && selectedSlot && minNotice > 0 && (
              <p className="font-inter text-[11px] text-muted -mt-1">
                Requested slot is {minNotice} hour
                {minNotice > 1 ? "s" : ""} from now or later.
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="lbl">
                Your name <span className="req">*</span>
              </label>
              <div className="icw">
                <span className="ico">
                  <User className="w-4 h-4" />
                </span>
                <input
                  placeholder="Full name"
                  value={form.client_name}
                  onChange={(e) =>
                    setForm({ ...form, client_name: e.target.value })
                  }
                  className="inp has-icon"
                />
              </div>
            </div>

            <div className="g2">
              <div className="flex flex-col gap-1.5">
                <label className="lbl">
                  Email address <span className="req">*</span>
                </label>
                <div className="icw">
                  <span className="ico">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    placeholder="you@example.com"
                    type="email"
                    value={form.client_email}
                    onChange={(e) =>
                      setForm({ ...form, client_email: e.target.value })
                    }
                    className="inp has-icon"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="lbl">Phone number</label>
                <div className="icw">
                  <span className="ico">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    placeholder="Optional"
                    value={form.client_phone}
                    onChange={(e) =>
                      setForm({ ...form, client_phone: e.target.value })
                    }
                    className="inp has-icon"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="lbl">Special notes</label>
              <textarea
                placeholder="Gate codes, accessibility needs, special instructions…"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="ta"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="lbl">
                Document type{" "}
                <span className="font-inter text-[11px] text-muted font-normal">
                  · optional
                </span>
              </label>
              <input
                placeholder="e.g. Deed of Trust, Loan Package, Power of Attorney…"
                value={form.document_type}
                onChange={(e) =>
                  setForm({ ...form, document_type: e.target.value })
                }
                className="inp"
              />
              <span className="hint">
                Helps the notary prepare the right documents for your signing.
              </span>
            </div>

            {submitError && (
              <p className="font-inter text-xs text-red">{submitError}</p>
            )}

            <button
              onClick={() => submitBooking.mutate(undefined)}
              disabled={
                !form.client_name ||
                !form.client_email ||
                !form.address ||
                !selectedSlot ||
                !feeValid ||
                submitBooking.isPending
              }
              className="btn-p"
            >
              {submitBooking.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Request appointment</span>
                </>
              )}
            </button>
            <p className="font-inter text-[11px] text-muted text-center">
              Your request is checked against the notary&apos;s live schedule.
            </p>
          </div>
        </div>
      </div>

      {altOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[14px] w-full max-w-[520px] relative">
            <button
              onClick={() => setAltOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg text-slate-secondary hover:text-primary-navy"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pt-8">
              <div className="text-center mb-5">
                <div className="w-[64px] h-[64px] rounded-full bg-amber-bg border-2 border-amber-border flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-amber" />
                </div>
                <div className="font-sora font-bold text-xl text-primary-navy mb-2">
                  That time isn&apos;t available
                </div>
                <div className="font-inter text-sm text-slate-secondary leading-[1.5]">
                  {notary?.full_name ?? "The notary"} has another commitment at{" "}
                  {selectedSlotLabel || "that time"} on{" "}
                  {format(new Date(`${date}T00:00:00`), "EEEE, MMMM d")}. Here
                  are the next available slots:
                </div>
              </div>

              {altLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                </div>
              ) : alts.length === 0 ? (
                <div className="text-center py-5 font-inter text-xs text-muted">
                  No alternatives right now. Please try another day.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 mb-5">
                  {alts.map((a) => (
                    <div
                      key={a.iso}
                      className="bg-white border-[1.5px] border-border rounded-[10px] p-3.5 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div>
                        <div className="font-inter text-[13px] font-semibold text-primary-navy mb-0.5">
                          {format(new Date(a.iso), "EEEE, MMMM d")} ·{" "}
                          {from24h(a.time)}
                        </div>
                        <div className="font-inter text-xs text-slate-secondary">
                          ~{a.duration_mins} min · {a.note}
                        </div>
                      </div>
                      <button
                        onClick={() => submitBooking.mutate(a.iso)}
                        disabled={submitBooking.isPending}
                        className="h-9 px-3.5 rounded-[7px] bg-primary-navy text-white font-inter text-xs font-semibold disabled:opacity-50 whitespace-nowrap"
                      >
                        {submitBooking.isPending ? "Booking..." : "Book this"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setAltOpen(false)} className="btn-gh">
                <X className="w-4 h-4" />
                <span>
                  Cancel, I&apos;ll contact {notary?.full_name ?? "the notary"}{" "}
                  directly
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
