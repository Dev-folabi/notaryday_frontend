"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import {
  MapPin,
  CheckCircle2,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { format, addDays } from "date-fns";

export default function PublicBookingPage() {
  const { username } = useParams<{ username: string }>();
  const [date, setDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );
  const [serviceType, setServiceType] = useState("GENERAL");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"slots" | "form" | "done">("slots");
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    address: "",
    document_type: "",
    notes: "",
  });

  const { data: slotsData, isLoading } = useQuery({
    queryKey: ["booking-slots", username, date, serviceType],
    queryFn: async () => {
      const res = await bookingApi.getSlots(username, date, serviceType);
      const p = (res as any).data ?? res;
      return (p.data ?? p) as { slots: string[]; notary: any };
    },
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
    onSuccess: () => setStep("done"),
  });

  const notary = slotsData?.notary;
  const slots = slotsData?.slots ?? [];

  if (step === "done") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-14px border border-border p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-teal-bg border-2 border-teal-b flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-teal-success" />
          </div>
          <h1 className="font-sora font-bold text-xl text-primary-navy mb-2">
            Booking submitted!
          </h1>
          <p className="font-inter text-sm text-slate-secondary">
            {notary?.full_name} will review your request and confirm shortly.
            You&apos;ll receive an email at {form.client_email}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-5 text-center">
        <h1 className="font-sora font-bold text-lg text-primary-navy">
          {notary?.full_name ?? "Notary"}
        </h1>
        {notary?.bio && (
          <p className="font-inter text-xs text-slate-secondary mt-1 max-w-md mx-auto">
            {notary.bio}
          </p>
        )}
      </div>

      <div className="max-w-lg mx-auto p-4 pt-6">
        {step === "slots" && (
          <>
            {/* Date picker */}
            <label className="font-inter text-xs font-semibold text-slate-secondary uppercase tracking-wide block mb-2">
              Select date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedSlot(null);
              }}
              min={format(new Date(), "yyyy-MM-dd")}
              className="w-full h-11 border border-border rounded-8px px-3 font-inter text-sm mb-4"
            />

            {/* Service type */}
            <label className="font-inter text-xs font-semibold text-slate-secondary uppercase tracking-wide block mb-2">
              Service
            </label>
            <div className="flex gap-2 flex-wrap mb-5">
              {(
                notary?.services ?? [
                  { signing_type: "GENERAL", name: "General Notarisation" },
                ]
              ).map((s: any) => (
                <button
                  key={s.signing_type ?? s.name}
                  onClick={() => {
                    setServiceType(s.signing_type ?? "GENERAL");
                    setSelectedSlot(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${serviceType === (s.signing_type ?? "GENERAL") ? "border-primary-navy bg-blue-bg text-primary-navy font-semibold" : "border-border text-slate-secondary"}`}
                >
                  {s.name ?? s.signing_type}
                </button>
              ))}
            </div>

            {/* Slots */}
            <label className="font-inter text-xs font-semibold text-slate-secondary uppercase tracking-wide block mb-2">
              Available times
            </label>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-white border border-border rounded-12px p-6 text-center">
                <p className="font-inter text-sm text-slate-secondary">
                  No available times for this date. Try another day.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`h-10 rounded-8px text-xs font-semibold border transition-colors ${selectedSlot === slot ? "border-primary-navy bg-primary-navy text-white" : "border-border bg-white text-primary-navy hover:border-slate-secondary"}`}
                  >
                    {format(new Date(slot), "h:mm a")}
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <button
                onClick={() => setStep("form")}
                className="w-full h-11 bg-primary-navy text-white rounded-8px font-inter font-semibold text-sm"
              >
                Continue — {format(new Date(selectedSlot), "h:mm a")}
              </button>
            )}
          </>
        )}

        {step === "form" && (
          <>
            <button
              onClick={() => setStep("slots")}
              className="font-inter text-xs text-interactive-blue mb-4"
            >
              ← Back to slots
            </button>
            <h2 className="font-sora font-bold text-lg text-primary-navy mb-4">
              Your details
            </h2>
            <div className="flex flex-col gap-3 mb-5">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                <input
                  placeholder="Full name *"
                  value={form.client_name}
                  onChange={(e) =>
                    setForm({ ...form, client_name: e.target.value })
                  }
                  className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                <input
                  placeholder="Email *"
                  type="email"
                  value={form.client_email}
                  onChange={(e) =>
                    setForm({ ...form, client_email: e.target.value })
                  }
                  className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                <input
                  placeholder="Phone"
                  value={form.client_phone}
                  onChange={(e) =>
                    setForm({ ...form, client_phone: e.target.value })
                  }
                  className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                <input
                  placeholder="Signing address *"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full h-11 border border-border rounded-8px pl-9 pr-3 font-inter text-sm"
                />
              </div>
              <input
                placeholder="Document type (optional)"
                value={form.document_type}
                onChange={(e) =>
                  setForm({ ...form, document_type: e.target.value })
                }
                className="w-full h-11 border border-border rounded-8px px-3 font-inter text-sm"
              />
              <textarea
                placeholder="Notes (optional)"
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
                submitBooking.isPending
              }
              className="w-full h-11 bg-primary-navy text-white rounded-8px font-inter font-semibold text-sm disabled:opacity-50"
            >
              {submitBooking.isPending
                ? "Submitting..."
                : "Submit booking request"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
