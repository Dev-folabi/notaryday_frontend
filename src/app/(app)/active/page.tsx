"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUpdateJobStatus } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import { jobsApi } from "@/api/jobs.api";
import { invoicesApi } from "@/api/invoices.api";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import {
  Clock,
  MapPin,
  Navigation,
  ChevronLeft,
  CheckCircle2,
  Scan,
  AlertCircle,
  FileText,
} from "lucide-react";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Job } from "@/types/job";

const SIGNING_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General Notarisation",
  LOAN_REFI: "Loan Signing (Refi)",
  HYBRID: "Hybrid Signing",
  PURCHASE_CLOSING: "Purchase Closing",
  FIELD_INSPECTION: "Field Inspection",
  APOSTILLE: "Apostille",
};

// The ordered steps of an active signing
const STEPS = [
  { key: "navigated", label: "Navigated to location" },
  { key: "started", label: "Signing started" },
  { key: "in_progress", label: "Signing in progress…", isActive: true },
  { key: "scanning", label: "Scanback in progress" },
  { key: "complete", label: "Signing complete" },
];

function progressFromStatus(status: string): number {
  switch (status) {
    case "IN_PROGRESS":
      return 2; // navigated + started done, in-progress is active step
    case "SCANNING":
      return 3;
    case "COMPLETE":
      return 4;
    default:
      return 1;
  }
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(
    differenceInMinutes(new Date(), parseISO(startedAt))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(differenceInMinutes(new Date(), parseISO(startedAt)));
    }, 60_000);
    return () => clearInterval(id);
  }, [startedAt]);

  const h = Math.floor(elapsed / 60);
  const m = elapsed % 60;
  return (
    <span className="font-sora font-bold text-amber-warning">
      {h > 0 ? `${h}h ` : ""}{m}m elapsed
    </span>
  );
}

