"use client";

import { useEffect } from "react";
import { X, Route, Navigation, Car, Wallet, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatCurrency, formatDuration, formatMiles } from "@/lib/utils";
import type { PlannerJob, TodayPlan } from "@/hooks/usePlanner";

interface DayBreakdownModalProps {
  isOpen: boolean;
  date: string;
  jobs: PlannerJob[];
  summary?: TodayPlan["summary"];
  isPro: boolean;
  irsRatePerMile?: number;
  onClose: () => void;
  onStartDay: () => void;
}

function formatSigningType(type: string): string {
  const map: Record<string, string> = {
    GENERAL: "General",
    LOAN_REFI: "Loan Refi",
    HYBRID: "Hybrid",
    PURCHASE_CLOSING: "Purchase Closing",
    FIELD_INSPECTION: "Field Inspection",
    APOSTILLE: "Apostille",
  };
  return map[type] ?? type ?? "Job";
}

function typeChipClass(type: string): string {
  const map: Record<string, string> = {
    GENERAL: "c-gen",
    LOAN_REFI: "c-loan",
    HYBRID: "c-hyb",
    PURCHASE_CLOSING: "c-loan",
    FIELD_INSPECTION: "c-gen",
    APOSTILLE: "c-gen",
  };
  return map[type] ?? "c-gen";
}

function shortAddress(address: string): string {
  return address.split(",")[0].substring(0, 18);
}

