"use client";

import type { MouseEvent } from "react";
import { Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { cn, formatCurrency, formatTime, profitabilityColor } from "@/lib/utils";
import type { PlannerJob } from "@/hooks/usePlanner";
import type { Job } from "@/types/job";

type JobCardJob = Job | PlannerJob;

interface JobCardProps {
  job: JobCardJob;
  variant: "today" | "jobs" | "day";
  onClick: () => void;
  onResume?: () => void;
}

function typeKey(signingType: string): "gen" | "loan" | "hyb" {
  const type = signingType.toUpperCase();
  if (type === "LOAN_REFI" || type === "PURCHASE_CLOSING") return "loan";
  if (type === "HYBRID") return "hyb";
  return "gen";
}

export function jobTypeChipClass(signingType: string): string {
  const key = typeKey(signingType);
  if (key === "loan") return "c-loan";
  if (key === "hyb") return "c-hyb";
  return "c-gen";
}

export function jobTypeLabel(signingType: string): string {
  const type = signingType.toUpperCase();
  if (type === "LOAN_REFI") return "Loan Refi";
  if (type === "GENERAL") return "General";
  if (type === "HYBRID") return "Hybrid";
  if (type === "PURCHASE_CLOSING") return "Purchase Closing";
  if (type === "FIELD_INSPECTION") return "Field Inspection";
  if (type === "APOSTILLE") return "Apostille";
  return signingType || "Job";
}

export default function JobCard({
  job,
  variant,
  onClick,
  onResume,
}: JobCardProps) {
  const net = Number(job.net_earnings ?? ("fee" in job ? job.fee : 0)) || 0;

  if (variant === "today") {
    const anchored = "anchored" in job && Boolean(job.anchored);
    return (
      <div className="jcard cursor-pointer" onClick={onClick}>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-primary-navy mb-0.5 flex gap-1.5 items-center flex-wrap">
            {job.appointment_time
              ? format(parseISO(job.appointment_time), "h:mm a")
              : "—"} · {job.signing_duration_mins ?? 30} min
            {anchored && (
              <span
                className="chip"
                style={{ background: "#DBEAFE", color: "#1D4ED8", fontSize: 8 }}
              >
                Anchored
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-secondary whitespace-nowrap overflow-hidden text-ellipsis flex gap-1 items-center">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {job.address || "No address"}
          </div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            <span className={cn("chip", jobTypeChipClass(job.signing_type))}>
              {jobTypeLabel(job.signing_type)}
            </span>
            {job.platform_name && (
              <span className="chip c-plat">{job.platform_name}</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={cn("text-[13px] font-bold", profitabilityColor(net))}>
            {formatCurrency(net)}
          </div>
          <span
            className={cn("chip mt-1", jobTypeChipClass(job.signing_type))}
            style={{ fontSize: 8 }}
          >
            {jobTypeLabel(job.signing_type)}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "jobs" && "status" in job) {
    const isLive = job.status === "IN_PROGRESS";
    const handleResume = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onResume?.();
    };
    return (
      <div
        className="jcard"
        style={{
          border: isLive ? "2px solid #D97706" : undefined,
          background: isLive ? "#FFFBEB" : undefined,
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0F2C4E" }}>
              {formatTime(job.appointment_time)}
            </span>
            <JobStatusBadge status={job.status as Job["status"]} />
            {isLive && (
              <span
                className="chip"
                style={{ background: "#D97706", color: "#fff", fontSize: 8 }}
              >
                LIVE - Tap to resume
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#64748B",
              display: "flex",
              gap: 4,
              alignItems: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{job.address}</span>
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
            <span className={`chip ${jobTypeChipClass(job.signing_type)}`}>
              {jobTypeLabel(job.signing_type)}
            </span>
            <span className="chip c-plat">{job.platform_name || "Direct"}</span>
          </div>
          {isLive && (
            <button
              style={{
                marginTop: 8,
                background: "#D97706",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={handleResume}
            >
              <Clock className="w-3 h-3 inline" /> Open Active Signing
            </button>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className={`text-[14px] font-bold ${profitabilityColor(net)}`}>
            {formatCurrency(net)}
          </div>
          <div style={{ fontSize: 9, color: "#64748B" }}>net</div>
        </div>
      </div>
    );
  }

  return (
    <div className="jcard" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-primary-navy flex gap-1.5 items-center">
          <Clock className="w-3 h-3" /> {format(parseISO(job.appointment_time), "h:mm a")} -{" "}
          {job.signing_duration_mins} min
        </div>
        <div className="text-[11px] text-slate mb-1.5 flex gap-1 items-center">
          <MapPin className="w-3 h-3 flex-shrink-0" /> {job.address}
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className={cn("chip", jobTypeChipClass(job.signing_type))}>
            {jobTypeLabel(job.signing_type)}
          </span>
          {job.platform_name && <span className="chip c-plat">{job.platform_name}</span>}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={cn("text-[13px] font-bold", profitabilityColor(net))}>
          {formatCurrency(net)}
        </div>
        <div className="text-[9px] text-slate-secondary">net after mileage</div>
      </div>
    </div>
  );
}
