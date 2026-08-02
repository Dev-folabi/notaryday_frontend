"use client";

import { useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { useTodayPlan, useGaps } from "@/hooks/usePlanner";
import { useAuth } from "@/hooks/useAuth";
import { toDateInputValue, formatCurrency, formatMiles } from "@/lib/utils";
import {
  Route,
  Clock,
  MapPin,
  Navigation,
  Car,
  Scan,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DayPage() {
  const { user } = useAuth();
  const { activeDate } = useUIStore();
  const date = activeDate || toDateInputValue(new Date());
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";
  const [tab, setTab] = useState<"timeline" | "list" | "map">("timeline");
  const router = useRouter();

  const { data: plan, isLoading } = useTodayPlan(date);
  const { data: gaps = [] } = useGaps(isPro ? date : "");

  const jobs = plan?.jobs ?? [];
  const summary = plan?.summary;
  const gapsWithCandidates = gaps.filter((g) => g.candidates.length > 0);
  const firstGap = gapsWithCandidates[0];
  const bestCandidate = firstGap?.candidates[0];

  const driveMins = summary?.total_drive_mins ?? 0;
  const firstSigning = jobs[0]
    ? format(parseISO(jobs[0].appointment_time), "h:mm a")
    : "—";
  const totalNet = summary?.total_earnings ?? 0;

  const weekStart = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - d.getDay() + i);
    return {
      label: DAYS[d.getDay()],
      day: d.getDate(),
      isToday: d.toDateString() === new Date().toDateString(),
    };
  });

  return (
    <div className="flex flex-col h-full">
      {/* Week strip */}
      <div className="wstrip">
        {weekDays.map((d, i) => (
          <div key={i} className={cn("wday", d.isToday && "today")}>
            <span className="wd-n">{d.label}</span>
            <span className="wd-d">{d.day}</span>
            <span className="wd-dot" style={{ opacity: 0 }} />
          </div>
        ))}
      </div>

      {/* Navy summary strip */}
      <div className="dstrip" onClick={() => router.push("/day")}>
        <div className="ds">
          <span className="ds-v">{jobs.length}</span>
          <span className="ds-l">Signings</span>
        </div>
        <div className="ds-div" />
        <div className="ds">
          <span className="ds-v">{formatCurrency(totalNet)}</span>
          <span className="ds-l">Est. net</span>
        </div>
        <div className="ds-div" />
        <div className="ds">
          <span className="ds-v">
            {Math.floor(driveMins / 60)}h {driveMins % 60}m
          </span>
          <span className="ds-l">Drive time</span>
        </div>
        <div className="ds-div" />
        <div className="ds">
          <span className="ds-v">{firstSigning}</span>
          <span className="ds-l">First signing</span>
        </div>
        <button
          className="sday-btn"
          onClick={(e) => {
            e.stopPropagation();
            useUIStore.getState().addToast({
              title: "Opening optimized route map",
              message: "Start navigation",
              type: "info",
            });
            router.push("/map");
          }}
        >
          <ArrowRight className="w-3.5 h-3.5" /> Start Day
        </button>
      </div>

      <div
        style={{
          background: "#0F2C4E",
          textAlign: "center",
          padding: "3px 0",
        }}
      >
        <span style={{ fontSize: 8, color: "rgba(255,255,255,.35)" }}>
          Tap summary bar for full breakdown
        </span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={cn("tab", tab === "timeline" && "on")}
          onClick={() => setTab("timeline")}
        >
          Timeline
        </div>
        <div
          className={cn("tab", tab === "list" && "on")}
          onClick={() => setTab("list")}
        >
          List
        </div>
        <div
          className="tab"
          onClick={() => {
            if (!isPro) {
              useUIStore.getState().addToast({
                title: "This is a Pro feature",
                message: "Upgrade to Pro to unlock the route map.",
                type: "warning",
              });
              return;
            }
            router.push("/map");
          }}
        >
          Map
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === "timeline" ? (
            <>
              <div className="al-teal" style={{ flexShrink: 0 }}>
                <Route className="w-4 h-4" />
                <span className="text-[11px] font-semibold text-teal">
                  Route optimised
                </span>
                <span className="text-[11px] text-slate-secondary">
                  Reordered {jobs.length} jobs, saved 22 min vs time entry order
                </span>
                <span
                  className="ml-auto text-[10px] text-slate-secondary cursor-pointer"
                  onClick={() =>
                    useUIStore.getState().addToast({
                      title: "Route recalculated",
                      type: "info",
                    })
                  }
                >
                  Re-run
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="tl-wrap" style={{ padding: "16px 16px 0" }}>
                  <div className="tl-times">
                    {[
                      "8 AM",
                      "9 AM",
                      "10 AM",
                      "11 AM",
                      "12 PM",
                      "1 PM",
                      "2 PM",
                      "3 PM",
                    ].map((t) => (
                      <div key={t} className="tl-tr">
                        <span className="tl-label">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="tl-body">
                    <div style={{ height: 84 }} />
                    {jobs.map((j, idx) => (
                      <div key={j.id}>
                        <div
                          className="tl-job"
                          style={{
                            borderLeftColor: j.route_sequence
                              ? "#0F2C4E"
                              : "#2563EB",
                          }}
                          onClick={() => router.push(`/jobs/${j.id}`)}
                        >
                          <div className="flex justify-between gap-2 mb-0.5 flex-wrap">
                            <div className="text-[11px] font-bold text-primary-navy flex gap-1 items-center">
                              <Clock className="w-3 h-3" />{" "}
                              {format(parseISO(j.appointment_time), "h:mm a")} -{" "}
                              {format(
                                parseISO(
                                  j.signing_ends_at ?? j.appointment_time,
                                ),
                                "h:mm a",
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-[12px] font-bold",
                                profitabilityColor(j.net_earnings),
                              )}
                            >
                              {formatCurrency(j.net_earnings)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate mb-1 flex gap-1 items-center">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                              {j.address}
                            </span>
                          </div>
                          <div className="flex justify-between gap-1.5 flex-wrap">
                            <div className="flex gap-1 flex-wrap">
                              <span
                                className={cn(
                                  "chip",
                                  getTypeChipClass(j.signing_type),
                                )}
                              >
                                {formatSigningType(j.signing_type)}
                              </span>
                              {(j as any).platform_name && (
                                <span className="chip c-plat">
                                  {(j as any).platform_name}
                                </span>
                              )}
                            </div>
                            <div
                              className="text-[10px] font-semibold text-blue flex gap-1 items-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `https://maps.google.com/?q=${encodeURIComponent(j.address)}`,
                                  "_blank",
                                );
                              }}
                            >
                              <Navigation className="w-3 h-3" /> Navigate
                            </div>
                          </div>
                        </div>
                        {j.scanback_duration_mins > 0 && (
                          <>
                            <div className="tl-sb">
                              <div className="flex justify-between gap-2 flex-wrap">
                                <span className="text-[10px] italic text-amber flex gap-1 items-center">
                                  <Scan className="w-3 h-3" /> Scanback Job{" "}
                                  {idx + 1}
                                </span>
                                <span className="text-[9px] text-amber font-medium">
                                  {format(
                                    parseISO(j.appointment_time),
                                    "h:mm a",
                                  )}{" "}
                                  to{" "}
                                  {format(
                                    parseISO(
                                      j.scanback_ends_at ?? j.appointment_time,
                                    ),
                                    "h:mm a",
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="tl-drv">
                              <Car className="w-3 h-3" />{" "}
                              {j.drive_from_prev_mins ?? 0} min drive
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {firstGap && bestCandidate && (
                      <div className="mt-3">
                        <div className="flex gap-1.5 items-center py-1 px-0 text-[11px] font-semibold text-violet">
                          <Sparkles className="w-3.5 h-3.5" /> Gap opportunity,{" "}
                          {format(parseISO(firstGap.gap_start), "h:mm a")},{" "}
                          {firstGap.gap_mins} min available
                        </div>
                        <div className="gap-card">
                          <div className="text-[12px] font-semibold text-primary-navy mb-1">
                            {bestCandidate.address}
                          </div>
                          <div className="text-[11px] text-slate-secondary mb-2 flex gap-1.5 flex-wrap">
                            <span>
                              Offered:{" "}
                              <strong className="text-slate">
                                {formatCurrency(bestCandidate.fee)}
                              </strong>
                            </span>
                            <span>
                              Est. net:{" "}
                              <strong className="text-teal">
                                {formatCurrency(bestCandidate.net_earnings)}
                              </strong>
                            </span>
                            {bestCandidate.miles_from != null && (
                              <span>
                                {formatMiles(bestCandidate.miles_from)} from{" "}
                                {bestCandidate.miles_from_label}
                              </span>
                            )}
                          </div>
                          <button
                            className="btn-sm"
                            style={{ borderColor: "#C4B5FD", color: "#7C3AED" }}
                            onClick={() =>
                              useUIStore.getState().openCITT({
                                address: bestCandidate.address,
                                time: bestCandidate.appointment_time,
                                fee: bestCandidate.fee,
                              })
                            }
                          >
                            <Zap className="w-3 h-3" /> Run CITT check
                          </button>
                        </div>
                      </div>
                    )}
                    <div style={{ height: 24 }} />
                  </div>
                </div>
              </div>
            </>
          ) : tab === "list" ? (
            <div className="con">
              <span className="slbl">
                Jobs in time order,{" "}
                {isPro ? "route optimised" : "route not optimised"}
              </span>
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="jcard"
                  onClick={() => router.push(`/jobs/${j.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-primary-navy flex gap-1.5 items-center">
                      <Clock className="w-3 h-3" />{" "}
                      {format(parseISO(j.appointment_time), "h:mm a")} -{" "}
                      {j.signing_duration_mins} min
                    </div>
                    <div className="text-[11px] text-slate mb-1.5 flex gap-1 items-center">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {j.address}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <span
                        className={cn("chip", getTypeChipClass(j.signing_type))}
                      >
                        {formatSigningType(j.signing_type)}
                      </span>
                      {(j as any).platform_name && (
                        <span className="chip c-plat">
                          {(j as any).platform_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={cn(
                        "text-[13px] font-bold",
                        profitabilityColor(j.net_earnings),
                      )}
                    >
                      {formatCurrency(j.net_earnings)}
                    </div>
                    <div className="text-[9px] text-slate-secondary">
                      net after mileage
                    </div>
                  </div>
                </div>
              ))}

              {!isPro && (
                <div
                  className="card"
                  style={{ marginTop: 16, overflow: "hidden" }}
                >
                  <div className="p-3 border-b border-border flex gap-1.5 items-center">
                    <Info className="w-4 h-4 text-slate-secondary" />
                    <span className="text-[12px] font-semibold text-primary-navy">
                      Pro would do this automatically
                    </span>
                  </div>
                  <div className="p-2.5 border-b border-border flex gap-2 text-[11px] text-slate-secondary">
                    <Route className="w-4 h-4 flex-shrink-0" /> Reorder jobs by
                    geography to cut 22+ min
                  </div>
                  <div className="p-2.5 border-b border-border flex gap-2 text-[11px] text-slate-secondary">
                    <Scan className="w-4 h-4 flex-shrink-0" /> Block scanback
                    time so you never overbook
                  </div>
                  <div className="p-2.5">
                    <button
                      className="btn-pro"
                      style={{ height: 38 }}
                      onClick={() => router.push("/settings/billing")}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Upgrade to Pro,
                      $19/month
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <MapPin className="w-8 h-8 text-slate-secondary" />
              <p className="text-[13px] text-slate-secondary">
                The route map is available on Pro. Open the Map tab on desktop
                for the full optimised route.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function profitabilityColor(net: number | string): string {
  const n = typeof net === "string" ? parseFloat(net) || 0 : net;
  if (n >= 30) return "text-teal";
  if (n >= 10) return "text-amber";
  return "text-red";
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

function Info({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