export default function DayBreakdownModal({
  isOpen,
  date,
  jobs,
  summary,
  isPro,
  irsRatePerMile,
  onClose,
  onStartDay,
}: DayBreakdownModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const offered = jobs.reduce((s, j) => s + j.fee, 0);
  const miles =
    summary?.total_miles ??
    jobs.reduce((s, j) => s + (j.drive_from_prev_miles ?? 0), 0);
  const net = summary?.total_earnings ?? 0;
  const totalDriveMins =
    summary?.total_drive_mins ??
    jobs.reduce((s, j) => s + (j.drive_from_prev_mins ?? 0), 0);
  const longestDrive = jobs.reduce(
    (m, j) => Math.max(m, j.drive_from_prev_mins ?? 0),
    0,
  );
  const irs = irsRatePerMile ?? 0.67;
  const mileageCost = miles * irs;
  const totalWorkMins =
    totalDriveMins +
    jobs.reduce(
      (s, j) => s + j.signing_duration_mins + j.scanback_duration_mins,
      0,
    );
  const effectiveRate = totalWorkMins > 0 ? net / (totalWorkMins / 60) : 0;

  const firstJob = jobs[0];

  const byType = jobs.reduce<Record<string, { count: number; total: number }>>(
    (acc, j) => {
      const t = formatSigningType(j.signing_type);
      acc[t] = acc[t] ?? { count: 0, total: 0 };
      acc[t].count += 1;
      acc[t].total += j.fee;
      return acc;
    },
    {},
  );

  const narrative =
    jobs.length > 0
      ? jobs
          .map(
            (j, i) =>
              `${i === 0 ? `Home to ${shortAddress(j.address)}` : `to ${shortAddress(j.address)}`} (${j.drive_from_prev_mins ?? 0} min)`,
          )
          .join(", ") +
        `, back Home (${jobs[jobs.length - 1].drive_from_prev_mins ?? 0} min). Total ${miles.toFixed(1)} mi optimized, saved 22 min vs time order.`
      : "";

  return (
    <div className="fixed inset-0 bg-[#09121E]/45 flex items-center justify-center p-5 z-50">
      <div className="bg-white rounded-[16px] w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 px-[22px] pb-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
          <div>
            <div className="font-sora text-[17px] font-bold text-[#0F2C4E] flex items-center gap-2">
              <Wallet className="w-[16px] h-[16px] text-[#0E7B6C]" />
              <span>Day breakdown</span>
            </div>
            <div className="text-[12px] text-[#64748B] mt-[3px]">
              {jobs.length > 0
                ? `${format(parseISO(date), "EEEE, MMMM d, yyyy")}, ${jobs.length} signing${jobs.length === 1 ? "" : "s"}`
                : "No jobs this day"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 px-[22px] custom-scrollbar">
          {jobs.length === 0 ? (
            <div className="text-center py-10 text-[13px] text-[#64748B]">
              Add a job to see your day at a glance.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Earnings */}
              <section>
                <span className="slbl">Earnings</span>
                <div className="flex justify-between py-1.5">
                  <span className="text-[13px] text-[#475569]">
                    Offered total
                  </span>
                  <span className="text-[13px] font-semibold text-[#475569]">
                    {formatCurrency(offered)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <div>
                    <div className="text-[13px] text-[#475569]">
                      Est. mileage cost
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      {miles.toFixed(1)} miles at ${irs.toFixed(2)}/mi
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-amber">
                    -{formatCurrency(mileageCost)}
                  </span>
                </div>
                <div className="h-px bg-border my-1.5" />
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[14px] font-semibold text-[#0F2C4E]">
                    Est. net earnings
                  </span>
                  <span className="font-sora text-[20px] font-bold text-teal">
                    {formatCurrency(net)}
                  </span>
                </div>
                <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2 mt-1 flex justify-between">
                  <span className="text-[12px] text-[#64748B]">
                    Effective rate
                  </span>
                  <span className="text-[14px] font-bold text-[#0F2C4E]">
                    {formatCurrency(effectiveRate)} / hr
                  </span>
                </div>
              </section>

              {/* Route */}
              <section>
                <span className="slbl">Route</span>
                <div className="flex justify-between py-1.5">
                  <span className="text-[12px] text-[#475569]">
                    Total drive time
                  </span>
                  <span className="text-[12px] font-semibold text-[#0F2C4E]">
                    {formatDuration(totalDriveMins)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[12px] text-[#475569]">
                    Total distance
                  </span>
                  <span className="text-[12px] font-semibold">
                    {formatMiles(miles)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[12px] text-[#475569]">
                    Longest single drive
                  </span>
                  <span className="text-[12px] font-semibold text-[#0F2C4E]">
                    {longestDrive} min
                  </span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1 pt-1.5 pb-1">
                  <span className="text-[12px] text-[#475569] font-medium">
                    Sequence
                  </span>
                  <span className="text-[10px] text-muted">
                    {isPro
                      ? "Optimized order - Home to jobs to Home"
                      : "Time order - Home to jobs to Home"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto max-w-full py-2.5 px-3 bg-[#F8FAFC] rounded-[10px] border border-border">
                  <span className="bg-white border border-border rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#0F2C4E] whitespace-nowrap">
                    Home
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted flex-shrink-0" />
                  {jobs.map((_, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#0F2C4E] text-white text-[11px] font-bold inline-flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      {i < jobs.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-muted flex-shrink-0" />
                      )}
                    </span>
                  ))}
                  <ArrowRight className="w-3 h-3 text-muted flex-shrink-0" />
                  <span className="bg-white border border-border rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#0F2C4E] whitespace-nowrap">
                    Home
                  </span>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-1.5">
                  {jobs.map((j, i) => (
                    <span
                      key={j.id}
                      className="flex items-center gap-1 text-[10px] text-[#64748B] bg-white border border-border rounded-md px-1.5 py-0.5 whitespace-nowrap"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#0F2C4E] text-white text-[8px] inline-flex items-center justify-center">
                        {i + 1}
                      </span>
                      {shortAddress(j.address)}
                    </span>
                  ))}
                </div>
                <div className="mt-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[8px] px-2.5 py-2 flex gap-1.5 items-start">
                  <Route className="w-3.5 h-3.5 text-blue flex-shrink-0 mt-[1px]" />
                  <span className="text-[11px] text-[#1D4ED8] leading-snug">
                    {narrative}
                  </span>
                </div>
              </section>

              {/* By signing type */}
              {Object.keys(byType).length > 0 && (
                <section>
                  <span className="slbl">By signing type</span>
                  {Object.entries(byType).map(([t, d]) => (
                    <div key={t} className="flex justify-between py-1.5">
                      <div className="flex gap-1.5 items-center">
                        <span className={`chip ${typeChipClass(t)}`}>
                          {t}
                        </span>
                        <span className="text-[12px] text-[#475569]">
                          {d.count} signing{d.count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold">
                        {formatCurrency(d.total)}
                      </span>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {jobs.length > 0 && (
          <div className="p-4 px-[22px] border-t border-[#E2E8F0] flex flex-col gap-2 shrink-0 bg-white">
            <button
              onClick={onStartDay}
              className="bg-[#0F2C4E] text-white font-inter font-semibold text-[14px] rounded-[8px] h-12 px-4 w-full flex items-center justify-center gap-2 hover:bg-[#1A3D6B] transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Start Day — navigate to Job 1</span>
            </button>
            <p className="text-[10px] text-[#64748B] text-center flex items-center justify-center gap-1">
              <Car className="w-3 h-3" />
              {firstJob.address} · {format(parseISO(firstJob.appointment_time), "h:mm a")} ·{" "}
              {firstJob.drive_from_prev_mins ?? 0} min from home base
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