export default function ActiveSigningPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const today = toDateInputValue(new Date());
  const updateStatus = useUpdateJobStatus();
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Fetch today's jobs to find IN_PROGRESS or SCANNING
  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ["jobs", "active-today", today],
    queryFn: async () => {
      const res = await jobsApi.list({ date: today });
      const payload = (res as any).data ?? res;
      return (payload.data ?? payload) as Job[];
    },
    refetchInterval: 30_000, // poll every 30s for status changes
    staleTime: 10_000,
  });

  // Prefer IN_PROGRESS, fall back to SCANNING
  const activeJob =
    jobs.find((j) => j.status === "IN_PROGRESS") ||
    jobs.find((j) => j.status === "SCANNING");

  const progress = activeJob ? progressFromStatus(activeJob.status) : 0;
  const needsScanback =
    activeJob && (activeJob.scanback_duration_mins ?? 0) > 0;

  const handleAdvanceStatus = async (nextStatus: "SCANNING" | "COMPLETE") => {
    if (!activeJob) return;
    try {
      await updateStatus.mutateAsync({ id: activeJob.id, status: nextStatus });
      await refetch();

      if (nextStatus === "SCANNING") {
        addToast({ title: "Scanback started — ETA sent to next client", type: "info" });
      }

      if (nextStatus === "COMPLETE") {
        addToast({ title: "Signing complete — generating invoice…", type: "success" });
        setGeneratingInvoice(true);
        try {
          await invoicesApi.generate(activeJob.id);
          addToast({ title: "Invoice generated — review it in Invoices", type: "success" });
        } catch {
          // invoice may already exist — not fatal
        } finally {
          setGeneratingInvoice(false);
        }
        router.push("/invoices");
      }
    } catch {
      addToast({ title: "Failed to update status", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-border border-t-amber-warning rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center gap-3 flex-shrink-0">
          <Link
            href="/today"
            className="flex items-center gap-1 font-inter text-[12px] font-medium text-slate-secondary hover:text-primary-navy transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Today
          </Link>
          <span className="text-border">|</span>
          <h1 className="font-sora font-bold text-[17px] text-primary-navy flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-warning" />
            Active Signing
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-bg border border-amber-border flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-warning" />
          </div>
          <p className="font-inter text-sm font-semibold text-primary-navy mb-1">
            No active signing right now
          </p>
          <p className="font-inter text-xs text-slate-secondary max-w-[260px] leading-relaxed mb-5">
            Start a confirmed job to track it live here. Go to a job and tap
            &ldquo;Start signing&rdquo; to activate this screen.
          </p>
          <Link
            href="/today"
            className="inline-flex items-center gap-1.5 h-10 px-5 bg-primary-navy text-white rounded-[9px] font-inter text-sm font-semibold hover:bg-navy-active transition-colors"
          >
            Back to Today
          </Link>
        </div>
      </div>
    );
  }

  const fee = parseFloat(activeJob.fee ?? "0");
  const netEarnings = parseFloat(activeJob.net_earnings ?? "0");
  const mileageCost = parseFloat(activeJob.mileage_cost ?? "0");
  const signingTypeLabel =
    SIGNING_TYPE_LABELS[activeJob.signing_type] ?? activeJob.signing_type;

  // Determine which step is the actionable CTA
  const isScanning = activeJob.status === "SCANNING";
  const isInProgress = activeJob.status === "IN_PROGRESS";

  const mapsUrl = activeJob.lat && activeJob.lng
    ? `https://maps.google.com/?q=${activeJob.lat},${activeJob.lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(activeJob.address)}`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/today"
            className="flex items-center gap-1 font-inter text-[12px] font-medium text-slate-secondary hover:text-primary-navy transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Today
          </Link>
          <span className="text-border">|</span>
          <h1 className="font-sora font-bold text-[17px] text-primary-navy flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-warning" />
            Active Signing
          </h1>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 bg-amber-bg border border-amber-border rounded-full text-[10px] font-bold text-amber-warning uppercase tracking-wide">
          {isScanning ? "Scanback" : "In Progress"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 max-w-lg mx-auto space-y-4">

          {/* Job card — amber border highlight */}
          <div className="bg-white border-2 border-amber-warning rounded-[14px] p-5 shadow-[0_4px_12px_rgba(217,119,6,0.12)]">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <p className="font-sora font-bold text-[17px] text-primary-navy mb-1">
                  {signingTypeLabel}
                </p>
                <div className="flex items-center gap-1.5 text-slate-secondary mb-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-inter text-[12px] truncate">
                    {activeJob.address}
                  </span>
                </div>
                {activeJob.client_name && (
                  <p className="font-inter text-[12px] text-slate-secondary">
                    Client: <span className="font-medium text-primary-navy">{activeJob.client_name}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 bg-blue-bg text-interactive-blue text-[10px] font-semibold px-2 py-0.5 rounded-[4px]">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(activeJob.appointment_time), "h:mm a")}
                  </span>
                  <span className="font-inter text-[10px] text-slate-secondary">
                    {activeJob.signing_duration_mins} min signing
                    {needsScanback
                      ? ` + ${activeJob.scanback_duration_mins} min scanback`
                      : ""}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-sora font-bold text-[20px] text-teal-success block">
                  {formatCurrency(fee)}
                </span>
                {netEarnings > 0 && (
                  <span className="font-inter text-[10px] text-slate-secondary">
                    ~{formatCurrency(netEarnings)} net
                  </span>
                )}
              </div>
            </div>

            {/* Elapsed timer */}
            {activeJob.started_at && (
              <div className="flex items-center gap-2 p-2 bg-amber-bg rounded-[8px] mb-4">
                <Clock className="w-3.5 h-3.5 text-amber-warning" />
                <ElapsedTimer startedAt={activeJob.started_at} />
                <span className="font-inter text-[11px] text-amber-warning ml-1">
                  since signing started
                </span>
              </div>
            )}

            {/* Navigate button */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-10 border border-border rounded-[9px] font-inter text-[12px] font-semibold text-slate-secondary hover:border-primary-navy hover:text-primary-navy transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Navigate to signing
            </a>
          </div>

          {/* Status progression steps */}
          <div className="bg-white border border-border rounded-[12px] p-5">
            <p className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wider mb-4">
              Status — tap to advance
            </p>
            <div className="flex flex-col gap-2">
              {STEPS.filter(
                (s) => s.key !== "scanning" || needsScanback
              ).map((step, idx) => {
                // Map step index to progress value
                const stepProgress = idx + 1;
                const isDone = progress > stepProgress;
                const isCurrentActive =
                  progress === stepProgress ||
                  (step.isActive && progress === stepProgress);
                const isFuture = progress < stepProgress;

                return (
                  <div
                    key={step.key}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-[8px] transition-colors",
                      isDone
                        ? "bg-teal-bg border border-teal-border"
                        : isCurrentActive
                          ? "bg-amber-bg border-2 border-amber-warning"
                          : "bg-bg border border-dashed border-border opacity-50"
                    )}
                  >
                    {/* Step indicator */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold",
                        isDone
                          ? "bg-teal-success text-white"
                          : isCurrentActive
                            ? "bg-amber-warning text-white"
                            : "bg-border text-muted"
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isCurrentActive && step.isActive ? (
                        <span className="animate-pulse">⏱</span>
                      ) : (
                        <span>{stepProgress}</span>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "font-inter text-[12px] flex-1",
                        isDone
                          ? "text-teal-success font-semibold"
                          : isCurrentActive
                            ? "text-amber-warning font-bold"
                            : "text-slate-secondary"
                      )}
                    >
                      {step.label}
                    </span>

                    {/* Timestamp */}
                    {isDone && step.key === "navigated" && activeJob.started_at && (
                      <span className="font-inter text-[10px] text-muted">
                        {format(parseISO(activeJob.started_at), "h:mm a")}
                      </span>
                    )}
                    {isDone && step.key === "started" && activeJob.started_at && (
                      <span className="font-inter text-[10px] text-muted">
                        {format(parseISO(activeJob.started_at), "h:mm a")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA — advance status */}
          {isInProgress && (
            <div className="space-y-2">
              {needsScanback ? (
                <button
                  onClick={() => handleAdvanceStatus("SCANNING")}
                  disabled={updateStatus.isPending}
                  className="w-full h-12 bg-amber-warning text-white rounded-[10px] font-inter font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {updateStatus.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Scan className="w-5 h-5" />
                  )}
                  Signing done — start scanback
                </button>
              ) : (
                <button
                  onClick={() => handleAdvanceStatus("COMPLETE")}
                  disabled={updateStatus.isPending || generatingInvoice}
                  className="w-full h-12 bg-teal-success text-white rounded-[10px] font-inter font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {updateStatus.isPending || generatingInvoice ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Mark signing complete
                </button>
              )}
              <Link
                href={`/jobs/${activeJob.id}`}
                className="flex items-center justify-center gap-1.5 h-10 border border-border rounded-[9px] font-inter text-[12px] font-semibold text-slate-secondary hover:border-slate-secondary transition-colors"
              >
                <FileText className="w-4 h-4" />
                View full job detail
              </Link>
            </div>
          )}

          {isScanning && (
            <div className="space-y-2">
              {/* Scanback info */}
              <div className="flex items-start gap-2.5 p-3 bg-amber-bg border border-amber-border rounded-[10px]">
                <Scan className="w-4 h-4 text-amber-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-inter text-[12px] font-semibold text-amber-warning mb-0.5">
                    Scanback in progress
                  </p>
                  <p className="font-inter text-[11px] text-amber-600 leading-relaxed">
                    {activeJob.scanback_duration_mins} minutes. Scan and upload
                    documents, then mark complete when done.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAdvanceStatus("COMPLETE")}
                disabled={updateStatus.isPending || generatingInvoice}
                className="w-full h-12 bg-teal-success text-white rounded-[10px] font-inter font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {updateStatus.isPending || generatingInvoice ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                Scanback done — mark complete
              </button>
              <Link
                href={`/jobs/${activeJob.id}`}
                className="flex items-center justify-center gap-1.5 h-10 border border-border rounded-[9px] font-inter text-[12px] font-semibold text-slate-secondary hover:border-slate-secondary transition-colors"
              >
                <FileText className="w-4 h-4" />
                View full job detail
              </Link>
            </div>
          )}

          {/* Earnings preview */}
          {(fee > 0 || netEarnings > 0) && (
            <div className="bg-white border border-border rounded-[12px] p-4">
              <p className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wider mb-3">
                This signing
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <span className="font-sora font-bold text-[16px] text-slate-body block">
                    {formatCurrency(fee)}
                  </span>
                  <span className="font-inter text-[10px] text-muted">Offered</span>
                </div>
                <div className="text-center">
                  <span className="font-sora font-bold text-[16px] text-amber-warning block">
                    −{formatCurrency(mileageCost)}
                  </span>
                  <span className="font-inter text-[10px] text-muted">Mileage</span>
                </div>
                <div className="text-center">
                  <span className="font-sora font-bold text-[16px] text-teal-success block">
                    {formatCurrency(netEarnings)}
                  </span>
                  <span className="font-inter text-[10px] text-muted">Net</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
