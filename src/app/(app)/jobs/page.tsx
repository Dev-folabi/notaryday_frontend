"use client";

import { MapPin, Clock, DollarSign, Plus, Navigation, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import type { Job, JobStatus } from "@/types/job";
import { formatTime, formatCurrency, profitabilityColor } from "@/lib/utils";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "In Progress",
  "Complete",
  "Cancelled",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_ENUM_MAP: Record<Exclude<StatusFilter, "All">, JobStatus> = {
  Pending: "PENDING",
  Confirmed: "CONFIRMED",
  "In Progress": "IN_PROGRESS",
  Complete: "COMPLETE",
  Cancelled: "CANCELLED",
};

function typeKey(signingType: string): "gen" | "loan" | "hyb" {
  const t = signingType.toUpperCase();
  if (t === "LOAN_REFI" || t === "PURCHASE_CLOSING") return "loan";
  if (t === "HYBRID") return "hyb";
  return "gen";
}

function typeChipClass(typeKey: string): string {
  if (typeKey === "loan") return "bg-blue-100 text-blue-700";
  if (typeKey === "hyb") return "bg-violet-100 text-violet-700";
  return "bg-emerald-100 text-emerald-800";
}

function typeLabel(signingType: string): string {
  const t = signingType.toUpperCase();
  if (t === "LOAN_REFI") return "Loan Refi";
  if (t === "GENERAL") return "General";
  if (t === "HYBRID") return "Hybrid";
  if (t === "PURCHASE_CLOSING") return "Purchase Closing";
  if (t === "FIELD_INSPECTION") return "Field Inspection";
  if (t === "APOSTILLE") return "Apostille";
  return signingType;
}

export default function JobsPage() {
  const router = useRouter();
  const { openCITT } = useUIStore();
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const { data: jobs, isLoading, isError } = useJobs({ date });

  const filtered =
    !jobs || filter === "All"
      ? jobs ?? []
      : jobs.filter((j) => j.status === STATUS_ENUM_MAP[filter]);

  const totalNet = filtered.reduce(
    (sum, j) => sum + (parseFloat(j.net_earnings ?? "0") || 0),
    0,
  );

  return (
    <>
      <div className="ph">
        <div className="ph-title">My Jobs</div>
        <button
          className="btn-p"
          style={{ width: "auto", height: 34, padding: "0 12px", fontSize: 11 }}
          onClick={() => router.push("/jobs/new")}
        >
          <Plus className="w-3.5 h-3.5" />
          Add job
        </button>
      </div>

      <div className="con">
        {/* Status filter pills */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            flexWrap: "wrap",
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: filter === f ? 600 : 500,
                border: `1.5px solid ${filter === f ? "#0F2C4E" : "#E2E8F0"}`,
                background: filter === f ? "#EFF6FF" : "#FFFFFF",
                color: filter === f ? "#0F2C4E" : "#64748B",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Date picker + summary */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              color: "#475569",
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 11,
                color: "#475569",
                background: "transparent",
              }}
            />
          </div>
          <button
            onClick={() => {
              const d = new Date();
              setDate(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
              );
            }}
            style={{
              fontSize: 11,
              color: "#2563EB",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Today
          </button>
          <span style={{ fontSize: 11, color: "#64748B" }}>
            {filtered.length} jobs, {formatCurrency(totalNet)} net
          </span>
        </div>

        {isLoading && (
          <div style={{ textAlign: "center", padding: 24, color: "#64748B", fontSize: 12 }}>
            Loading jobs…
          </div>
        )}

        {isError && (
          <div style={{ textAlign: "center", padding: 24, color: "#C0392B", fontSize: 12 }}>
            Couldn&apos;t load jobs. Please try again.
          </div>
        )}

        {!isLoading && !isError && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                onClick={() => router.push(`/jobs/${job.id}`)}
              />
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 24,
                  color: "#64748B",
                  fontSize: 12,
                }}
              >
                No jobs found for this filter
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function JobListItem({ job, onClick }: { job: Job; onClick: () => void }) {
  const router = useRouter();
  const isLive = job.status === "IN_PROGRESS";
  const net = parseFloat(job.net_earnings ?? "0") || 0;
  const tk = typeKey(job.signing_type);

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
          <JobStatusBadge status={job.status} />
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
          <span className={`chip ${typeChipClass(tk)}`}>{typeLabel(job.signing_type)}</span>
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
            onClick={(e) => {
              e.stopPropagation();
              router.push("/active");
            }}
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
