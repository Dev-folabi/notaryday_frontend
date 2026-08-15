"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUpdateJobStatus } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import { jobsApi } from "@/api/jobs.api";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import {
  Clock,
  MapPin,
  Check,
  ChevronLeft,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import type { Job } from "@/types/job";

const SIGNING_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General Notarisation",
  LOAN_REFI: "Loan Signing",
  HYBRID: "Hybrid Signing",
  PURCHASE_CLOSING: "Purchase Closing",
  FIELD_INSPECTION: "Field Inspection",
  APOSTILLE: "Apostille",
};

function progressFromStatus(status: string): number {
  switch (status) {
    case "IN_PROGRESS":
      return 2;
    case "SCANNING":
      return 3;
    case "COMPLETE":
      return 4;
    default:
      return 1;
  }
}

export default function ActiveSigningPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const today = toDateInputValue(new Date());
  const updateStatus = useUpdateJobStatus();
  const queryClient = useQueryClient();
  const [manualOverride, setManualOverride] = useState<number | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", "active-today", today],
    queryFn: async () => {
      const res = await jobsApi.list({ date: today });
      const payload = (res as any).data ?? res;
      return (payload.data ?? payload) as Job[];
    },
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const activeJob =
    jobs.find((j) => j.status === "IN_PROGRESS") ||
    jobs.find((j) => j.status === "SCANNING") ||
    jobs.find((j) => j.status === "COMPLETE");

  const progress =
    manualOverride ?? progressFromStatus(activeJob?.status ?? "CONFIRMED");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-border border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="flex flex-col h-full">
        <div className="ph">
          <div className="ph-back" onClick={() => router.push("/day")}>
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Day View
          </div>
          <div className="ph-title">
            <Clock className="w-4 h-4 text-amber" /> Active signing
          </div>
          <span className="min-w-[60px]" />
        </div>
        <div className="con flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-bg border border-amber-border flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber" />
          </div>
          <p className="font-inter text-sm font-semibold text-primary-navy mb-1">
            No active signing right now
          </p>
          <p className="font-inter text-xs text-slate-secondary max-w-[260px] leading-relaxed mb-5">
            Start a confirmed job to track it live here. Go to a job and tap
            &ldquo;Start signing&rdquo; to activate this screen.
          </p>
          <button className="btn-s" onClick={() => router.push("/today")}>
            Back to Today
          </button>
        </div>
      </div>
    );
  }

  const fee = parseFloat(activeJob.fee ?? "0");
  const signingTypeLabel =
    SIGNING_TYPE_LABELS[activeJob.signing_type] ?? activeJob.signing_type;
  const needsScanback = (activeJob.scanback_duration_mins ?? 0) > 0;
  const startTime = format(parseISO(activeJob.appointment_time), "h:mm a");
  const scanbackDuration = activeJob.scanback_duration_mins ?? 0;
  const startedTime = activeJob.started_at
    ? format(parseISO(activeJob.started_at), "h:mm a")
    : null;
  const nextJob = jobs
    .filter(
      (j) =>
        j.status === "CONFIRMED" &&
        new Date(j.appointment_time) > new Date(activeJob.appointment_time),
    )
    .sort(
      (a, b) =>
        new Date(a.appointment_time).getTime() -
        new Date(b.appointment_time).getTime(),
    )[0];

  const advance = async (next: "SCANNING" | "COMPLETE") => {
    try {
      await updateStatus.mutateAsync({ id: activeJob.id, status: next });
      setManualOverride(null);
      await queryClient.invalidateQueries({
        queryKey: ["jobs", "active-today", today],
      });
      if (next === "SCANNING") {
        addToast({
          title: "Scanback started, ETA sent to next client",
          type: "info",
        });
      }
      if (next === "COMPLETE") {
        addToast({ title: "Signing complete, invoice draft ready", type: "success" });
      }
    } catch {
      addToast({ title: "Failed to update status", type: "error" });
    }
  };

  const resetProgress = async () => {
    try {
      if (activeJob.status === "SCANNING") {
        await updateStatus.mutateAsync({
          id: activeJob.id,
          status: "IN_PROGRESS",
        });
      }
      setManualOverride(null);
      await queryClient.invalidateQueries({
        queryKey: ["jobs", "active-today", today],
      });
      addToast({ title: "Progress reset", type: "info" });
    } catch {
      setManualOverride(2);
    }
  };

  const steps = [
    { label: "Navigated to location", time: startTime },
    { label: "Signing started", time: startedTime ?? undefined },
    { label: "Signing in progress", active: progress === 2 },
    {
      label: `Scanback (${scanbackDuration} min)`,
      dashed: true,
      disabled: !needsScanback,
    },
    { label: "Complete - Draft invoice", dashed: true, disabled: true },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-back" onClick={() => router.push("/day")}>
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Day View
        </div>
        <div className="ph-title">
          <Clock className="w-4 h-4 text-amber" /> Active signing
        </div>
        <span
          className="chip"
          style={{
            background: "#FFFBEB",
            color: "#D97706",
            border: "1px solid #FDE68A",
            fontSize: 9,
          }}
        >
          IN PROGRESS
        </span>
      </div>

      <div
        className="con"
        style={{ maxWidth: 560, margin: "0 auto", width: "100%" }}
      >
        {/* Active job card */}
        <div
          className="bg-white rounded-[14px] p-[18px] mb-4"
          style={{
            border: "2px solid #D97706",
            boxShadow: "0 4px 12px rgba(217,119,6,.12)",
          }}
        >
          <div className="flex justify-between gap-2.5 mb-3 flex-wrap">
            <div>
              <div className="font-sora text-[16px] font-bold text-primary-navy mb-0.5">
                {signingTypeLabel}
              </div>
              <div className="text-[12px] text-slate-secondary flex gap-1 items-center">
                <MapPin className="w-3 h-3 flex-shrink-0" /> {activeJob.address}
              </div>
            </div>
            <div className="text-right">
              <div className="font-sora text-[18px] font-bold text-teal">
                {formatCurrency(fee)}
              </div>
              <div className="text-[9px] text-muted">fee</div>
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-3.5">
            <span
              className={cn("chip", getTypeChipClass(activeJob.signing_type))}
            >
              {formatSigningType(activeJob.signing_type)}
            </span>
            {activeJob.platform_name && (
              <span className="chip c-plat">{activeJob.platform_name}</span>
            )}
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px]"
              style={{ background: "#EFF6FF", color: "#2563EB" }}
            >
              {startTime}
            </span>
          </div>

          <span className="slbl">Status transitions (one-tap)</span>
          <div className="flex flex-col gap-1.5">
            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isDone = progress >= stepNum && !step.disabled;
              const isCurrent = progress === stepNum - 1;
              const isFuture = progress < stepNum;
              return (
                <div
                  key={idx}
                  className="flex gap-2.5 items-center p-2.5 rounded-[8px]"
                  style={{
                    background: isDone
                      ? "var(--teal-bg)"
                      : isCurrent
                        ? "var(--amber-bg)"
                        : "var(--bg)",
                    border: isDone
                      ? "1px solid var(--teal-border)"
                      : isCurrent
                        ? "2px solid var(--amber)"
                        : "1px dashed var(--border)",
                    opacity: step.disabled && isFuture ? 0.5 : 1,
                  }}
                >
                  <div
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0"
                    style={{
                      background:
                        isDone || isCurrent
                          ? isDone
                            ? "#0E7B6C"
                            : "#D97706"
                          : "var(--border)",
                    }}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3" />
                    ) : isCurrent ? (
                      "⏱"
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className="text-[12px]"
                    style={{
                      fontWeight: isDone || isCurrent ? 600 : 400,
                      color: isDone
                        ? "#0E7B6C"
                        : isCurrent
                          ? "#D97706"
                          : "var(--slate2)",
                    }}
                  >
                    {step.label}
                  </span>
                  {step.time && (
                    <span className="ml-auto text-[10px] text-muted">
                      {step.time}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {progress === 2 && (
          <button
            className="w-full h-[52px] text-white border-none rounded-[10px] text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: "#0F2C4E", opacity: updateStatus.isPending ? 0.7 : 1 }}
            disabled={updateStatus.isPending}
            onClick={() => advance(needsScanback ? "SCANNING" : "COMPLETE")}
          >
            {updateStatus.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Saving…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Signing done - start scanback
              </>
            )}
          </button>
        )}

        {progress === 3 && (
          <div>
            <span className="slbl">Scanback countdown</span>
            <ScanbackCountdown
              job={activeJob}
              onDone={() => advance("COMPLETE")}
              isPending={updateStatus.isPending}
            />
          </div>
        )}

        {progress >= 4 && (
          <div
            className="text-center p-4 mb-4 rounded-[12px]"
            style={{
              background: "var(--teal-bg)",
              border: "1px solid var(--teal-border)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2.5 text-white"
              style={{ background: "#0E7B6C" }}
            >
              <Check className="w-6 h-6" />
            </div>
            <div className="font-sora text-[16px] font-bold text-primary-navy">
              Signing complete
            </div>
            <div className="text-[12px] text-slate-secondary mt-1">
              Invoice draft auto generated. Mileage logged. ETA sent to next
              client.
            </div>
            <button
              className="btn-p mt-3"
              onClick={() => router.push(`/invoices/new?jobId=${activeJob.id}`)}
            >
              View invoice
            </button>
          </div>
        )}

        {nextJob && (
          <div
            className="flex gap-2 p-2.5 rounded-[10px]"
            style={{
              background: "var(--blue-bg)",
              border: "1px solid var(--blue-border)",
            }}
          >
            <Info className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-secondary leading-[1.4]">
              When you tap Signing done, an ETA notification is sent to your
              next client:{" "}
              <strong className="text-primary-navy">
                Your notary is on their way - arriving approx{" "}
                {format(parseISO(nextJob.appointment_time), "h:mm a")}
              </strong>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button className="btn-gh" onClick={() => router.push("/day")}>
            Back to Day View
          </button>
          <button
            className="btn-gh"
            onClick={resetProgress}
            disabled={updateStatus.isPending}
          >
            Reset progress
          </button>
        </div>
      </div>
    </div>
  );
}

function getTypeChipClass(type: string): string {
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

function getScanbackEnd(job: { scanback_ends_at?: string | null; scanning_started_at?: string | null; scanback_duration_mins?: number | null }): number | null {
  if (job.scanback_ends_at) return new Date(job.scanback_ends_at).getTime();
  if (job.scanning_started_at && job.scanback_duration_mins) {
    return (
      new Date(job.scanning_started_at).getTime() +
      (job.scanback_duration_mins || 0) * 60_000
    );
  }
  return null;
}

function ScanbackCountdown({
  job,
  onDone,
  isPending,
}: {
  job: { scanback_ends_at?: string | null; scanning_started_at?: string | null; scanback_duration_mins?: number | null };
  onDone: () => void;
  isPending: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const end = getScanbackEnd(job);
  const startedMs = job.scanning_started_at
    ? new Date(job.scanning_started_at).getTime()
    : null;

  const totalMs =
    end && startedMs
      ? Math.max(end - startedMs, 1)
      : job.scanback_duration_mins
        ? job.scanback_duration_mins * 60_000
        : 1;

  const totalLabel = `${String(Math.floor(totalMs / 60_000)).padStart(2, "0")}:${String(Math.floor((totalMs % 60_000) / 1000)).padStart(2, "0")}`;

  const remainingMs = end ? Math.max(end - now, 0) : 0;
  const pct = totalMs > 0 ? Math.min(100, ((totalMs - remainingMs) / totalMs) * 100) : 0;

  const mm = Math.floor(remainingMs / 60_000);
  const ss = Math.floor((remainingMs % 60_000) / 1000);
  const remainingLabel = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  return (
    <div
      className="text-center p-[18px] mb-4 rounded-[12px]"
      style={{
        background: "#FEF3C7",
        border: "2px solid #D97706",
        borderLeft: "4px solid #D97706",
      }}
    >
      <div className="text-[11px] font-semibold text-amber mb-1">
        SCANBACK IN PROGRESS
      </div>
      <div className="font-sora text-[32px] font-bold text-primary-navy mb-0.5">
        {remainingLabel}
      </div>
      <div className="text-[11px] text-slate-secondary">
        of {totalLabel} remaining
      </div>
      <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-amber" style={{ width: `${pct}%` }} />
      </div>
      <button
        className="mt-3.5 text-white border-none rounded-[8px] h-[42px] px-5 text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
        style={{ background: "#0E7B6C", opacity: isPending ? 0.7 : 1 }}
        disabled={isPending}
        onClick={onDone}
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            Saving…
          </>
        ) : (
          <>
            <Check className="w-4 h-4" /> Scanback done
          </>
        )}
      </button>
    </div>
  );
}
