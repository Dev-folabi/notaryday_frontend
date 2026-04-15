"use client";

import { useQuery } from "@tanstack/react-query";
import { useJob, useUpdateJobStatus, useDeleteJob } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/lib/utils";
import {
  Clock, MapPin, Car, Navigation, ChevronLeft, Edit2, Trash2,
  CheckCircle2, User, Phone, Platform,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

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

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: job, isLoading } = useJob(params.id);
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();
  const { addToast } = useUIStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="font-inter text-sm text-slate-secondary mb-4">Job not found</p>
        <Link href="/jobs" className="font-inter text-sm text-interactive-blue hover:underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const net = parseFloat(job.net_earnings ?? "0") || 0;
  const fee = parseFloat(job.fee ?? "0") || 0;
  const mileageCost = parseFloat(job.mileage_cost ?? "0") || 0;
  const mileageMiles = parseFloat(job.mileage_miles ?? "0") || 0;
  const effectiveHourly = parseFloat(job.effective_hourly ?? "0") || 0;
  const netColor = net >= 30 ? "text-teal-success" : net >= 10 ? "text-amber-warning" : "text-red-danger";
  const feeColor = fee >= 30 ? "text-teal-success" : fee >= 10 ? "text-amber-warning" : "text-red-danger";

  const signingTypes: Record<string, string> = {
    GENERAL: "General",
    LOAN_REFI: "Loan Refi",
    HYBRID: "Hybrid",
    PURCHASE_CLOSING: "Purchase Closing",
    FIELD_INSPECTION: "Field Inspection",
    APOSTILLE: "Apostille",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-slate-100 text-slate-secondary",
    PENDING_REVIEW: "bg-violet-bg text-violet",
    CONFIRMED: "bg-blue-bg text-interactive-blue",
    IN_PROGRESS: "bg-amber-bg text-amber-warning",
    SCANNING: "bg-amber-bg text-amber-warning",
    COMPLETE: "bg-teal-bg text-teal-success",
    CANCELLED: "bg-slate-100 text-slate-secondary",
    DECLINED: "bg-red-danger/10 text-red-danger",
  };

  const handleMarkComplete = async () => {
    try {
      await updateStatus.mutateAsync({ id: job.id, status: "COMPLETE" });
      addToast({ type: "success", title: "Job marked complete" });
    } catch {
      addToast({ type: "error", title: "Failed to update status" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteJob.mutateAsync(job.id);
      addToast({ type: "success", title: "Job deleted" });
      router.push("/jobs");
    } catch {
      addToast({ type: "error", title: "Failed to delete job" });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 text-slate-secondary hover:text-primary-navy">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sora font-bold text-lg text-primary-navy">Job detail</h1>
            <p className="font-inter text-xs text-slate-secondary">
              {format(parseISO(job.appointment_time), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <Link
          href={`/jobs/${job.id}/edit`}
          className="inline-flex items-center gap-1.5 bg-white border border-primary-navy text-primary-navy font-inter font-semibold text-xs rounded-7px h-9 px-3 hover:bg-bg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col gap-4">
        {/* Main job card */}
        <div className="bg-white border border-border rounded-14px p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={cn("font-inter text-xs font-semibold uppercase px-2 py-0.5 rounded", statusColors[job.status] ?? "bg-slate-100 text-slate-secondary")}>
                  {STATUS_LABELS[job.status] ?? job.status}
                </span>
                <span className="font-inter text-xs font-semibold uppercase px-2 py-0.5 rounded bg-violet-bg text-violet">
                  {signingTypes[job.signing_type] ?? job.signing_type}
                </span>
                {job.platform_name && (
                  <span className="font-inter text-xs font-medium uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-secondary">
                    {job.platform_name}
                  </span>
                )}
              </div>
              <div className="font-inter text-sm font-semibold text-primary-navy flex items-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5" />
                {format(parseISO(job.appointment_time), "h:mm a")} · {job.signing_duration_mins} min
              </div>
              <div className="font-inter text-xs text-slate-secondary flex items-center gap-1.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{job.address}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={cn("font-sora font-bold text-2xl", feeColor)}>
                {formatCurrency(fee)}
              </div>
              <div className="font-inter text-[10px] text-muted">offered fee</div>
            </div>
          </div>

          {/* Navigate button */}
          <button
            onClick={() => {
              const encoded = encodeURIComponent(job.address);
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`, "_blank");
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary-navy text-white font-inter font-semibold text-sm rounded-8px h-11 hover:bg-navy-active transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Navigate to address
          </button>
        </div>

        {/* Net earnings breakdown */}
        <div>
          <span className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide block mb-2">
            Net earnings
          </span>
          <div className="grid grid-cols-3 gap-px bg-border rounded-10px overflow-hidden">
            <div className="bg-white p-3 text-center">
              <div className="font-sora font-bold text-base text-primary-navy">{formatCurrency(fee)}</div>
              <div className="font-inter text-[10px] text-muted mt-0.5">Offered fee</div>
            </div>
            <div className="bg-white p-3 text-center border-l border-border">
              <div className="font-sora font-bold text-base text-amber-warning">−{formatCurrency(mileageCost)}</div>
              <div className="font-inter text-[10px] text-muted mt-0.5">
                {formatMiles(mileageMiles)} × $0.67
              </div>
            </div>
            <div className="bg-white p-3 text-center border-l border-border">
              <div className={cn("font-sora font-bold text-base", netColor)}>{formatCurrency(net)}</div>
              <div className="font-inter text-[10px] text-muted mt-0.5">{formatCurrency(effectiveHourly)}/hr eff.</div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <span className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide block mb-2">
            Details
          </span>
          <div className="bg-white border border-border rounded-12px overflow-hidden">
            {[
              ["Client", job.client_name ?? "—"],
              ["Phone", job.client_phone ?? "—"],
              ["Platform", job.platform_name ?? "—"],
              ["Date", format(parseISO(job.appointment_time), "EEEE, MMMM d")],
              ["Start time", format(parseISO(job.appointment_time), "h:mm a")],
              ["Duration", `${job.signing_duration_mins} minutes`],
              ["Scanback", job.scanback_duration_mins > 0 ? `${job.scanback_duration_mins} min (auto-blocked)` : "None"],
              ["Anchor", job.route_sequence != null ? `Fixed — sequence #${job.route_sequence}` : "Not anchored"],
            ].map(([label, value], i, arr) => (
              <div key={label} className={cn("flex items-start justify-between px-4 py-3", i < arr.length - 1 ? "border-b border-border" : "")}>
                <span className="font-inter text-xs text-slate-secondary w-32 flex-shrink-0">{label}</span>
                <span className="font-inter text-sm font-medium text-primary-navy text-right flex-1">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {job.notes && (
          <div>
            <span className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide block mb-2">
              Notes
            </span>
            <div className="bg-white border border-border rounded-10px p-4">
              <p className="font-inter text-sm text-slate-secondary leading-relaxed">{job.notes}</p>
            </div>
          </div>
        )}

        {/* Scanback block */}
        {job.scanback_duration_mins > 0 && job.scanback_ends_at && (
          <div className="bg-scanback-bg border-l-3 border-l-amber-warning rounded-0  px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-warning" />
              <div>
                <div className="font-inter text-xs font-semibold text-amber-warning">Scanback auto-blocked</div>
                <div className="font-inter text-[11px] text-slate-secondary mt-0.5">
                  {job.scanback_ends_at ? `${format(parseISO(job.scanback_ends_at), "h:mm a")} · ${job.scanback_duration_mins} min` : "—"}
                </div>
              </div>
            </div>
            <span className="font-inter text-[10px] italic text-amber-warning">After this signing</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {job.status !== "COMPLETE" && (
            <Button onClick={handleMarkComplete} isLoading={updateStatus.isPending} className="bg-teal-success text-white hover:bg-teal-success/90">
              <CheckCircle2 className="w-4 h-4" />
              Mark complete
            </Button>
          )}
          <div className="flex gap-2">
            <Link
              href={`/jobs/${job.id}/edit`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-primary-navy text-primary-navy font-inter font-semibold text-sm rounded-8px h-11 px-4 hover:bg-bg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-red-danger/30 text-red-danger font-inter font-semibold text-sm rounded-8px h-11 px-4 hover:bg-red-danger/5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-danger/10 border border-red-danger/20 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-danger" />
            </div>
            <h2 className="font-sora font-bold text-lg text-primary-navy mb-2">Remove this job?</h2>
            <p className="font-inter text-sm text-slate-secondary leading-relaxed mb-5">
              This job and its scanback block will be removed. Your route and earnings for this day recalculate immediately.
            </p>
            <div className="bg-scanback-bg border border-amber-b rounded-10px p-3 mb-5 w-full text-left">
              <p className="font-inter text-xs text-amber-warning">
                Jobs are retained for 30 days before permanent deletion — you can recover it from Settings if needed.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button variant="destructive" onClick={handleDelete} isLoading={deleteJob.isPending}>
                Yes, remove job
              </Button>
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel — keep job
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
