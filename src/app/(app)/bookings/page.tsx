"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import ProGate from "@/components/ui/ProGate";
import { Link2, Copy, Check, Settings } from "lucide-react";
import { format } from "date-fns";
import { unwrap, getBookingUrl } from "@/lib/utils";
import { queryKeys } from "@/lib/queryClient";
import type { Booking } from "@/types/booking";
import { BookingStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

type FilterKey = "pending" | "confirmed" | "declined";

const FILTERS: { key: FilterKey; label: string; status: BookingStatus | BookingStatus[] }[] = [
  { key: "pending", label: "Pending", status: BookingStatus.PENDING_REVIEW },
  { key: "confirmed", label: "Confirmed", status: BookingStatus.CONFIRMED },
  {
    key: "declined",
    label: "Declined",
    status: [BookingStatus.DECLINED, BookingStatus.CANCELLED_BY_CLIENT],
  },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const [filter, setFilter] = useState<FilterKey>("pending");
  const [copied, setCopied] = useState(false);

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: queryKeys.bookings.all(),
    queryFn: async () => unwrap<Booking[]>(await bookingApi.list()),
  });

  const bookingUrl = getBookingUrl(user?.username);

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    addToast({ type: "success", title: "Link copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  const activeStatuses = (() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    return Array.isArray(f.status) ? f.status : [f.status];
  })();

  const filtered = bookings.filter((b) =>
    activeStatuses.includes(b.status as BookingStatus),
  );

  // Badge counts
  const counts: Record<FilterKey, number> = {
    pending: bookings.filter((b) => b.status === BookingStatus.PENDING_REVIEW).length,
    confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
    declined: bookings.filter(
      (b) =>
        b.status === BookingStatus.DECLINED ||
        b.status === BookingStatus.CANCELLED_BY_CLIENT,
    ).length,
  };

  return (
    <ProGate feature="Booking page">
      <div className="flex flex-col h-full">

        {/* ── Page header ── */}
        <div className="ph">
          <div className="ph-title">Bookings</div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="btn-sm"
              title={bookingUrl}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-teal-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sm"
              style={{ background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" }}
            >
              <Link2 className="w-3.5 h-3.5" /> Preview
            </a>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="tabs">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={cn("tab", filter === key && "on")}
              onClick={() => setFilter(key)}
            >
              {label}
              {counts[key] > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center rounded-full font-inter text-[9px] font-semibold px-1.5 py-px"
                  style={{
                    background:
                      filter === key
                        ? key === "pending"
                          ? "var(--violet)"
                          : key === "confirmed"
                          ? "var(--teal)"
                          : "var(--red)"
                        : "var(--border)",
                    color: filter === key ? "#fff" : "var(--slate2)",
                    minWidth: 16,
                  }}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Booking list ── */}
        <div className="con">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "var(--muted)",
                  fontSize: 12,
                }}
              >
                No {FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} bookings
              </div>
            ) : (
              filtered.map((b) => <BookingCard key={b.id} booking={b} filter={filter} />)
            )}
          </div>

          {/* ── Setup booking page ── */}
          <div style={{ marginTop: 24 }}>
            <Link
              href="/settings?tab=booking"
              className="btn-gh"
              style={{ height: 36, width: "100%", justifyContent: "center" }}
            >
              <Settings className="w-3.5 h-3.5" /> Setup booking page
            </Link>
          </div>
        </div>
      </div>
    </ProGate>
  );
}

function BookingCard({
  booking: b,
  filter,
}: {
  booking: Booking;
  filter: FilterKey;
}) {
  const isPending = filter === "pending";
  const isConfirmed = filter === "confirmed";

  const chipStyle: React.CSSProperties = isPending
    ? {}
    : isConfirmed
    ? {}
    : { background: "var(--border)", color: "var(--slate)" };

  const chipClass = isPending ? "chip c-hyb" : isConfirmed ? "chip c-paid" : "chip";

  const statusLabel = isPending
    ? "Pending review"
    : isConfirmed
    ? "Confirmed"
    : b.status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Link
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
          {format(new Date(b.requested_time), "h:mm a")}
          {isPending && ` · ${b.address}`}
        </div>
        <span className={chipClass} style={{ marginTop: 6, fontSize: 9, ...chipStyle }}>
          {statusLabel}
        </span>
      </div>
      <span className="btn-sm" style={{ flexShrink: 0, marginTop: 2 }}>
        {isPending ? "Review" : "View"}
      </span>
    </Link>
  );
}
