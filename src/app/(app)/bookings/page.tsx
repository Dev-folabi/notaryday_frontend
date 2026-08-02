"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import ProGate from "@/components/ui/ProGate";
import { Link2, Copy } from "lucide-react";
import { format } from "date-fns";
import { unwrap, getBookingUrl } from "@/lib/utils";
import { queryKeys } from "@/lib/queryClient";
import type { Booking } from "@/types/booking";
import { BookingStatus } from "@/types/booking";

export default function BookingsPage() {
  const { user } = useAuth();
  const { addToast } = useUIStore();

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: queryKeys.bookings.all(),
    queryFn: async () =>
      unwrap<Booking[]>(await bookingApi.list()),
  });

  const pending = bookings.filter(
    (b) => b.status === BookingStatus.PENDING_REVIEW,
  );
  const confirmed = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED,
  );
  const bookingUrl = getBookingUrl(user?.username);

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    addToast({ type: "success", title: "Link copied" });
  };

  return (
    <ProGate feature="Booking page">
      <div className="flex flex-col h-full">
        <div className="ph">
          <div className="ph-title">Bookings</div>
          <Link
            href="/settings/booking"
            className="btn-sm"
            style={{
              background: "var(--teal)",
              color: "#fff",
              borderColor: "var(--teal)",
            }}
          >
            <Link2 className="w-3.5 h-3.5" /> Setup page
          </Link>
        </div>

        <div className="con">
          <span className="slbl">Pending review</span>
          <div className="flex flex-col gap-2 mb-5">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-4 font-inter text-[12px] text-muted">
                No pending bookings
              </div>
            ) : (
              pending.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="card p-3 flex justify-between gap-2.5 flex-wrap"
                >
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-inter text-[12px] font-semibold text-primary-navy">
                      {b.client_name} ·{" "}
                      {b.service_type?.replace(/_/g, " ")}
                    </div>
                    <div className="font-inter text-[11px] text-slate-secondary mt-0.5 break-words">
                      {format(new Date(b.requested_time), "MMM d '·' h:mm a")} ·{" "}
                      {b.address}
                    </div>
                    <span className="chip c-hyb mt-1.5" style={{ fontSize: 9 }}>
                      Pending review
                    </span>
                  </div>
                  <span className="btn-sm">Review</span>
                </Link>
              ))
            )}
          </div>

          <span className="slbl">Confirmed bookings</span>
          <div className="flex flex-col gap-2 mb-5">
            {confirmed.length === 0 ? (
              <div className="text-center py-4 font-inter text-[12px] text-muted">
                No confirmed bookings
              </div>
            ) : (
              confirmed.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="card p-3 flex justify-between gap-2.5 flex-wrap"
                >
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-inter text-[12px] font-semibold text-primary-navy">
                      {b.client_name} ·{" "}
                      {b.service_type?.replace(/_/g, " ")}
                    </div>
                    <div className="font-inter text-[11px] text-slate-secondary mt-0.5">
                      {format(new Date(b.requested_time), "MMM d '·' h:mm a")}
                    </div>
                    <span
                      className="chip c-paid mt-1.5"
                      style={{ fontSize: 9 }}
                    >
                      Confirmed
                    </span>
                  </div>
                  <span className="btn-sm">View</span>
                </Link>
              ))
            )}
          </div>

          <div className="card p-3.5">
            <div className="font-inter text-[12px] font-semibold text-primary-navy mb-2">
              Your booking link
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="font-mono text-[12px] bg-background border border-border rounded-[6px] py-1.5 px-2.5 flex-1 break-all">
                {bookingUrl}
              </div>
              <button onClick={copyLink} className="btn-sm">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            <div className="mt-2.5">
              <Link
                href="/settings/booking"
                className="btn-gh"
                style={{ height: 36 }}
              >
                Setup booking page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProGate>
  );
}
