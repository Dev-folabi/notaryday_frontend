"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/store/uiStore";
import { useCITTCheck } from "@/hooks/useCITT";
import { useAuth } from "@/hooks/useAuth";
import { useCreateJob } from "@/hooks/useJobs";
import { X, Zap, MapPin, DollarSign, Clock, Info, Sparkles } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CITTVerdictCard from "./CITTVerdictCard";

const cittSchema = z.object({
  address: z.string().min(5, "Address is required"),
  appointment_time: z.string().min(1, "Proposed start time is required"),
  signing_type: z.enum([
    "GENERAL",
    "LOAN_REFI",
    "HYBRID",
    "PURCHASE_CLOSING",
    "FIELD_INSPECTION",
    "APOSTILLE",
  ]),
  fee: z.number().min(0, "Fee is required"),
  platform_fee: z.number().min(0).default(0),
  signing_duration_mins: z.number().min(1).default(45),
});

type CITTFormValues = z.infer<typeof cittSchema>;

export default function CITTModal() {
  const { isCITTOpen, closeCITT, cittPreFill } = useUIStore();
  const { mutate, isPending, isSuccess, data, reset } = useCITTCheck();
  const createJob = useCreateJob();
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const isPro = user?.plan && user.plan !== "FREE";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<CITTFormValues>({
    resolver: zodResolver(cittSchema),
    defaultValues: {
      address: "",
      appointment_time: "",
      signing_type: "GENERAL",
      fee: 0,
      platform_fee: 0,
      signing_duration_mins: 45,
    },
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const addressQuery = watch("address");

  // Sync prefill
  useEffect(() => {
    if (isCITTOpen && cittPreFill) {
      resetForm({
        address: cittPreFill.address || "",
        appointment_time: cittPreFill.time || "",
        signing_type: (cittPreFill.type as any) || "GENERAL",
        fee: cittPreFill.fee || 0,
        platform_fee: 0,
        signing_duration_mins: 45,
      });
    }
  }, [isCITTOpen, cittPreFill, resetForm]);

  // Click outside for address autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isSearching, setIsSearching] = useState(false);

  // Address search
  useEffect(() => {
    if (!addressQuery || addressQuery.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            addressQuery
          )}&limit=5&lang=en&countrycode=us`
        );
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        setSuggestions(json.features || []);
      } catch (e) {
        console.error("Photon API error", e);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [addressQuery]);

  const handleSelectAddress = (feature: any) => {
    const { name, street, city, state, postcode } = feature.properties;
    const parts = [name || street, city, state, postcode].filter(Boolean);
    setValue("address", parts.join(", "), { shouldValidate: true });
    setShowSuggestions(false);
  };

  const onSubmit = (values: CITTFormValues) => {
    mutate({
      address: values.address,
      appointment_time: new Date(values.appointment_time).toISOString(),
      signing_type: values.signing_type,
      fee: values.fee,
      platform_fee: values.platform_fee,
      signing_duration_mins: values.signing_duration_mins,
    });
  };

  const handleClose = () => {
    reset(); // reset mutation state
    closeCITT();
  };

  const handleAddJob = async (values: any) => {
    try {
      await createJob.mutateAsync({
        ...values,
        appointment_time: new Date(values.appointment_time).toISOString(),
      });
      addToast({ type: "success", title: "Job added to your day" });
      handleClose();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Failed to add job",
        message: err?.message ?? "Please try again.",
      });
    }
  };

  if (!isCITTOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#09121E]/45 flex items-center justify-center p-5 z-50 rounded-b-[14px]">
      <div className="bg-white rounded-[16px] w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col max-h-[90vh]">
        {/* Header - Only if not showing results */}
        {!isSuccess && (
          <div className="p-5 px-[22px] pb-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
            <div>
              <div className="font-sora text-[17px] font-bold text-[#0F2C4E] flex items-center gap-2">
                <Zap className="w-[16px] h-[16px] fill-[#0F2C4E]" />
                <span>Can I Take This?</span>
              </div>
              <div className="text-[12px] text-[#64748B] mt-[3px]">
                Check schedule fit, scanback conflicts & net earnings
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={`overflow-y-auto flex-1 custom-scrollbar ${isSuccess ? "p-0" : "p-5 px-[22px]"}`}>
          {isSuccess && data ? (
            <CITTVerdictCard
              result={data}
              onClose={handleClose}
              onAdd={handleAddJob}
              isAdding={createJob.isPending}
              jobData={watch()}
            />
          ) : (
            <form id="citt-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* ADDRESS AUTOCOMPLETE */}
              <div className="flex flex-col gap-1.5" ref={wrapperRef}>
                <label className="text-[12px] font-medium text-[#475569]">
                  Signing address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#64748B]" />
                  <input
                    {...register("address")}
                    autoComplete="off"
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Enter signing address..."
                    className={`bg-white border ${
                      errors.address ? "border-[#C0392B] ring-2 ring-[#C0392B]/5" : "border-[#E2E8F0] focus:ring-2 focus:ring-[#EFF6FF] focus:border-[#2563EB]"
                    } rounded-[8px] h-11 px-3 pl-9 text-sm outline-none w-full transition-all`}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3.5 h-3.5 border-2 border-[#E2E8F0] border-t-[#2563EB] rounded-full animate-spin" />
                    </div>
                  )}
                  {showSuggestions && (suggestions.length > 0 || isSearching) && (
                    <ul className="absolute z-10 top-12 left-0 w-full bg-white border border-[#E2E8F0] rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isSearching && suggestions.length === 0 && (
                        <li className="px-3 py-3 text-xs text-[#64748B] text-center">
                          Searching addresses...
                        </li>
                      )}
                      {suggestions.map((s, i) => {
                        const { name, street, city, state, postcode } = s.properties;
                        const label = [name || street, city, state, postcode]
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <li
                            key={i}
                            onClick={() => handleSelectAddress(s)}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-[#F8FAFC] border-b border-[#E2E8F0] last:border-b-0 text-[#475569]"
                          >
                            {label}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                {errors.address && (
                  <span className="text-[#C0392B] text-[11px] flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>{errors.address.message}</span>
                  </span>
                )}
              </div>

              {/* FEE + TIME */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">
                    Offered fee
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#64748B]" />
                    <input
                      type="number"
                      step="0.01"
                      {...register("fee", { valueAsNumber: true })}
                      className="bg-white border border-[#E2E8F0] rounded-[8px] h-11 px-3 pl-8 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] outline-none w-full transition-all"
                    />
                  </div>
                  {errors.fee && (
                    <span className="text-[#C0392B] text-[11px]">{errors.fee.message}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">
                    Proposed start time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#64748B]" />
                    <input
                      type="datetime-local"
                      {...register("appointment_time")}
                      className="bg-white border border-[#E2E8F0] rounded-[8px] h-11 px-3 pl-9 text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] outline-none w-full transition-all"
                    />
                  </div>
                  {errors.appointment_time && (
                    <span className="text-[#C0392B] text-[11px]">
                      {errors.appointment_time.message}
                    </span>
                  )}
                </div>
              </div>

              {/* SIGNING TYPE */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-[#475569]">
                  Signing type
                </label>
                <Controller
                  name="signing_type"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { v: "GENERAL", l: "General" },
                        { v: "LOAN_REFI", l: "Loan Refi" },
                        { v: "HYBRID", l: "Hybrid" },
                        { v: "PURCHASE_CLOSING", l: "Purchase" },
                        { v: "FIELD_INSPECTION", l: "Field Inspection" },
                        { v: "APOSTILLE", l: "Apostille" },
                      ].map((t) => (
                        <div
                          key={t.v}
                          onClick={() => field.onChange(t.v)}
                          className={`px-3.5 py-2 border-[1.5px] rounded-[8px] text-[13px] font-medium cursor-pointer transition-all ${
                            field.value === t.v
                              ? "border-[#0F2C4E] bg-[#EFF6FF] text-[#0F2C4E] font-semibold"
                              : "border-[#E2E8F0] bg-white text-[#475569]"
                          }`}
                        >
                          {t.l}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* DURATION */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#475569]">
                  Estimated duration
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="number"
                    {...register("signing_duration_mins", { valueAsNumber: true })}
                    className="bg-white border border-[#E2E8F0] rounded-[8px] h-11 text-center w-[72px] text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] outline-none transition-all"
                  />
                  <span className="text-[13px] text-[#64748B]">minutes</span>
                  <span className="text-[12px] text-[#64748B] ml-1">
                    (default for type)
                  </span>
                </div>
              </div>

              {/* INFO BOX */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[8px] p-3 flex items-start gap-2.5 mt-2">
                <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-[1px]" />
                <div className="text-[12px] text-[#1D4ED8] leading-relaxed">
                  <strong>Pro tip:</strong> Forward Snapdocs or SigningOrder
                  confirmation emails to{" "}
                  <span className="font-mono bg-[#2563EB]/10 px-1.5 py-0.5 rounded-[3px] font-medium">
                    {user?.username || "user"}@import.notaryday.app
                  </span>{" "}
                  and this form fills automatically.
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="p-4 px-[22px] border-t border-[#E2E8F0] flex flex-col gap-2.5 shrink-0 bg-white">
            <button
              form="citt-form"
              type="submit"
              disabled={isPending}
              className="bg-[#0F2C4E] text-white font-inter font-semibold text-[14px] rounded-[8px] h-12 px-4 w-full flex items-center justify-center gap-2 hover:bg-[#1A3D6B] transition-colors disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isPending ? "Running check..." : "Run check now"}</span>
            </button>
            <button
              onClick={handleClose}
              className="bg-transparent text-[#64748B] border border-[#E2E8F0] rounded-[8px] h-11 font-medium text-[13px] flex items-center justify-center w-full hover:bg-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
