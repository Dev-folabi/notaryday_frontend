"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, DollarSign, Clock, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";

const jobSchema = z.object({
  address: z.string().min(5, "Address is required"),
  appointment_time: z.string().min(1, "Appointment time is required"),
  signing_type: z.enum([
    "GENERAL",
    "LOAN_REFI",
    "HYBRID",
    "PURCHASE_CLOSING",
    "FIELD_INSPECTION",
    "APOSTILLE",
  ]),
  fee: z.number().min(0, "Fee must be positive"),
  platform_fee: z.number().min(0).default(0),
  signing_duration_mins: z.number().min(1, "Duration required"),
  client_name: z.string().optional(),
  client_email: z.string().email("Invalid email").optional().or(z.literal("")),
  client_phone: z.string().optional(),
  platform_name: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialValues?: Partial<JobFormValues>;
  onSubmit: (data: JobFormValues) => void;
  isSubmitting?: boolean;
}

export default function JobForm({
  initialValues,
  onSubmit,
  isSubmitting,
}: JobFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      address: initialValues?.address || "",
      appointment_time: initialValues?.appointment_time
        ? format(new Date(initialValues.appointment_time), "yyyy-MM-dd'T'HH:mm")
        : "",
      signing_type: initialValues?.signing_type || "GENERAL",
      fee: initialValues?.fee || 0,
      platform_fee: initialValues?.platform_fee || 0,
      signing_duration_mins: initialValues?.signing_duration_mins || 45,
      client_name: initialValues?.client_name || "",
      client_email: initialValues?.client_email || "",
      client_phone: initialValues?.client_phone || "",
      platform_name: initialValues?.platform_name || "",
    },
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const addressQuery = watch("address");

  // Close dropdown when clicking outside
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
  }, [wrapperRef]);

  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
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
        const data = await res.json();
        setSuggestions(data.features || []);
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
    const parts = [
      name || street,
      city,
      state,
      postcode,
    ].filter(Boolean);
    const fullAddress = parts.join(", ");
    setValue("address", fullAddress, { shouldValidate: true });
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="Start typing an address..."
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
          <span className="text-red-danger text-xs">
            {errors.address.message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* TIME */}
        <div className="flex flex-col gap-1.5">
          <label className="font-inter font-medium text-xs text-slate-body">
            Proposed start time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
            <input
              type="datetime-local"
              {...register("appointment_time")}
              className={`bg-white border ${
                errors.appointment_time ? "border-red-danger" : "border-border"
              } rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full`}
            />
          </div>
          {errors.appointment_time && (
            <span className="text-red-danger text-xs">
              {errors.appointment_time.message}
            </span>
          )}
        </div>

        {/* FEE */}
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
              className={`bg-white border ${
                errors.fee ? "border-red-danger" : "border-border"
              } rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full`}
            />
          </div>
          {errors.fee && (
            <span className="text-red-danger text-xs">
              {errors.fee.message}
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
        {errors.signing_type && (
          <span className="text-red-danger text-xs">
            {errors.signing_type.message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* DURATION */}
        <div className="flex flex-col gap-1.5">
          <label className="font-inter font-medium text-xs text-slate-body">
            Duration (mins)
          </label>
          <input
            type="number"
            {...register("signing_duration_mins", { valueAsNumber: true })}
            className={`bg-white border ${
              errors.signing_duration_mins ? "border-red-danger" : "border-border"
            } rounded-[6px] h-10 px-3 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full`}
          />
        </div>

        {/* PLATFORM FEE */}
        <div className="flex flex-col gap-1.5">
          <label className="font-inter font-medium text-xs text-slate-body">
            Platform Fee
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
            <input
              type="number"
              step="0.01"
              {...register("platform_fee", { valueAsNumber: true })}
              className={`bg-white border ${
                errors.platform_fee ? "border-red-danger" : "border-border"
              } rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full`}
            />
          </div>
        </div>
      </div>

      {/* PLATFORM NAME */}
      <div className="flex flex-col gap-1.5">
        <label className="font-inter font-medium text-xs text-slate-body">
          Platform Name (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Snapdocs, SigningOrder, Direct"
          {...register("platform_name")}
          className="bg-white border border-border rounded-[6px] h-10 px-3 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full"
        />
      </div>

      <hr className="border-border my-4" />

      {/* CLIENT DETAILS */}
      <div className="flex flex-col gap-1.5">
        <label className="font-inter font-medium text-xs text-slate-body">
          Client Name (Optional)
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
          <input
            {...register("client_name")}
            className="bg-white border border-border rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-inter font-medium text-xs text-slate-body">
            Client Phone (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
            <input
              {...register("client_phone")}
              className="bg-white border border-border rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter font-medium text-xs text-slate-body">
            Client Email (Optional)
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-secondary" />
            <input
              {...register("client_email")}
              className="bg-white border border-border rounded-[6px] h-10 px-3 pl-9 text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none w-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-11 px-4 w-full hover:bg-navy-active disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Job"}
        </button>
      </div>
    </form>
  );
}
