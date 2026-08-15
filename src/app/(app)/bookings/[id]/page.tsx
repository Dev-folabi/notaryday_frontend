"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import { cittApi } from "@/api/citt.api";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, unwrap, errMsg } from "@/lib/utils";
import { queryKeys } from "@/lib/queryClient";
import type { Booking } from "@/types/booking";
import { BookingStatus } from "@/types/booking";
import { format, parseISO } from "date-fns";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import ProGate from "@/components/ui/ProGate";
import type { CITCResult } from "@/hooks/useCITT";

type BookingAnalysis = {
  booking: Booking;
  dayJobs: {
    id: string;
    appointment_time: string;
    signing_ends_at: string | null;
    scanback_ends_at: string | null;
    address: string;
    client_name: string | null;
    signing_type: string;
  }[];
  conflictingJobIds: string[];
  service: { duration_mins: number; scanback_mins: number };
  drive: { drive_time_mins: number | null; drive_distance_miles: number | null };
  profitability: {
    fee: number;
    mileage_cost: number | null;
    net_earnings: number;
    effective_hourly: number;
    total_time_mins: number;
    buffer_mins: number;
  };
  buffer_mins: number;
};

type ExtendedCITT = CITCResult & {
  gap_before?: number | null;
  gap_after?: number | null;
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [altDraft, setAltDraft] = useState("");
  const [altTimes, setAltTimes] = useState<string[]>([]);

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: async () => unwrap<Booking>(await bookingApi.get(id)),
    enabled: !!id,
  });

  const isPending = booking?.status === BookingStatus.PENDING_REVIEW;

  const { data: analysis, isLoading: analysisLoading } = useQuery<BookingAnalysis>({
    queryKey: [...queryKeys.bookings.detail(id), "analysis"],
    queryFn: async () => unwrap<BookingAnalysis>(await bookingApi.analyze(id)),
    enabled: !!id && isPending,
  });

  const { data: cittResult, isLoading: cittLoading } = useQuery<ExtendedCITT>({
    queryKey: [...queryKeys.bookings.detail(id), "citt"],
    queryFn: async () => {
      const b = booking!;
      const fee = Number(b.base_fee) + Number(b.travel_fee_estimate ?? 0);
      const res = await cittApi.check({
        address: b.address,
        appointment_time: new Date(b.requested_time).toISOString(),
        signing_type: b.service_type,
        fee,
        platform_fee: 0,
      });
      return unwrap<ExtendedCITT>(res);
    },
    enabled: !!id && !!booking && isPending,
    retry: false,
  });

  const approve = useMutation({
    mutationFn: () => bookingApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      addToast({ type: "success", title: "Booking approved, client notified" });
      router.push("/bookings");
    },
    onError: (e) => addToast({ type: "error", title: errMsg(e, "Could not approve") }),
  });

  const decline = useMutation({
    mutationFn: () =>
      bookingApi.decline(id, { reason, alternative_times: altTimes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      addToast({ type: "info", title: "Booking declined" });
      router.push("/bookings");
    },
    onError: (e) => addToast({ type: "error", title: errMsg(e, "Could not decline") }),
  });

  const cancel = useMutation({
    mutationFn: () => bookingApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      addToast({ type: "success", title: "Booking cancelled" });
      router.push("/bookings");
    },
    onError: (e) => addToast({ type: "error", title: errMsg(e, "Could not cancel") }),
  });

  // Merged numbers: CITT is the primary source of truth for earnings/drive
  // figures it provides; analysis fills the rest; booking fee is last resort.
  const merged = useMemo(() => {
    const fee =
      Number(booking?.base_fee ?? 0) + Number(booking?.travel_fee_estimate ?? 0);

    const mileage_cost =
      cittResult?.mileage_cost != null
        ? cittResult.mileage_cost
        : analysis?.profitability.mileage_cost ?? null;

    const net_earnings =
      cittResult?.net_earnings != null
        ? cittResult.net_earnings
        : analysis?.profitability.net_earnings ?? fee;

    const effective_hourly =
      cittResult?.effective_hourly != null
        ? cittResult.effective_hourly
        : analysis?.profitability.effective_hourly ?? 0;

    const drive_distance_miles =
      cittResult?.drive_distance_miles != null
        ? cittResult.drive_distance_miles
        : analysis?.drive.drive_distance_miles ?? null;

    const drive_time_mins =
      cittResult?.drive_time_mins != null
        ? cittResult.drive_time_mins
        : analysis?.drive.drive_time_mins ?? null;

    const total_time_mins =
      (cittResult as (CITCResult & { total_job_mins?: number }) | undefined)
        ?.total_job_mins ?? analysis?.profitability.total_time_mins ?? 0;

    const buffer_mins = analysis?.profitability.buffer_mins ?? 0;

    const verdictClass =
      cittResult?.verdict === "TAKE_IT"
        ? "text-teal-success"
        : cittResult?.verdict === "RISKY"
        ? "text-amber-warning"
        : cittResult?.verdict === "DECLINE"
        ? "text-red-danger"
        : "text-teal-success";

    return {
      fee,
      mileage_cost,
      net_earnings,
      effective_hourly,
      drive_distance_miles,
      drive_time_mins,
      total_time_mins,
      buffer_mins,
      verdictClass,
    };
  }, [booking, cittResult, analysis]);

  const conflicting = useMemo(() => {
    if (!analysis) return [];
    const map = new Map(analysis.dayJobs.map((j) => [j.id, j]));
    return analysis.conflictingJobIds.map((cid) => map.get(cid)).filter(Boolean);
  }, [analysis]);

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  if (!booking)
    return <div className="p-8 text-center text-slate-secondary">Booking not found</div>;

  const name = booking.client_name ?? "Client";
  const hasConflicts = conflicting.length > 0;
  const analysisReady = !analysisLoading && !!analysis;
  const cittReady = !cittLoading && !!cittResult;
  const stillLoading = isPending && (analysisLoading || cittLoading);

  return (
    <ProGate feature="Booking page">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="ph">
          <div className="ph-back" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4" /> Back
          </div>
          <div className="ph-title">Review booking</div>
        </div>

        <div className="con">
          {/* Pending banner */}
          {isPending && (
            <div className="alert al-blue mb-4">
              <AlertTriangle className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
              <div className="font-inter text-[11px] leading-[1.4]">
                A client booked through your public page. Review the details,
                profitability and schedule check below, then approve or decline.
                The client will be notified via email.
              </div>
            </div>
          )}

          {/* ── Client details ── */}
          <span className="slbl">Client details</span>
          <div className="card p-3 mb-3.5">
            <div className="flex gap-2.5 mb-3 flex-wrap items-center">
              <div className="av" style={{ width: 36, height: 36, fontSize: 12 }}>
                {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-[160px]">
                <div className="font-inter text-[13px] font-semibold text-primary-navy">{name}</div>
                <div className="font-inter text-[11px] text-slate-secondary break-words">
                  {booking.client_email} · {booking.client_phone ?? "—"}
                </div>
              </div>
              <span
                className={`chip ${
                  isPending ? "c-hyb" :
                  booking.status === BookingStatus.CONFIRMED ? "c-paid" : ""
                }`}
                style={{
                  height: 20,
                  ...(booking.status === BookingStatus.DECLINED ||
                    booking.status === BookingStatus.CANCELLED_BY_CLIENT
                    ? { background: "var(--border)", color: "var(--slate)" }
                    : {}),
                }}
              >
                {booking.status?.replaceAll("_", " ")}
              </span>
            </div>
            <div className="h-px bg-border mb-2.5" />
            <div className="flex flex-col">
              {[
                ["Service", booking.service_type?.replaceAll("_", " ")],
                ["Date & time", format(new Date(booking.requested_time), "MMM d, yyyy '·' h:mm a")],
                ["Address", booking.address],
                ["Document type", booking.document_type ?? "—"],
                ["Notes", booking.notes || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col py-2 border-b border-border gap-0.5 last:border-b-0">
                  <span className="font-inter text-[10px] text-muted font-semibold tracking-[0.3px] uppercase">{label}</span>
                  <span className="font-inter text-[12px] text-primary-navy font-medium break-words leading-[1.4]">{value}</span>
                </div>
              ))}
              {booking.status === BookingStatus.DECLINED && booking.declined_reason && (
                <div className="flex flex-col py-2 gap-0.5">
                  <span className="font-inter text-[10px] text-muted font-semibold tracking-[0.3px] uppercase">Decline reason</span>
                  <span className="font-inter text-[12px] text-red-danger font-medium break-words leading-[1.4]">
                    {booking.declined_reason}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Unified analysis (only for pending) ── */}
          {isPending && (
            <>
              <span className="slbl">Booking analysis</span>
              <div className="card p-3 mb-3.5">
                {stillLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* ── Earnings row ── */}
                    <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-[8px] overflow-hidden mb-3">
                      <div className="bg-white text-center p-2.5">
                        <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Fee</div>
                        <div className="font-sora text-[16px] font-bold text-navy">
                          {formatCurrency(merged.fee)}
                        </div>
                      </div>
                      <div className="bg-white text-center p-2.5 border-l border-border">
                        <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Mileage cost</div>
                        <div className="font-sora text-[16px] font-bold text-amber-warning">
                          {merged.mileage_cost != null
                            ? `-${formatCurrency(merged.mileage_cost)}`
                            : "—"}
                        </div>
                        {merged.drive_distance_miles != null && (
                          <div className="font-inter text-[9px] text-slate-secondary">
                            ~{(merged.drive_distance_miles ?? 0).toFixed(1)} mi
                          </div>
                        )}
                      </div>
                      <div className="bg-white text-center p-2.5 border-l border-border">
                        <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Net earnings</div>
                        <div className={`font-sora text-[16px] font-bold ${merged.verdictClass}`}>
                          {formatCurrency(merged.net_earnings)}
                        </div>
                      </div>
                    </div>

                    {/* ── Detail rows ── */}
                    {(analysisReady || cittReady) && (
                      <div className="flex flex-col gap-1.5 mb-3 pb-3 border-b border-border">
                        {merged.drive_time_mins != null && (
                          <DetailRow
                            label="Drive time"
                            value={`${merged.drive_time_mins} min`}
                          />
                        )}
                        {merged.effective_hourly > 0 && (
                          <DetailRow
                            label="Effective hourly"
                            value={`${formatCurrency(merged.effective_hourly)}/hr`}
                            valueClass={merged.verdictClass}
                          />
                        )}
                        {merged.total_time_mins > 0 && (
                          <DetailRow
                            label="Total time"
                            value={`${Math.floor(merged.total_time_mins / 60)}h ${merged.total_time_mins % 60}m`}
                          />
                        )}
                        {analysisReady && (
                          <DetailRow
                            label="Signing duration"
                            value={`${analysis!.service.duration_mins} min${analysis!.service.scanback_mins > 0 ? ` + ${analysis!.service.scanback_mins} min scanback` : ""}`}
                          />
                        )}
                        {merged.buffer_mins > 0 && (
                          <DetailRow
                            label="Buffer"
                            value={`${merged.buffer_mins} min`}
                            valueClass="text-teal-success"
                          />
                        )}
                        {cittReady && (cittResult!.gap_before != null || cittResult!.gap_after != null) && (
                          <DetailRow
                            label="Schedule gaps"
                            value={[
                              cittResult!.gap_before != null && `${cittResult!.gap_before} min before`,
                              cittResult!.gap_after != null && `${cittResult!.gap_after} min after`,
                            ].filter(Boolean).join(" · ")}
                            valueClass={
                              (cittResult!.gap_before != null && cittResult!.gap_before < 0) ||
                              (cittResult!.gap_after != null && cittResult!.gap_after < 0)
                                ? "text-red-danger"
                                : "text-teal-success"
                            }
                          />
                        )}
                      </div>
                    )}

                    {/* ── CITT verdict pill ── */}
                    {cittReady && (
                      <CITTVerdict result={cittResult!} />
                    )}

                    {/* ── Schedule checks ── */}
                    <div className="flex flex-col gap-2 mt-3">
                      <CheckRow
                        ok={!hasConflicts}
                        label={
                          hasConflicts
                            ? `${conflicting.length} schedule conflict${conflicting.length > 1 ? "s" : ""}; overlaps existing signing block`
                            : "No schedule conflicts with existing signings"
                        }
                      />
                      {cittReady && (
                        <CheckRow
                          ok={!cittResult!.scanback_conflict}
                          label={
                            cittResult!.scanback_conflict
                              ? cittResult!.scanback_conflict_detail || "Scanback window conflict detected"
                              : "No scanback window conflicts"
                          }
                        />
                      )}
                      {cittReady && (
                        <CheckRow
                          ok={cittResult!.can_make_it}
                          label={
                            cittResult!.can_make_it
                              ? "Drive time fits, you can make it on time"
                              : "Insufficient drive time from previous location"
                          }
                        />
                      )}
                    </div>

                    {/* ── Day schedule context ── */}
                    {analysisReady && analysis!.dayJobs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="font-inter text-[10px] font-semibold text-muted uppercase tracking-[0.5px] mb-2">
                          Your schedule that day
                        </div>
                        {analysis!.dayJobs.map((j) => {
                          const isConflict = analysis!.conflictingJobIds.includes(j.id);
                          return (
                            <div
                              key={j.id}
                              className="flex gap-2 py-1.5 border-b border-border last:border-b-0"
                              style={isConflict ? { background: "var(--red-bg)", borderRadius: 4 } : {}}
                            >
                              <span className="font-inter text-[10px] text-muted w-[64px] flex-shrink-0">
                                {format(new Date(j.appointment_time), "h:mm a")}
                              </span>
                              <span
                                className={`font-inter text-[11px] ${
                                  isConflict ? "text-red-danger font-semibold" : "text-slate"
                                }`}
                              >
                                {j.signing_type?.replaceAll("_", " ")}
                                {isConflict ? " ← conflict" : ""}
                              </span>
                            </div>
                          );
                        })}
                        {/* Booking slot row */}
                        <div className="flex gap-2 py-1.5" style={{ background: "var(--blue-bg)", borderRadius: 4 }}>
                          <span className="font-inter text-[10px] text-blue font-semibold w-[64px] flex-shrink-0">
                            {format(new Date(booking.requested_time), "h:mm a")}
                          </span>
                          <span className="font-inter text-[11px] font-semibold text-blue">
                            ← This booking
                          </span>
                        </div>
                        {cittReady && cittResult!.next_job && (
                          <div className="flex gap-2 py-1.5 border-t border-border">
                            <span className="font-inter text-[10px] text-muted w-[64px] flex-shrink-0">
                              {format(new Date(cittResult!.next_job.time), "h:mm a")}
                            </span>
                            <span className="font-inter text-[11px] text-slate">
                              {cittResult!.next_job.type.replace(/_/g, " ")} · next
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Approve info note */}
              <div className="alert al-blue mb-4">
                <AlertTriangle className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
                <div className="font-inter text-[11px] leading-[1.4]">
                  Approving creates a confirmed job, sends a confirmation email to
                  the client, and updates your calendar and .ics feed.
                </div>
              </div>
            </>
          )}

          {/* ── Actions for PENDING_REVIEW ── */}
          {isPending && !declineOpen && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => approve.mutate()}
                disabled={approve.isPending}
                className="btn-teal"
              >
                <CheckCircle2 className="w-4 h-4" />
                {approve.isPending ? "Approving..." : "Approve booking"}
              </button>
              <button
                onClick={() => setDeclineOpen(true)}
                className="btn-gh"
                style={{ color: "var(--red)" }}
              >
                <XCircle className="w-4 h-4" /> Decline and suggest alternative times
              </button>
            </div>
          )}

          {/* ── Decline form ── */}
          {isPending && declineOpen && (
            <div className="card p-3.5 flex flex-col gap-3">
              <div className="font-inter text-[13px] font-semibold text-primary-navy">
                Decline booking
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-slate-secondary">
                  Reason (optional)
                </label>
                <textarea
                  placeholder="e.g. Already booked that day"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="ta"
                  style={{ minHeight: 64 }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-slate-secondary">
                  Alternative times (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={altDraft}
                    onChange={(e) => setAltDraft(e.target.value)}
                    className="inp flex-1"
                    style={{ height: 40 }}
                  />
                  <button
                    onClick={() => {
                      if (!altDraft) return;
                      setAltTimes((prev) => [...prev, new Date(altDraft).toISOString()]);
                      setAltDraft("");
                    }}
                    className="bg-blue text-white border border-blue rounded-[8px] h-[34px] font-inter text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 px-3 whitespace-nowrap transition-colors hover:bg-blue-hover"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {altTimes.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {altTimes.map((t, i) => (
                      <div
                        key={t}
                        className="flex items-center justify-between bg-background border border-border rounded-[6px] px-3 py-2"
                      >
                        <span className="font-inter text-[12px] text-primary-navy">
                          {format(parseISO(t), "EEE, MMM d '·' h:mm a")}
                        </span>
                        <button onClick={() => setAltTimes((prev) => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-3.5 h-3.5 text-slate-secondary" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => decline.mutate()}
                  disabled={decline.isPending}
                  className="flex-1 btn-teal"
                  style={{ background: "var(--red)", borderColor: "var(--red)" }}
                >
                  {decline.isPending ? "Declining..." : "Decline"}
                </button>
                <button onClick={() => setDeclineOpen(false)} className="btn-gh">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Cancel action for CONFIRMED ── */}
          {booking.status === BookingStatus.CONFIRMED && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => cancel.mutate()}
                disabled={cancel.isPending}
                className="btn-gh"
                style={{ color: "var(--red)" }}
              >
                <XCircle className="w-4 h-4" />
                {cancel.isPending ? "Cancelling..." : "Cancel booking"}
              </button>
            </div>
          )}
        </div>
      </div>
    </ProGate>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  valueClass = "text-navy",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-inter text-[11px] text-slate-secondary">{label}</span>
      <span className={`font-inter text-[11px] font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-px"
        style={{
          background: ok ? "var(--teal-bg)" : "var(--red-bg)",
          color: ok ? "var(--teal)" : "var(--red)",
        }}
      >
        {ok ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
      </span>
      <span className="font-inter text-[11px] text-slate leading-[1.4]">{label}</span>
    </div>
  );
}

function CITTVerdict({ result }: { result: ExtendedCITT }) {
  const isTakeIt = result.verdict === "TAKE_IT";
  const isRisky  = result.verdict === "RISKY";

  const bg    = isTakeIt ? "var(--teal-bg)"   : isRisky ? "var(--amber-bg)"   : "var(--red-bg)";
  const bdr   = isTakeIt ? "var(--teal-b)"    : isRisky ? "var(--amber-b)"    : "var(--red-b)";
  const color = isTakeIt ? "var(--teal)"      : isRisky ? "var(--amber)"      : "var(--red)";
  const label = isTakeIt ? "TAKE IT"          : isRisky ? "RISKY"             : "DECLINE";
  const Icon  = isTakeIt ? Check              : isRisky ? AlertTriangle        : X;

  return (
    <div
      className="flex items-start gap-2.5 rounded-[8px] p-2.5 mb-3"
      style={{ background: bg, border: `1px solid ${bdr}` }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-px"
        style={{ background: color }}
      >
        <Icon className="w-3.5 h-3.5 text-white" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Zap className="w-3 h-3" style={{ color }} />
          <span className="font-inter text-[11px] font-semibold" style={{ color }}>
            CITT · {label}
          </span>
        </div>
        <span className="font-inter text-[11px] text-slate-secondary leading-[1.4]">
          {result.reason}
        </span>
      </div>
    </div>
  );
}
