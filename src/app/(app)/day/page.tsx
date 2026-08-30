"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { useTodayPlan, useGaps, useOptimise } from "@/hooks/usePlanner";
import { useAuth } from "@/hooks/useAuth";
import { toDateInputValue, formatCurrency } from "@/lib/utils";
import {
  Route,
  MapPin,
  Scan,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import DayMap from "@/components/map/DayMap";
import DayBreakdownModal from "@/components/planner/DayBreakdownModal";
import DaySummaryStrip from "@/components/planner/DaySummaryStrip";
import RouteCalendar from "@/components/planner/RouteCalendar";
import JobCard from "@/components/jobs/JobCard";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export default function DayPage() {
  const { user } = useAuth();
  const { activeDate } = useUIStore();
  const date = activeDate || toDateInputValue(new Date());
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";
  const [tab, setTab] = useState<"timeline" | "list" | "map">("timeline");
  const [isBreakdownOpen, setBreakdownOpen] = useState(false);
  const router = useRouter();

  const { data: plan, isLoading } = useTodayPlan(date);
  const { data: gaps = [] } = useGaps(isPro ? date : "");
  const optimiseMutation = useOptimise();

  const jobs = plan?.jobs ?? [];
  const summary = plan?.summary;
  const gapsWithCandidates = gaps.filter((g) => g.candidates.length > 0);
  const firstGap = gapsWithCandidates[0];

  const driveMins = summary?.total_drive_mins ?? 0;

  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const firstSigning = jobs.length
    ? format(
        new Date(Math.min(...jobs.map((job) => new Date(job.appointment_time).getTime()))),
        "h:mm a",
      )
    : "—";
  const totalNet = summary?.total_earnings ?? 0;
  const savedMin = summary?.saved_drive_mins ?? null;

  const weekStart = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + i);
    const iso = toDateInputValue(d);
    return {
      label: DAYS[d.getDay()],
      day: d.getDate(),
      date: iso,
      isToday: iso === toDateInputValue(new Date()),
      isActive: iso === date,
    };
  });

  return (
    <div className="flex flex-col h-full">
      {/* Week strip */}
      <div className="wstrip">
        {weekDays.map((d, i) => (
          <div
            key={i}
            className={cn(
              "wday",
              d.isToday && "today",
              d.isActive && "active",
            )}
            onClick={() => useUIStore.getState().setActiveDate(d.date)}
          >
            <span className="wd-n">{d.label}</span>
            <span className="wd-d">{d.day}</span>
            <span className="wd-dot" style={{ opacity: 0 }} />
          </div>
        ))}
      </div>

      {/* Navy summary strip */}
      <DaySummaryStrip
        items={[
          { value: jobs.length, label: "Signings" },
          { value: formatCurrency(totalNet), label: "Est. net" },
          { value: `${Math.floor(driveMins / 60)}h ${driveMins % 60}m`, label: "Drive time" },
          { value: firstSigning, label: "First signing" },
        ]}
        onClick={() => setBreakdownOpen(true)}
        action={{ label: "Start Day", icon: <ArrowRight className="w-3.5 h-3.5" />, onClick: () => setBreakdownOpen(true) }}
      />

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
          className={cn("tab", tab === "map" && "on")}
          onClick={() => {
            if (!isPro) {
              useUIStore.getState().addToast({
                title: "This is a Pro feature",
                message: "Upgrade to Pro to unlock the route map.",
                type: "warning",
              });
              return;
            }
            setTab("map");
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
              <div className="flex-shrink-0 bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border-b border-[#6ee7b7] border-l-[3px] border-l-[#16a34a] px-4 py-2.5">
                <div className="flex items-center gap-2.5 w-full">
                  <div className="w-8 h-8 rounded-lg bg-[#16a34a]/10 flex items-center justify-center flex-shrink-0">
                    <Route className="w-4 h-4 text-[#16a34a]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11.5px] font-bold text-[#166534]">
                        {isPro ? "Route optimised" : "Today's plan"}
                      </span>
                      {savedMin != null && savedMin >= 1 && (
                        <span className="text-[9px] font-semibold text-[#16a34a] bg-white border border-[#6ee7b7] rounded-full px-1.5 py-[1px]">
                          saved {Math.round(savedMin)} min
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[#166534]/70 leading-snug mt-0.5">
                      {isPro
                        ? `Reordered ${jobs.length} jobs for less driving. Best order for today.`
                        : `${jobs.length} signing${jobs.length === 1 ? "" : "s"} today — upgrade to Pro to optimise the route`}
                    </p>
                  </div>
                  {isPro && (
                    <button
                      onClick={() => {
                        if (optimiseMutation.isPending) return;
                        optimiseMutation.mutate(date, {
                          onError: () =>
                            useUIStore.getState().addToast({
                              title: "Couldn't optimise route",
                              message: "Please try again shortly.",
                              type: "error",
                            }),
                        });
                      }}
                      disabled={optimiseMutation.isPending}
                      className="flex-shrink-0 ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#166534]/70 bg-white border border-[#6ee7b7] rounded-full px-2 py-1.5 cursor-pointer hover:border-[#16a34a] hover:text-[#16a34a] transition-colors disabled:opacity-60 disabled:cursor-default"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${optimiseMutation.isPending ? "animate-spin" : ""}`}
                      />
                      {optimiseMutation.isPending ? "Optimising…" : "Re-run"}
                    </button>
                  )}
                </div>
              </div>

              <RouteCalendar
                jobs={jobs}
                date={date}
                now={nowTick}
                gap={firstGap}
                onJobClick={(jobId) => router.push(`/jobs/${jobId}`)}
                onGapClick={(gap) => {
                  const candidate = gap.candidates[0];
                  if (candidate) {
                    useUIStore.getState().openCITT({
                      address: candidate.address,
                      time: candidate.appointment_time,
                      fee: candidate.fee,
                    });
                  }
                }}
              />
            </>
          ) : tab === "list" ? (
            <div className="con">
              <span className="slbl">
                Jobs in time order,{" "}
                {isPro ? "route optimised" : "route not optimised"}
              </span>
              {jobs.map((j) => (
                <JobCard
                  key={j.id}
                  job={j}
                  variant="day"
                  onClick={() => router.push(`/jobs/${j.id}`)}
                />
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
                    geography to cut drive time
                  </div>
                  <div className="p-2.5 border-b border-border flex gap-2 text-[11px] text-slate-secondary">
                    <Scan className="w-4 h-4 flex-shrink-0" /> Block scanback
                    time so you never overbook
                  </div>
                  <div className="p-2.5">
                    <button
                      className="btn-pro"
                      style={{ height: 38 }}
                      onClick={() => router.push("/settings?tab=billing")}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Upgrade to Pro,
                      $19/month
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isPro ? (
            <div className="flex-1 min-h-0">
              <DayMap
                jobs={jobs}
                homeBase={
                  user?.settings?.home_base_lat != null &&
                  user?.settings?.home_base_lng != null
                    ? {
                        lat: user.settings.home_base_lat,
                        lng: user.settings.home_base_lng,
                      }
                    : null
                }
                homeBaseAddress={user?.settings?.home_base_address ?? null}
                className="h-full"
                now={nowTick}
              />
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
      <DayBreakdownModal
        isOpen={isBreakdownOpen}
        date={date}
        jobs={jobs}
        summary={summary}
        isPro={isPro}
        now={nowTick}
        irsRatePerMile={
          parseFloat(String(user?.settings?.irs_rate_per_mile ?? 0.67)) || 0.67
        }
        onClose={() => setBreakdownOpen(false)}
        onStartDay={() => {
          setBreakdownOpen(false);
          if (!isPro) {
            useUIStore.getState().addToast({
              title: "This is a Pro feature",
              message: "Upgrade to Pro to unlock the route map.",
              type: "warning",
            });
            return;
          }
          useUIStore.getState().addToast({
            title: "Opening optimized route map",
            message: "Start navigation",
            type: "info",
          });
          setTab("map");
        }}
      />
    </div>
  );
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
