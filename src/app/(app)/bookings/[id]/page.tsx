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
  Sparkles,
  X,
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
  drive: {
    drive_time_mins: number | null;
    drive_distance_miles: number | null;
  };
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

  const { data: analysis, isLoading: analysisLoading } = useQuery<BookingAnalysis>(
    {
      queryKey: [...queryKeys.bookings.detail(id), "analysis"],
      queryFn: async () =>
        unwrap<BookingAnalysis>(await bookingApi.analyze(id)),
      enabled: !!id && booking?.status === BookingStatus.PENDING_REVIEW,
    },
  );

  // Run CITT for pending-review bookings so the notary gets a full
  // profitability + schedule verdict alongside the booking details.
  const { data: cittResult, isLoading: cittLoading } = useQuery<CITCResult>({
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
      return unwrap<CITCResult>(res);
    },
    enabled: !!id && !!booking && booking.status === BookingStatus.PENDING_REVIEW,
    retry: false,
  });

  const approve = useMutation({
    mutationFn: () => bookingApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      addToast({ type: "success", title: "Booking approved — client notified" });
      router.push("/bookings");
    },
    onError: (e) =>
      addToast({ type: "error", title: errMsg(e, "Could not approve") }),
  });

  const decline = useMutation({
    mutationFn: () => bookingApi.decline(id, { reason, alternative_times: altTimes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      addToast({ type: "info", title: "Booking declined" });
      router.push("/bookings");
    },
    onError: (e) =>
      addToast({ type: "error", title: errMsg(e, "Could not decline") }),
  });

  const cancel = useMutation({
    mutationFn: () => bookingApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      addToast({ type: "success", title: "Booking cancelled" });
      router.push("/bookings");
    },
    onError: (e) =>
      addToast({ type: "error", title: errMsg(e, "Could not cancel") }),
  });

  const profitability = useMemo(() => {
    if (analysis) return analysis.profitability;
    if (!booking) return null;
    const fee =
      Number(booking.base_fee) + Number(booking.travel_fee_estimate ?? 0);
    return { fee, mileage_cost: null, net_earnings: fee, effective_hourly: 0, total_time_mins: 0, buffer_mins: 0 };
  }, [analysis, booking]);

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
    return (
      <div className="p-8 text-center text-slate-secondary">Booking not found</div>
    );

  const name = booking.client_name ?? "Client";
  const hasConflicts = conflicting.length > 0;

  return (
    <ProGate feature="Booking page">
      <div className="flex flex-col h-full">
        <div className="ph">
          <div className="ph-back" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4" /> Back
          </div>
          <div className="ph-title">Review booking</div>
        </div>

        <div className="con">
          {booking.status === BookingStatus.PENDING_REVIEW && (
            <div className="alert al-blue mb-4">
              <AlertTriangle className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
              <div className="font-inter text-[11px] leading-[1.4]">
                A client booked through your public page. Review the complete details
                including profitability and schedule conflict check before approving.
                Client will be notified via email.
              </div>
            </div>
          )}

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
              <span className="chip c-hyb" style={{ height: 20 }}>{booking.status?.replaceAll("_", " ")}</span>
            </div>
            <div className="h-px bg-border mb-2.5" />
            <div className="flex flex-col gap-0">
              {[
                ["Service", booking.service_type?.replaceAll("_", " ")],
                ["Date & time", format(new Date(booking.requested_time), "MMM d, yyyy '·' h:mm a")],
                ["Address", booking.address],
                ["Document type", booking.document_type ?? "—"],
                ["Client phone", booking.client_phone ?? "—"],
                ["Client email", booking.client_email],
                ["Notes", booking.notes ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col py-2 border-b border-border gap-0.5">
                  <span className="font-inter text-[10px] text-muted font-semibold tracking-[0.3px] uppercase">
                    {label}
                  </span>
                  <span className="font-inter text-[12px] text-primary-navy font-medium break-words leading-[1.4]">
                    {value}
                  </span>
                </div>
              ))}
              {booking.status === BookingStatus.DECLINED && booking.declined_reason && (
                <div className="flex flex-col py-2 gap-0.5">
                  <span className="font-inter text-[10px] text-muted font-semibold tracking-[0.3px] uppercase">
                    Decline reason
                  </span>
                  <span className="font-inter text-[12px] text-red-danger font-medium break-words leading-[1.4]">
                    {booking.declined_reason}
                  </span>
                </div>
              )}
            </div>
          </div>

          <span className="slbl">Profitability estimate</span>
          <div className="card p-3 mb-3.5">
            {analysisLoading && !profitability ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
              </div>
            ) : profitability ? (
              <>
                <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-[8px] overflow-hidden mb-3">
                  <div className="bg-white text-center p-2">
                    <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Fee</div>
                    <div className="font-sora text-[16px] font-bold text-navy">{formatCurrency(profitability.fee)}</div>
                  </div>
                  <div className="bg-white text-center p-2 border-l border-border">
                    <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Mileage cost</div>
                    <div className="font-sora text-[16px] font-bold text-amber-warning">
                      {profitability.mileage_cost != null
                        ? `-${formatCurrency(profitability.mileage_cost)}`
                        : "—"}
                    </div>
                    {analysis?.drive.drive_distance_miles != null && (
                      <div className="font-inter text-[9px] text-slate-secondary">
                        ~{analysis.drive.drive_distance_miles.toFixed(1)} mi at $0.67
                      </div>
                    )}
                  </div>
                  <div className="bg-white text-center p-2 border-l border-border">
                    <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Net earnings</div>
                    <div className="font-sora text-[16px] font-bold text-teal-success">{formatCurrency(profitability.net_earnings)}</div>
                  </div>
                </div>
                {analysis && (
                  <>
                    <div className="h-px bg-border mb-2.5" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="font-inter text-[11px] text-slate-secondary">Drive time from previous job</span>
                        <span className="font-inter text-[11px] font-semibold text-navy">
                          {analysis.drive.drive_time_mins != null ? `${analysis.drive.drive_time_mins} min` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-inter text-[11px] text-slate-secondary">Effective hourly rate</span>
                        <span className="font-inter text-[11px] font-semibold text-teal-success">
                          {profitability.effective_hourly > 0 ? `${formatCurrency(profitability.effective_hourly)}/hr` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-inter text-[11px] text-slate-secondary">Total time</span>
                        <span className="font-inter text-[11px] font-semibold text-navy">
                          {profitability.total_time_mins > 0
                            ? `${Math.floor(profitability.total_time_mins / 60)}h ${profitability.total_time_mins % 60}m`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-inter text-[11px] text-slate-secondary">Signing duration</span>
                        <span className="font-inter text-[11px] font-semibold text-navy">
                          {analysis.service.duration_mins} min
                          {analysis.service.scanback_mins > 0
                            ? ` + ${analysis.service.scanback_mins} min scanback`
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-inter text-[11px] text-slate-secondary">Buffer after block</span>
                        <span className="font-inter text-[11px] font-semibold text-teal-success">
                          {analysis.buffer_mins > 0 ? `${analysis.buffer_mins} min buffer` : "No buffer set"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : null}
          </div>

          {booking.status === BookingStatus.PENDING_REVIEW && (
            <>
              <span className="slbl">Schedule conflict check</span>
              {analysisLoading ? (
                <div className="flex justify-center py-6 mb-3.5">
                  <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                </div>
              ) : analysis ? (
                <>
                  <div className={`alert ${hasConflicts ? "al-red" : "al-teal"} mb-3.5`}>
                    {hasConflicts ? (
                      <AlertTriangle className="w-4 h-4 text-red-danger flex-shrink-0 mt-0.5" />
                    ) : (
                      <Check className="w-4 h-4 text-teal-success flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-inter text-[12px] font-semibold text-navy mb-0.5">
                        {hasConflicts ? `${conflicting.length} schedule conflict${conflicting.length > 1 ? "s" : ""} found` : "No conflicts"}
                      </div>
                      <div className="font-inter text-[11px] text-slate-secondary leading-[1.4]">
                        {hasConflicts
                          ? "This booking overlaps an existing signing block (incl. scanback and buffer)."
                          : "This booking fits your existing schedule with no overlap. Drive time estimated via OpenRouteService."}
                        {analysis.drive.drive_time_mins != null && ` Drive time: ${analysis.drive.drive_time_mins} min.`}
                        {analysis.buffer_mins > 0 && ` ${analysis.buffer_mins} min buffer applied.`}
                      </div>
                    </div>
                  </div>

                  {analysis.dayJobs.length > 0 && (
                    <div className="card p-2.5 mb-3.5">
                      <div className="font-inter text-[11px] font-semibold text-navy mb-1.5">Your schedule that day</div>
                      {analysis.dayJobs.map((j) => {
                        const isConflict = analysis.conflictingJobIds.includes(j.id);
                        return (
                          <div
                            key={j.id}
                            className={`flex gap-2 py-1.5 border-b border-border ${isConflict ? "bg-red-50" : ""}`}
                          >
                            <span className="font-inter text-[10px] text-muted w-[70px]">
                              {format(new Date(j.appointment_time), "h:mm a")}
                            </span>
                            <span className={`font-inter text-[11px] ${isConflict ? "text-red-danger font-semibold" : "text-slate"}`}>
                              {j.signing_type?.replaceAll("_", " ")} — {j.address}
                              {isConflict ? "  ← overlap" : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : null}

              {/* ── CITT Verdict ── */}
              <span className="slbl">CITT check</span>
              {cittLoading ? (
                <div className="flex justify-center py-6 mb-3.5">
                  <div className="w-5 h-5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
                </div>
              ) : cittResult ? (
                <CITTVerdictInline result={cittResult} />
              ) : (
                <div className="alert al-blue mb-3.5">
                  <Sparkles className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
                  <div className="font-inter text-[11px] leading-[1.4]">
                    CITT could not run — home base may not be configured or address could not be geocoded.
                  </div>
                </div>
              )}

              {booking.status === BookingStatus.PENDING_REVIEW && (
                <div className="alert al-blue mb-4">
                  <AlertTriangle className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
                  <div className="font-inter text-[11px] leading-[1.4]">
                    Approving will create a confirmed job, send confirmation email to
                    client, and update your calendar and .ics feed. Client will receive
                    booking ref and reminder 24 hours before.
                  </div>
                </div>
              )}
            </>
          )}

          {booking.status === BookingStatus.PENDING_REVIEW && !declineOpen && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => approve.mutate()}
                disabled={approve.isPending}
                className="btn-teal"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve booking
              </button>
              <button
                onClick={() => setDeclineOpen(true)}
                disabled={decline.isPending}
                className="btn-gh"
                style={{ color: "var(--red)" }}
              >
                <XCircle className="w-4 h-4" /> Decline — suggest alternative times
              </button>
            </div>
          )}

          {declineOpen && (
            <div className="card p-3.5 flex flex-col gap-3">
              <div className="font-inter text-[13px] font-semibold text-primary-navy">
                Decline booking
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-slate-body">
                  Reason (optional)
                </label>
                <textarea
                  placeholder="e.g. Already booked that day"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full min-h-[64px] border border-border rounded-8px p-3 font-inter text-sm resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-slate-body">
                  Alternative times (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={altDraft}
                    onChange={(e) => setAltDraft(e.target.value)}
                    className="flex-1 h-11 border border-border rounded-8px px-3 font-inter text-sm"
                  />
                  <button
                    onClick={() => {
                      if (!altDraft) return;
                      setAltTimes((prev) => [...prev, new Date(altDraft).toISOString()]);
                      setAltDraft("");
                    }}
                    className="btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {altTimes.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {altTimes.map((t, i) => (
                      <div key={t} className="flex items-center justify-between bg-background border border-border rounded-[6px] px-3 py-2">
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
                  className="flex-1 bg-red-danger text-white rounded-8px h-11 font-inter font-semibold text-sm"
                >
                  {decline.isPending ? "Declining..." : "Confirm decline"}
                </button>
                <button
                  onClick={() => setDeclineOpen(false)}
                  className="btn-gh"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {booking.status === BookingStatus.CONFIRMED && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => cancel.mutate()}
                disabled={cancel.isPending}
                className="btn-gh"
                style={{ color: "var(--red)" }}
              >
                <XCircle className="w-4 h-4" /> Cancel booking
              </button>
            </div>
          )}
        </div>
      </div>
    </ProGate>
  );
}

// ── Inline CITT verdict card (read-only, no "add to my day" actions) ────────

function CITTVerdictInline({ result }: { result: CITCResult }) {
  const {
    verdict,
    reason,
    net_earnings = 0,
    mileage_cost = 0,
    drive_distance_miles = 0,
    drive_time_mins = 0,
    effective_hourly = 0,
    can_make_it = true,
    scanback_conflict = false,
    scanback_conflict_detail = "",
    prev_job = null,
    next_job = null,
    gap_before,
    gap_after,
  } = result as CITCResult & { gap_before?: number | null; gap_after?: number | null };

  const isTakeIt = verdict === "TAKE_IT";
  const isRisky  = verdict === "RISKY";
  const isDecline = verdict === "DECLINE";

  const verdictColor = isTakeIt
    ? "text-teal-success"
    : isRisky
    ? "text-amber-warning"
    : "text-red-danger";

  const alertCls = isTakeIt ? "al-teal" : isRisky ? "al-amber" : "al-red";

  const VerdictIcon = isTakeIt ? Check : isRisky ? AlertTriangle : X;

  return (
    <div className="card p-3 mb-3.5">
      {/* Verdict header */}
      <div className={`alert ${alertCls} mb-3`}>
        <VerdictIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${verdictColor}`} />
        <div>
          <div className={`font-inter text-[12px] font-semibold mb-0.5 ${verdictColor}`}>
            {isTakeIt ? "TAKE IT" : isRisky ? "RISKY" : "DECLINE"}
          </div>
          <div className="font-inter text-[11px] text-slate-secondary leading-[1.4]">
            {reason}
          </div>
        </div>
      </div>

      {/* Earnings row */}
      <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-[8px] overflow-hidden mb-3">
        <div className="bg-white text-center p-2">
          <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Mileage cost</div>
          <div className="font-sora text-[15px] font-bold text-amber-warning">
            -{formatCurrency(mileage_cost)}
          </div>
          <div className="font-inter text-[9px] text-slate-secondary">
            ~{(drive_distance_miles ?? 0).toFixed(1)} mi rt
          </div>
        </div>
        <div className="bg-white text-center p-2 border-l border-border">
          <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Net earnings</div>
          <div className={`font-sora text-[15px] font-bold ${verdictColor}`}>
            {formatCurrency(net_earnings)}
          </div>
        </div>
        <div className="bg-white text-center p-2 border-l border-border">
          <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Effective $/hr</div>
          <div className="font-sora text-[15px] font-bold text-navy">
            {formatCurrency(effective_hourly)}/hr
          </div>
          <div className="font-inter text-[9px] text-slate-secondary">
            {drive_time_mins} min drive
          </div>
        </div>
      </div>

      {/* Checks */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${can_make_it ? "bg-teal-bg text-teal-success" : "bg-red-50 text-red-danger"}`}>
            {can_make_it ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
          </span>
          <span className="font-inter text-[11px] text-slate">
            Schedule fit {can_make_it ? "— no hard conflict" : "— hard conflict detected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${!scanback_conflict ? "bg-teal-bg text-teal-success" : "bg-red-50 text-red-danger"}`}>
            {!scanback_conflict ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
          </span>
          <span className="font-inter text-[11px] text-slate">
            {!scanback_conflict
              ? "No scanback window conflicts"
              : scanback_conflict_detail || "Scanback conflict detected"}
          </span>
        </div>
        {(gap_before != null || gap_after != null) && (
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${(gap_before == null || gap_before >= 0) && (gap_after == null || gap_after >= 0) ? "bg-teal-bg text-teal-success" : "bg-red-50 text-red-danger"}`}>
              {((gap_before == null || gap_before >= 0) && (gap_after == null || gap_after >= 0))
                ? <Check className="w-2.5 h-2.5" />
                : <X className="w-2.5 h-2.5" />}
            </span>
            <span className="font-inter text-[11px] text-slate">
              {gap_before != null && `Gap before: ${gap_before} min`}
              {gap_before != null && gap_after != null && " · "}
              {gap_after != null && `Gap after: ${gap_after} min`}
            </span>
          </div>
        )}
      </div>

      {/* Surrounding jobs context */}
      {(prev_job || next_job) && (
        <div className="mt-3 pt-2.5 border-t border-border">
          <div className="font-inter text-[11px] font-semibold text-navy mb-1.5">Schedule context</div>
          {prev_job && (
            <div className="flex gap-2 py-1 border-b border-border">
              <span className="font-inter text-[10px] text-muted w-[60px]">
                {format(new Date(prev_job.time), "h:mm a")}
              </span>
              <span className="font-inter text-[11px] text-slate">
                {prev_job.type.replace(/_/g, " ")} · {prev_job.duration} min
              </span>
            </div>
          )}
          <div className="flex gap-2 py-1 border-b border-border">
            <span className={`font-inter text-[10px] font-semibold w-[60px] ${verdictColor}`}>
              → This
            </span>
            <span className={`font-inter text-[11px] font-semibold ${verdictColor}`}>
              Proposed booking
            </span>
          </div>
          {next_job && (
            <div className="flex gap-2 py-1">
              <span className="font-inter text-[10px] text-muted w-[60px]">
                {format(new Date(next_job.time), "h:mm a")}
              </span>
              <span className="font-inter text-[11px] text-slate">
                {next_job.type.replace(/_/g, " ")} · next
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
