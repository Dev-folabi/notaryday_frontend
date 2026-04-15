"use client";

import { useQuery } from "@tanstack/react-query";
import { useJobs } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import { queryKeys } from "@/lib/queryClient";
import { formatCurrency, formatMiles, toDateInputValue } from "@/lib/utils";
import { Plus, Clock, MapPin, Car, Briefcase, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PENDING_REVIEW: "Pending Review",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  SCANNING: "Scanning",
  COMPLETE: "Complete",
  CANCELLED: "Cancelled",
  DECLINED: "Declined",
};

export default function JobsPage() {
  const router = useRouter();
  const { activeDate, setActiveDate } = useUIStore();
  const { data: jobs = [], isLoading } = useJobs({ date: activeDate });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-8 py-4 lg:py-5 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-sora font-bold text-xl text-primary-navy">My Jobs</h1>
          <p className="font-inter text-xs text-slate-secondary mt-0.5">
            {activeDate ? format(parseISO(activeDate), "MMMM d, yyyy") : "All dates"}
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-11 px-5 hover:bg-navy-active transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add job
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-border rounded-14px p-8 text-center">
            <div className="w-14 h-14 rounded-12px bg-blue-bg flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-interactive-blue" />
            </div>
            <h2 className="font-sora font-semibold text-lg text-primary-navy mb-2">
              No jobs found
            </h2>
            <p className="font-inter text-sm text-slate-secondary mb-6 max-w-xs mx-auto">
              Add your first job to start tracking your schedule and earnings.
            </p>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-11 px-5 hover:bg-navy-active transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first job
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="bg-white border border-border rounded-12px p-4 flex items-start justify-between gap-3 hover:border-slate-secondary transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-8px flex items-center justify-center flex-shrink-0 mt-0.5",
                      job.scanback_duration_mins > 0 ? "bg-amber-bg" : "bg-blue-bg"
                    )}
                  >
                    <Clock className={cn("w-4 h-4", job.scanback_duration_mins > 0 ? "text-amber-warning" : "text-interactive-blue")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-inter text-sm font-semibold text-primary-navy">
                        {format(parseISO(job.appointment_time), "h:mm a")}
                      </span>
                      <span className="font-inter text-xs text-muted">
                        {job.signing_duration_mins} min
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="font-inter text-xs text-slate-secondary flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{job.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <SigningTypeChip type={job.signing_type} />
                      {job.platform_name && (
                        <span className="font-inter text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-secondary">
                          {job.platform_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className={cn(
                      "font-sora font-bold text-lg",
                      getProfitabilityColor(parseFloat(job.net_earnings ?? "0"))
                    )}
                  >
                    {formatCurrency(parseFloat(job.net_earnings ?? "0"))}
                  </div>
                  <span className="font-inter text-[10px] text-muted">net</span>
                  {job.drive_from_prev_mins && (
                    <div className="flex items-center justify-end gap-1 mt-1 text-muted">
                      <Car className="w-3 h-3" />
                      <span className="font-inter text-[10px]">{job.drive_from_prev_mins} min</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: "bg-slate-100 text-slate-secondary",
    PENDING_REVIEW: "bg-violet-bg text-violet",
    CONFIRMED: "bg-blue-bg text-interactive-blue",
    IN_PROGRESS: "bg-amber-bg text-amber-warning",
    SCANNING: "bg-amber-bg text-amber-warning",
    COMPLETE: "bg-teal-bg text-teal-success",
    CANCELLED: "bg-slate-100 text-slate-secondary",
    DECLINED: "bg-red-danger/10 text-red-danger",
  };
  return (
    <span className={cn("font-inter text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded", colorMap[status] ?? "bg-slate-100 text-slate-secondary")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function SigningTypeChip({ type }: { type: string }) {
  const map: Record<string, string> = {
    GENERAL: "bg-blue-bg text-interactive-blue",
    LOAN_REFI: "bg-violet-bg text-violet",
    HYBRID: "bg-violet-bg text-violet",
    PURCHASE_CLOSING: "bg-violet-bg text-violet",
    FIELD_INSPECTION: "bg-teal-bg text-teal-success",
    APOSTILLE: "bg-teal-bg text-teal-success",
  };
  const labelMap: Record<string, string> = {
    GENERAL: "General",
    LOAN_REFI: "Loan Refi",
    HYBRID: "Hybrid",
    PURCHASE_CLOSING: "Purchase",
    FIELD_INSPECTION: "Field Insp.",
    APOSTILLE: "Apostille",
  };
  return (
    <span className={cn("font-inter text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded", map[type] ?? "bg-slate-100 text-slate-secondary")}>
      {labelMap[type] ?? type}
    </span>
  );
}

function getProfitabilityColor(net: number): string {
  if (net >= 30) return "text-teal-success";
  if (net >= 10) return "text-amber-warning";
  return "text-red-danger";
}
