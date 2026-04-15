"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateJob } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  MapPin, Clock, DollarSign, User, Phone, FileText, ChevronLeft, ArrowRight,
  Loader2, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, parseISO } from "date-fns";
import { toDateInputValue, formatCurrency } from "@/lib/utils";
import type { SigningType } from "@/types/user";

const SIGNING_TYPES: { key: SigningType; label: string; defaultSigning: number; defaultScanback: number }[] = [
  { key: "GENERAL", label: "General", defaultSigning: 30, defaultScanback: 0 },
  { key: "LOAN_REFI", label: "Loan Refi", defaultSigning: 60, defaultScanback: 20 },
  { key: "HYBRID", label: "Hybrid", defaultSigning: 75, defaultScanback: 18 },
  { key: "PURCHASE_CLOSING", label: "Purchase Closing", defaultSigning: 90, defaultScanback: 28 },
  { key: "FIELD_INSPECTION", label: "Field Inspection", defaultSigning: 45, defaultScanback: 0 },
  { key: "APOSTILLE", label: "Apostille", defaultSigning: 20, defaultScanback: 0 },
];

const PLATFORMS = ["Snapdocs", "SigningOrder", "NotaryGo", "Direct", "Other"];

export default function NewJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();
  const { addToast } = useUIStore();

  const tomorrow = toDateInputValue(addDays(new Date(), 1));

  const [address, setAddress] = useState("");
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState("09:00");
  const [signingType, setSigningType] = useState<SigningType>("LOAN_REFI");
  const [fee, setFee] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [notes, setNotes] = useState("");
  const [signingDuration, setSigningDuration] = useState(60);
  const [scanbackDuration, setScanbackDuration] = useState(20);
  const [isAnchor, setIsAnchor] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Array<{ display: string; place_id: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  const selectedType = SIGNING_TYPES.find((t) => t.key === signingType) ?? SIGNING_TYPES[0];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = "Signing address is required";
    if (!date) newErrors.date = "Date is required";
    if (!time) newErrors.time = "Start time is required";
    if (!fee || parseFloat(fee) <= 0) newErrors.fee = "Offered fee is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const appointment_time = new Date(`${date}T${time}`).toISOString();

    try {
      await createJob.mutateAsync({
        address: address.trim(),
        appointment_time,
        signing_type: signingType,
        signing_duration_mins: signingDuration,
        scanback_duration_mins: scanbackDuration,
        fee: parseFloat(fee),
        platform_fee: platformFee ? parseFloat(platformFee) : 0,
        client_name: clientName || undefined,
        client_phone: clientPhone || undefined,
        platform_name: platformName || undefined,
        notes: notes || undefined,
      });
      addToast({ type: "success", title: "Job added successfully" });
      router.push("/jobs");
    } catch (err: any) {
      addToast({ type: "error", title: "Failed to add job", message: err?.message ?? "Please try again." });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="p-1 text-slate-secondary hover:text-primary-navy">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sora font-bold text-lg text-primary-navy">Add job</h1>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-lg mx-auto flex flex-col gap-6">
          {/* Required fields */}
          <div>
            <span className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide block mb-3">
              Required fields
            </span>
            <div className="flex flex-col gap-4">
              {/* Address */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-medium text-xs text-slate-body">
                  Signing address <span className="text-red-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Start typing…"
                    className={cn(
                      "h-11 w-full pl-9 pr-3 text-sm border rounded-input bg-white text-slate-body",
                      "placeholder:text-muted",
                      "focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 focus:outline-none",
                      "transition-colors duration-150",
                      errors.address ? "border-red-danger" : "border-border"
                    )}
                  />
                </div>
                {errors.address && (
                  <span className="font-inter text-xs text-red-danger">{errors.address}</span>
                )}
              </div>

              {/* Date + Time grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter font-medium text-xs text-slate-body">
                    Date <span className="text-red-danger">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={cn(
                        "h-11 w-full pl-9 pr-3 text-sm border rounded-input bg-white text-slate-body",
                        "focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 focus:outline-none",
                        "transition-colors duration-150",
                        errors.date ? "border-red-danger" : "border-border"
                      )}
                    />
                  </div>
                  {errors.date && <span className="font-inter text-xs text-red-danger">{errors.date}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter font-medium text-xs text-slate-body">
                    Start time <span className="text-red-danger">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                      <Clock className="w-4 h-4" />
                    </span>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={cn(
                        "h-11 w-full pl-9 pr-3 text-sm border rounded-input bg-white text-slate-body",
                        "focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 focus:outline-none",
                        "transition-colors duration-150",
                        errors.time ? "border-red-danger" : "border-border"
                      )}
                    />
                  </div>
                  {errors.time && <span className="font-inter text-xs text-red-danger">{errors.time}</span>}
                </div>
              </div>

              {/* Signing type */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-medium text-xs text-slate-body">
                  Signing type <span className="text-red-danger">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SIGNING_TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setSigningType(t.key);
                        setSigningDuration(t.defaultSigning);
                        setScanbackDuration(t.defaultScanback);
                      }}
                      className={cn(
                        "px-4 py-2.5 border rounded-8px text-sm font-inter font-medium transition-colors",
                        signingType === t.key
                          ? "bg-blue-bg border-primary-navy text-primary-navy"
                          : "bg-white border-border text-slate hover:border-slate-secondary"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-medium text-xs text-slate-body">
                  Offered fee <span className="text-red-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="0.00"
                    className={cn(
                      "h-11 w-full pl-9 pr-3 text-sm border rounded-input bg-white text-slate-body",
                      "focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 focus:outline-none",
                      "transition-colors duration-150",
                      errors.fee ? "border-red-danger" : "border-border"
                    )}
                  />
                </div>
                {errors.fee && <span className="font-inter text-xs text-red-danger">{errors.fee}</span>}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide">
                Optional details
              </span>
              <span className="font-inter text-[10px] bg-bg border border-border text-muted px-1.5 py-0.5 rounded">
                Optional
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {/* Duration + Scanback */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter font-medium text-xs text-slate-body">Duration</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={signingDuration}
                      onChange={(e) => setSigningDuration(parseInt(e.target.value) || selectedType.defaultSigning)}
                      className="h-10 w-16 text-center border border-border rounded-6px text-sm font-inter font-semibold text-primary-navy focus:border-interactive-blue focus:outline-none"
                    />
                    <span className="font-inter text-sm text-slate-secondary">min</span>
                  </div>
                  <span className="font-inter text-[11px] text-muted">Default: {selectedType.defaultSigning} min</span>
                </div>
                {scanbackDuration > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-inter font-medium text-xs text-slate-body">Scanback override</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={scanbackDuration}
                        onChange={(e) => setScanbackDuration(parseInt(e.target.value) || 0)}
                        className="h-10 w-16 text-center border border-border rounded-6px text-sm font-inter font-semibold text-primary-navy focus:border-interactive-blue focus:outline-none"
                      />
                      <span className="font-inter text-sm text-slate-secondary">min</span>
                    </div>
                    <span className="font-inter text-[11px] text-muted">Default: {selectedType.defaultScanback} min</span>
                  </div>
                )}
              </div>

              {/* Client name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-medium text-xs text-slate-body">Client name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client name"
                    className="h-11 w-full pl-9 pr-3 text-sm border border-border rounded-input bg-white text-slate-body placeholder:text-muted focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Client phone */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-medium text-xs text-slate-body">Client phone</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(555) 555-0100"
                    className="h-11 w-full pl-9 pr-3 text-sm border border-border rounded-input bg-white text-slate-body placeholder:text-muted focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Platform */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-medium text-xs text-slate-body">Signing platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatformName(p)}
                      className={cn(
                        "px-3 py-2 border rounded-6px text-xs font-inter font-medium transition-colors",
                        platformName === p
                          ? "bg-blue-bg border-primary-navy text-primary-navy"
                          : "bg-white border-border text-slate-secondary hover:border-slate-secondary"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-medium text-xs text-slate-body">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Special instructions, access codes, etc."
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-8px bg-white text-slate-body placeholder:text-muted focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Anchor toggle */}
          <div className="border-t border-border pt-5 flex items-center justify-between">
            <div>
              <div className="font-inter text-sm font-semibold text-primary-navy flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Fixed start time (anchor)
              </div>
              <p className="font-inter text-xs text-slate-secondary mt-0.5">
                Route optimisation won&apos;t move this job&apos;s start time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnchor(!isAnchor)}
              className={cn(
                "w-11 h-6 rounded-full flex items-center transition-colors flex-shrink-0",
                isAnchor ? "bg-primary-navy" : "bg-border"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full bg-white shadow flex items-center justify-center transition-transform",
                  isAnchor ? "translate-x-5" : "translate-x-0.5"
                )}
              >
                {isAnchor && <span className="w-2 h-2 rounded-full bg-primary-navy" />}
              </div>
            </button>
          </div>

          {/* Info note */}
          <div className="bg-blue-bg border border-blue-b rounded-8px p-3 flex items-start gap-2">
            <span className="text-interactive-blue flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </span>
            <p className="font-inter text-xs text-interactive-blue leading-relaxed">
              Saving this job immediately recalculates your route, repositions scanback blocks, and refreshes Gap Finder.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button onClick={handleSubmit} isLoading={createJob.isPending}>
              <ArrowRight className="w-4 h-4" />
              Save job
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
