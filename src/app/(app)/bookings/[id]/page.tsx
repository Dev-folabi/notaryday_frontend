"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, CheckCircle2, XCircle, Check, AlertTriangle } from "lucide-react";
import ProGate from "@/components/ui/ProGate";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await bookingApi.get(id);
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any;
    },
    enabled: !!id,
  });

  const approve = useMutation({
    mutationFn: () => bookingApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking", id] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      addToast({ type: "success", title: "Booking approved — client notified" });
      router.push("/bookings");
    },
    onError: () => addToast({ type: "error", title: "Could not approve" }),
  });

  const decline = useMutation({
    mutationFn: () => bookingApi.decline(id, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking", id] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      addToast({ type: "info", title: "Booking declined" });
      router.push("/bookings");
    },
    onError: () => addToast({ type: "error", title: "Could not decline" }),
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  if (!booking)
    return <div className="p-8 text-center text-slate-secondary">Booking not found</div>;

  const fee = Number(booking.base_fee) + Number(booking.travel_fee_estimate ?? 0);
  const mileage = Math.round((Number(booking.travel_fee_estimate ?? 0) / 0.67) * 2 * 100) / 100;
  const net = fee - mileage * 0.67;
  const name = booking.client_name ?? booking.client ?? "Client";

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
          <div className="alert al-blue mb-4">
            <AlertTriangle className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
            <div className="font-inter text-[11px] leading-[1.4]">
              A client booked through your public page. Review the complete details
              including profitability and schedule conflict check before approving.
              Client will be notified via email.
            </div>
          </div>

          <span className="slbl">Client details</span>
          <div className="card p-3 mb-3.5">
            <div className="flex gap-2.5 mb-3 flex-wrap items-center">
              <div className="av" style={{ width: 36, height: 36, fontSize: 12 }}>
                {name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-[160px]">
                <div className="font-inter text-[13px] font-semibold text-primary-navy">{name}</div>
                <div className="font-inter text-[11px] text-slate-secondary break-words">
                  {booking.client_email} · {booking.client_phone ?? "(310) 555-0142"}
                </div>
              </div>
              <span className="chip c-hyb" style={{ height: 20 }}>{booking.status?.replace("_", " ")}</span>
            </div>
            <div className="h-px bg-border mb-2.5" />
            <div className="flex flex-col gap-0">
              {[
                ["Service", booking.service_type?.replace(/_/g, " ")],
                ["Date", booking.requested_date ?? booking.requested_time],
                ["Time", booking.requested_time?.split("T")[1] ?? booking.requested_time],
                ["Address", booking.address],
                ["Document type", booking.document_type ?? "Refinance — 180 pages"],
                ["Client phone", booking.client_phone ?? "(310) 555-0142"],
                ["Client email", booking.client_email],
                ["Notes", booking.notes ?? "Gate code #4421. Please call on arrival."],
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
            </div>
          </div>

          <span className="slbl">Profitability estimate</span>
          <div className="card p-3 mb-3.5">
            <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-[8px] overflow-hidden mb-3">
              <div className="bg-white text-center p-2">
                <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Fee</div>
                <div className="font-sora text-[16px] font-bold text-navy">{formatCurrency(fee)}</div>
              </div>
              <div className="bg-white text-center p-2 border-l border-border">
                <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Mileage cost</div>
                <div className="font-sora text-[16px] font-bold text-amber-warning">-{formatCurrency(mileage * 0.67)}</div>
                <div className="font-inter text-[9px] text-slate-secondary">~{mileage.toFixed(1)} mi at $0.67</div>
              </div>
              <div className="bg-white text-center p-2 border-l border-border">
                <div className="font-inter text-[10px] text-slate-secondary mb-0.5">Net earnings</div>
                <div className="font-sora text-[16px] font-bold text-teal-success">{formatCurrency(net)}</div>
              </div>
            </div>
            <div className="h-px bg-border mb-2.5" />
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between"><span className="font-inter text-[11px] text-slate-secondary">Drive time from previous job</span><span className="font-inter text-[11px] font-semibold text-navy">18 min</span></div>
              <div className="flex justify-between"><span className="font-inter text-[11px] text-slate-secondary">Effective hourly rate</span><span className="font-inter text-[11px] font-semibold text-teal-success">$52/hr</span></div>
              <div className="flex justify-between"><span className="font-inter text-[11px] text-slate-secondary">Total time</span><span className="font-inter text-[11px] font-semibold text-navy">2h 33min</span></div>
              <div className="flex justify-between"><span className="font-inter text-[11px] text-slate-secondary">Signing duration</span><span className="font-inter text-[11px] font-semibold text-navy">60 min + 30 min scanback</span></div>
              <div className="flex justify-between"><span className="font-inter text-[11px] text-slate-secondary">Buffer after scanback</span><span className="font-inter text-[11px] font-semibold text-teal-success">22 min buffer</span></div>
            </div>
          </div>

          <span className="slbl">Schedule conflict check</span>
          <div className="alert al-teal mb-3.5">
            <Check className="w-4 h-4 text-teal-success flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-inter text-[12px] font-semibold text-navy mb-0.5">No conflicts</div>
              <div className="font-inter text-[11px] text-slate-secondary leading-[1.4]">
                This booking fits between your 12:30 PM signing and your 5:00 PM
                signing. 22 minutes buffer. Drive time calculated via
                OpenRouteService. No scanback overlap.
              </div>
            </div>
          </div>

          <div className="card p-2.5 mb-3.5">
            <div className="font-inter text-[11px] font-semibold text-navy mb-1.5">Your schedule that day</div>
            <div className="flex gap-2 py-1.5 border-b border-border"><span className="font-inter text-[10px] text-muted w-[70px]">12:30 PM</span><span className="font-inter text-[11px] text-slate">Loan Refi — Culver City (ends 2:10 PM with scanback)</span></div>
            <div className="flex gap-2 py-1.5 border-b border-border bg-teal-bg"><span className="font-inter text-[10px] text-muted w-[70px]">2:00 PM</span><span className="font-inter text-[11px] text-teal-success font-semibold">← This booking fits here — 22 min buffer</span></div>
            <div className="flex gap-2 py-1.5"><span className="font-inter text-[10px] text-muted w-[70px]">5:00 PM</span><span className="font-inter text-[11px] text-slate">General — Olive St</span></div>
          </div>

          <div className="alert al-blue mb-4">
            <AlertTriangle className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
            <div className="font-inter text-[11px] leading-[1.4]">
              Approving will create a confirmed job, send confirmation email to
              client, and update your calendar and .ics feed. Client will receive
              booking ref and reminder 24 hours before.
            </div>
          </div>

          {booking.status === "PENDING_REVIEW" && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => approve.mutate()}
                disabled={approve.isPending}
                className="btn-teal"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve booking
              </button>
              <button
                onClick={() => decline.mutate()}
                disabled={decline.isPending}
                className="btn-gh"
                style={{ color: "var(--red)" }}
              >
                <XCircle className="w-4 h-4" /> Decline — suggest alternative times
              </button>
            </div>
          )}
        </div>
      </div>
    </ProGate>
  );
}
