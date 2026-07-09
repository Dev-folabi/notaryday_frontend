"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
} from "lucide-react";

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
      addToast({ type: "success", title: "Booking approved" });
    },
  });

  const decline = useMutation({
    mutationFn: () => bookingApi.decline(id, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking", id] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      addToast({ type: "success", title: "Booking declined" });
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );
  if (!booking)
    return (
      <div className="p-8 text-center text-slate-secondary">
        Booking not found
      </div>
    );

  const totalFee =
    Number(booking.base_fee) + Number(booking.travel_fee_estimate ?? 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1 text-slate-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sora font-bold text-lg text-primary-navy">
          Booking detail
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-2xl mx-auto w-full flex flex-col gap-4">
        {/* Client info */}
        <div className="bg-white border border-border rounded-12px p-4">
          <div className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide mb-3">
            Client
          </div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-3.5 h-3.5 text-slate-secondary" />
            <span className="font-inter text-sm font-semibold text-primary-navy">
              {booking.client_name}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-3.5 h-3.5 text-slate-secondary" />
            <span className="font-inter text-xs text-slate-secondary">
              {booking.client_email}
            </span>
          </div>
          {booking.client_phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-secondary" />
              <span className="font-inter text-xs text-slate-secondary">
                {booking.client_phone}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white border border-border rounded-12px overflow-hidden">
          {[
            ["Service", booking.service_type?.replace("_", " ")],
            [
              "Date",
              format(parseISO(booking.requested_time), "EEEE, MMMM d, yyyy"),
            ],
            ["Time", format(parseISO(booking.requested_time), "h:mm a")],
            ["Address", booking.address],
            ["Document", booking.document_type ?? "—"],
            ["Base fee", formatCurrency(Number(booking.base_fee))],
            [
              "Travel fee",
              formatCurrency(Number(booking.travel_fee_estimate ?? 0)),
            ],
            ["Total", formatCurrency(totalFee)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between px-4 py-3 border-b border-border last:border-b-0"
            >
              <span className="font-inter text-xs text-slate-secondary w-24 flex-shrink-0">
                {label}
              </span>
              <span className="font-inter text-sm font-medium text-primary-navy text-right flex-1">
                {value}
              </span>
            </div>
          ))}
        </div>

        {booking.notes && (
          <div className="bg-white border border-border rounded-12px p-4">
            <div className="font-inter text-[10px] font-semibold text-slate-secondary uppercase tracking-wide mb-2">
              Notes
            </div>
            <p className="font-inter text-sm text-slate-secondary">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {booking.status === "PENDING_REVIEW" && (
          <div className="flex gap-2">
            <button
              onClick={() => approve.mutate()}
              className="flex-1 h-11 bg-teal-success text-white rounded-8px font-inter font-semibold text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => decline.mutate()}
              className="flex-1 h-11 border border-red-danger/30 text-red-danger rounded-8px font-inter font-semibold text-sm flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
