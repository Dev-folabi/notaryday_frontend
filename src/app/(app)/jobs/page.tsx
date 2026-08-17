"use client";

import { Clock, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useJobs } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import type { JobStatus } from "@/types/job";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import JobCard from "@/components/jobs/JobCard";

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

export default function JobsPage() {
  const router = useRouter();
  const {
    jobsDate,
    setJobsDate,
    jobsStatusFilter,
    setJobsStatusFilter,
  } = useUIStore();
  const today = toDateInputValue(new Date());
  const date = jobsDate || today;
  const filter = STATUS_FILTERS.includes(jobsStatusFilter as StatusFilter)
    ? (jobsStatusFilter as StatusFilter)
    : "All";
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
              onClick={() => setJobsStatusFilter(f)}
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
              onChange={(e) => setJobsDate(e.target.value)}
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
              setJobsDate(toDateInputValue(new Date()));
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
            {date === today
              ? "Today"
              : format(parseISO(date), "EEE, MMM d")}
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
              <JobCard
                key={job.id}
                job={job}
                variant="jobs"
                onClick={() => router.push(`/jobs/${job.id}`)}
                onResume={() => router.push("/active")}
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
