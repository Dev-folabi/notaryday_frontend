"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { MapPin, CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING_REVIEW: "bg-violet-bg text-violet",
  CONFIRMED: "bg-teal-bg text-teal-success",
  DECLINED: "bg-red-danger/10 text-red-danger",
};

export default function BookingsPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", filter],
    queryFn: async () => {
      const res = await bookingApi.list(filter);
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any[];
    },
  });

  const approve = useMutation({
    mutationFn: (id: string) => bookingApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      addToast({ type: "success", title: "Booking approved" });
    },
  });

  const decline = useMutation({
    mutationFn: (id: string) => bookingApi.decline(id, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      addToast({ type: "success", title: "Booking declined" });
    },
  });

  const FILTERS = [
    { value: undefined, label: "All" },
    { value: "PENDING_REVIEW", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "DECLINED", label: "Declined" },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex-shrink-0">
        <h1 className="font-sora font-bold text-xl text-primary-navy">
          Bookings
        </h1>
      </div>

      <div className="px-4 lg:px-8 py-3 bg-white border-b border-border flex gap-2 flex-shrink-0">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-inter text-xs font-medium border",
              filter === f.value
                ? "border-primary-navy bg-blue-bg text-primary-navy font-semibold"
                : "border-border text-slate-secondary",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-border rounded-14px p-8 text-center">
            <p className="font-inter text-sm text-slate-secondary">
              No bookings yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {bookings.map((b: any) => (
              <div
                key={b.id}
                className="bg-white border border-border rounded-12px p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-inter text-sm font-semibold text-primary-navy">
                        {b.client_name}
                      </span>
                      <span
                        className={cn(
                          "font-inter text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                          STATUS_COLORS[b.status] ??
                            "bg-slate-100 text-slate-secondary",
                        )}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="font-inter text-xs text-slate-secondary flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(b.requested_time), "MMM d, h:mm a")}
                    </div>
                    <div className="font-inter text-xs text-slate-secondary flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{b.address}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-sora font-bold text-lg text-teal-success">
                      {formatCurrency(
                        Number(b.base_fee) + Number(b.travel_fee_estimate ?? 0),
                      )}
                    </div>
                    <div className="font-inter text-[10px] text-muted">
                      est. fee
                    </div>
                  </div>
                </div>
                {b.status === "PENDING_REVIEW" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => approve.mutate(b.id)}
                      className="flex-1 h-9 bg-teal-success text-white rounded-8px font-inter text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => decline.mutate(b.id)}
                      className="flex-1 h-9 border border-red-danger/30 text-red-danger rounded-8px font-inter text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
