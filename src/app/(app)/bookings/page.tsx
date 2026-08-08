"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import ProGate from "@/components/ui/ProGate";
import { Link2, Copy, Settings } from "lucide-react";
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
    queryFn: async () => unwrap<Booking[]>(await bookingApi.list()),
  });

  const pending = bookings.filter(
    (b) => b.status === BookingStatus.PENDING_REVIEW,
  );
  const confirmed = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED,
  );
  // Other statuses (declined, cancelled, etc.) shown in their own section
  const other = bookings.filter(
    (b) =>
      b.status !== BookingStatus.PENDING_REVIEW &&
      b.status !== BookingStatus.CONFIRMED,
  );

  const bookingUrl = getBookingUrl(user?.username);

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    addToast({ type: "success", title: "Link copied" });
  };

  return (
    <ProGate feature="Booking page">
      <div className="flex flex-col h-full">
        {/* ── Page header ── */}
        <div className="ph">
          <div className="ph-title">Bookings</div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sm"
            style={{
              background: "var(--teal)",
              color: "#fff",
              borderColor: "var(--teal)",
            }}
          >
            <Link2 className="w-3.5 h-3.5" /> Preview public page
          </a>
        </div>

        <div className="con">
          {/* ── Pending review ── */}
          <span className="slbl">Pending review</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
              </div>
            ) : pending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--muted)", fontSize: 12 }}>
                No pending bookings
              </div>
            ) : (
              pending.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="card"
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>
                      {b.client_name} — {b.service_type?.replace(/_/g, " ")}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--slate2)",
                        marginTop: 2,
                        wordBreak: "break-word",
                      }}
                    >
                      {format(new Date(b.requested_time), "MMM d, yyyy")} ·{" "}
                      {format(new Date(b.requested_time), "h:mm a")} ·{" "}
                      {b.address}
                    </div>
                    <span
                      className="chip c-hyb"
                      style={{ marginTop: 6, fontSize: 9 }}
                    >
                      Pending review
                    </span>
                  </div>
                  <span className="btn-sm" style={{ flexShrink: 0, marginTop: 2 }}>
                    Review
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* ── Confirmed bookings ── */}
          <span className="slbl">Confirmed bookings</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {!isLoading && confirmed.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--muted)", fontSize: 12 }}>
                No confirmed bookings
              </div>
            ) : (
              confirmed.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="card"
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>
                      {b.client_name} — {b.service_type?.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--slate2)", marginTop: 2, wordBreak: "break-word" }}>
                      {format(new Date(b.requested_time), "MMM d, yyyy")} ·{" "}
                      {format(new Date(b.requested_time), "h:mm a")}
                    </div>
                    <span
                      className="chip c-paid"
                      style={{ marginTop: 6, fontSize: 9 }}
                    >
                      Confirmed
                    </span>
                  </div>
                  <span className="btn-sm" style={{ flexShrink: 0, marginTop: 2 }}>
                    View
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* ── Other statuses (declined, cancelled) — preserved from implementation ── */}
          {other.length > 0 && (
            <>
              <span className="slbl">Past bookings</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {other.map((b) => (
                  <Link
                    key={b.id}
                    href={`/bookings/${b.id}`}
                    className="card"
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>
                        {b.client_name} — {b.service_type?.replace(/_/g, " ")}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--slate2)", marginTop: 2 }}>
                        {format(new Date(b.requested_time), "MMM d, yyyy")} ·{" "}
                        {format(new Date(b.requested_time), "h:mm a")}
                      </div>
                      <span
                        className="chip"
                        style={{
                          marginTop: 6,
                          fontSize: 9,
                          background: "var(--border)",
                          color: "var(--slate)",
                        }}
                      >
                        {b.status?.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>
                    <span className="btn-sm" style={{ flexShrink: 0, marginTop: 2 }}>
                      View
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* ── Booking link card ── */}
          <div className="card" style={{ padding: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--navy)",
                marginBottom: 8,
              }}
            >
              Your booking link
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  flex: 1,
                  wordBreak: "break-all",
                }}
              >
                {bookingUrl}
              </div>
              <button onClick={copyLink} className="btn-sm" style={{ flexShrink: 0 }}>
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gh"
                style={{ height: 36 }}
              >
                <Link2 className="w-3.5 h-3.5" /> Preview public booking page
              </a>
              {/* Setup booking page — implemented feature, not in prototype but kept */}
              <Link
                href="/settings?tab=booking"
                className="btn-gh"
                style={{ height: 36 }}
              >
                <Settings className="w-3.5 h-3.5" /> Setup booking page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProGate>
  );
}
