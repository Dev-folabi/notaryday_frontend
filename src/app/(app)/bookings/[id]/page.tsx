"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
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
} from "lucide-react";
import ProGate from "@/components/ui/ProGate";

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
