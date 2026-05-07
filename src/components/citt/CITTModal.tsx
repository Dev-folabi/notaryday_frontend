"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/store/uiStore";
import { useCITTCheck } from "@/hooks/useCITT";
import { useAuth } from "@/hooks/useAuth";
import { X, Zap, MapPin, DollarSign, Clock, Info } from "lucide-react";
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
  const { user } = useAuth();
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
          )}&limit=5&lang=en`
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

  if (!isCITTOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#09121E]/45 flex items-center justify-center p-5 z-50 rounded-b-[14px]">
      <div className="bg-white rounded-[16px] w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 px-[22px] pb-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <div className="font-sora text-[17px] font-bold text-primary-navy flex items-center gap-2">
              <Zap className="w-4 h-4 fill-primary-navy" />
              <span>Can I Take This?</span>
            </div>
            <div className="text-[12px] text-slate-secondary mt-[3px]">
              Check schedule fit, scanback conflicts & net earnings
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-slate-secondary hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 px-[22px] overflow-y-auto flex-1 custom-scrollbar">
          {isSuccess && data ? (
            <CITTVerdictCard
              result={data}
              onClose={handleClose}
              jobData={watch()}
            />
          ) : (
            <form id="citt-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* ADDRESS AUTOCOMPLETE */}
              <div className="flex flex-col gap-1.5" ref={wrapperRef}>
                <label className="font-inter font-medium text-xs text-slate-body">
                  Signing address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                  <input
                    {...register("address")}
                    autoComplete="off"
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Enter signing address..."
                    className={`bg-white border ${
                      errors.address ? "border-red-danger focus:ring-red-100" : "border-border focus:ring-blue-100"
                    } rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 outline-none w-full`}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-interactive-blue rounded-full animate-spin" />
                    </div>
                  )}
                  {showSuggestions && (suggestions.length > 0 || isSearching) && (
                    <ul className="absolute z-10 top-11 left-0 w-full bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isSearching && suggestions.length === 0 && (
                        <li className="px-3 py-3 text-xs text-slate-secondary text-center">
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
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 border-b border-border last:border-b-0 text-slate-body"
                          >
                            {label}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                {errors.address && (
                  <span className="text-red-danger text-xs">{errors.address.message}</span>
                )}
              </div>

              {/* FEE + TIME */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter font-medium text-xs text-slate-body">
                    Offered fee
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                    <input
                      type="number"
                      step="0.01"
                      {...register("fee", { valueAsNumber: true })}
                      className="bg-white border border-border rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full"
                    />
                  </div>
                  {errors.fee && (
                    <span className="text-red-danger text-xs">{errors.fee.message}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter font-medium text-xs text-slate-body">
                    Proposed start time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
                    <input
                      type="datetime-local"
                      {...register("appointment_time")}
                      className="bg-white border border-border rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full"
                    />
                  </div>
                  {errors.appointment_time && (
                    <span className="text-red-danger text-xs">
                      {errors.appointment_time.message}
                    </span>
                  )}
                </div>
              </div>

              {/* SIGNING TYPE */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter font-medium text-xs text-slate-body">
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
                          className={`px-3.5 py-2 border-[1.5px] rounded-button text-[13px] font-medium cursor-pointer transition-all ${
                            field.value === t.v
                              ? "border-primary-navy bg-blue-100/50 text-primary-navy font-semibold"
                              : "border-border bg-white text-slate-body"
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
                <label className="font-inter font-medium text-xs text-slate-body">
                  Estimated duration
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="number"
                    {...register("signing_duration_mins", { valueAsNumber: true })}
                    className="bg-white border border-border rounded-[6px] h-10 text-center w-[72px] text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <span className="text-[13px] text-slate-secondary">minutes</span>
                  <span className="text-[12px] text-slate-secondary ml-1">
                    (default for type)
                  </span>
                </div>
              </div>

              {/* INFO BOX - Only for Pro users */}
              {isPro && (
                <div className="bg-blue-50 border border-blue-200 rounded-button p-3 flex items-start gap-2.5 mt-2">
                  <Info className="w-4 h-4 text-interactive-blue shrink-0 mt-[1px]" />
                  <div className="text-[12px] text-blue-700 leading-snug">
                    <strong>Pro tip:</strong> Forward Snapdocs or SigningOrder
                    confirmation emails to{" "}
                    <span className="font-mono bg-blue-600/10 px-1 py-0.5 rounded-[3px]">
                      {user?.username || "user"}@import.notaryday.app
                    </span>{" "}
                    and this form fills automatically.
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="p-4 px-[22px] border-t border-border flex flex-col gap-2.5 shrink-0 bg-white">
            <button
              form="citt-form"
              type="submit"
              disabled={isPending}
              className="bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-11 px-4 w-full flex items-center justify-center gap-2 hover:bg-navy-active disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isPending ? "Running check..." : "Run check now"}</span>
            </button>
            <button
              onClick={handleClose}
              className="bg-transparent text-slate-secondary border border-border rounded-button h-10 font-medium text-[13px] flex items-center justify-center w-full"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
