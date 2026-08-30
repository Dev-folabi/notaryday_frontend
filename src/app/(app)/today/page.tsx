"use client";

import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { jobsApi } from "@/api/jobs.api";
import { queryKeys } from "@/lib/queryClient";
import { useGaps, useTodayPlan } from "@/hooks/usePlanner";
import {
  formatCurrency,
  formatMiles,
  toDateInputValue,
  unwrap,
} from "@/lib/utils";
import {
  CalendarDays,
  Plus,
  Sparkles,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  parseISO,
  isToday,
} from "date-fns";
import type { Job } from "@/types/job";
import JobCard, { jobTypeLabel } from "@/components/jobs/JobCard";
import DaySummaryStrip from "@/components/planner/DaySummaryStrip";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TodayPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeDate, setActiveDate } = useUIStore();
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      date: d,
      label: DAYS[d.getDay()],
      day: d.getDate(),
      iso: toDateInputValue(d),
      isToday: isToday(d),
      hasJobs: false as boolean,
    };
  });

  // Query jobs for the current active date
  const { data: jobs = [] } = useQuery({
    queryKey: queryKeys.jobs.all({ date: activeDate }),
    queryFn: async () => {
      const res = await jobsApi.list({ date: activeDate, limit: 50 });
      return unwrap<Job[]>(res);
    },
    enabled: !!activeDate,
  });

  // mark which week days have jobs
  const weekEnd = addDays(endOfWeek(weekStart, { weekStartsOn: 1 }), 1);
  const weekFromIso = toDateInputValue(weekStart);
  const weekToIso = toDateInputValue(weekEnd);
  const weekJobsQuery = useQuery({
    queryKey: queryKeys.jobs.all({ from: weekFromIso, to: weekToIso }),
    queryFn: async () => {
      const res = await jobsApi.list({
        from: weekFromIso,
        to: weekToIso,
        limit: 100,
      });
      return unwrap<Job[]>(res);
    },
  });
  const weekJobs = (weekJobsQuery.data as Job[]) ?? [];
  weekDays.forEach((d) => {
    d.hasJobs = weekJobs.some((j) => j.appointment_time?.startsWith(d.iso));
  });

  // Fetch gap opportunities for today (pro only)
  const { data: gaps = [] } = useGaps(isPro ? activeDate : "");
  const gapsWithCandidates = gaps.filter((g) => g.candidates.length > 0);
  const firstGap = gapsWithCandidates[0];
  const bestCandidate = firstGap?.candidates[0];

  // The day plan carries the computed drive legs (populated on the backend on
  // demand); use its summary for the Drive stat instead of the raw job rows.
  const { data: plan } = useTodayPlan(activeDate);

  // Metrics for this week
  const weeklyEarnings = weekJobs.reduce(
    (sum: number, j: Job) =>
      sum + (parseFloat(j.net_earnings ?? j.fee ?? "0") || 0),
    0,
  );
  const weeklyJobsCount = weekJobs.length;
  const avgNetPerJob =
    weeklyJobsCount > 0 ? weeklyEarnings / weeklyJobsCount : 0;

  const todayEarnings = jobs.reduce(
    (sum: number, j: Job) =>
      sum + (parseFloat(j.net_earnings ?? j.fee ?? "0") || 0),
    0,
  );
  const totalDriveMins = plan?.summary?.total_drive_mins ?? 0;

  const jobCount = jobs.length;
  const activeJob = jobs.find((j) => j.status === "IN_PROGRESS");

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  })();
  const userName =
    user?.full_name?.split(" ")[0] ?? user?.username ?? "there";

  const isEmpty = jobCount === 0 && weeklyJobsCount === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Week strip */}
      <div className="wstrip">
        {weekDays.map((d) => (
          <button
            key={d.iso}
            onClick={() => setActiveDate(d.iso)}
            className={cn(
              "wday",
              d.iso === activeDate && "today",
              !d.hasJobs && "empty",
            )}
          >
            <span className="wd-n">{d.label}</span>
            <span className="wd-d">{d.day}</span>
            <span className="wd-dot" />
          </button>
        ))}
      </div>

      <div className="con">
        {!isEmpty ? (
          <>
            <div className="flex justify-between items-start gap-3 flex-wrap mb-4">
              <div>
                <div className="font-sora text-[18px] font-bold text-primary-navy">
                  Good {greeting}, {userName}.
                </div>
                <div className="text-[12px] text-slate-secondary mt-0.5">
                  {format(new Date(), "EEEE, MMMM d")} · {jobCount} signings
                  on today&apos;s schedule
                </div>
              </div>
              <Link
                href="/jobs/new"
                className="btn-p"
                style={{ width: "auto", height: 34, padding: "0 12px", fontSize: 12 }}
              >
                <Plus className="w-3.5 h-3.5" /> Add job
              </Link>
            </div>

            <span className="slbl">This week</span>
            <div className="flex gap-2 mb-4 flex-wrap">
              <div className="mcard">
                <span className="mc-v text-teal-success">
                  {formatCurrency(weeklyEarnings)}
                </span>
                <span className="mc-l">Net earned</span>
              </div>
              <div className="mcard">
                <span className="mc-v">{weeklyJobsCount}</span>
                <span className="mc-l">Signings</span>
              </div>
              <div className="mcard">
                <span className="mc-v">{formatCurrency(avgNetPerJob)}</span>
                <span className="mc-l">Avg net per job</span>
              </div>
            </div>

            <div className="card p-4 lg:p-5 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-sora text-[13px] font-bold text-primary-navy">
                  Week at a glance
                </span>
                <span className="text-[11px] text-slate-secondary font-medium">
                  {format(weekStart, "MMM d")} to{" "}
                  {format(
                    addDays(weekStart, 6),
                    format(weekStart, "M") === format(addDays(weekStart, 6), "M")
                      ? "d"
                      : "MMM d"
                  )}
                </span>
              </div>
              <WeekAtAGlanceBars weekDays={weekDays} weekJobs={weekJobs} />
            </div>

            {activeJob && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#fffbeb] to-[#fffdf5] border border-l-[3px] border-l-[#d97706] border-[#fde68a] rounded-xl px-4 py-3.5 mb-3.5 shadow-sm flex-wrap">
                <div className="w-10 h-10 rounded-full bg-[#d97706] flex items-center justify-center text-white flex-shrink-0">
                  <Clock className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="text-[12px] font-bold text-[#d97706] mb-0.5">
                    Active signing in progress
                  </div>
                  <div className="text-[12px] font-semibold text-primary-navy">
                    {jobTypeLabel(activeJob.signing_type)} ·{" "}
                    {format(parseISO(activeJob.appointment_time), "h:mm a")} ·{" "}
                    {activeJob.address}
                  </div>
                  <div className="text-[10px] text-slate-secondary mt-0.5">
                    Tap to update progress: navigated, started, done, scanback,
                    complete
                  </div>
                </div>
                <Link href="/active" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-inter font-semibold text-[11px] rounded-lg h-9 px-3.5 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                  <Clock className="w-3.5 h-3.5" /> Resume Signing
                </Link>
              </div>
            )}

            <div className="flex justify-between items-center mb-2">
              <span className="slbl" style={{ margin: 0 }}>
                Today&apos;s schedule
              </span>
              <span className="text-[11px] text-muted">{jobCount} jobs today</span>
            </div>

            <DaySummaryStrip
              items={[
                { value: jobCount, label: "Signings" },
                { value: formatCurrency(todayEarnings), label: "Est. net" },
                { value: `${Math.floor(totalDriveMins / 60)}h ${totalDriveMins % 60}m`, label: "Drive" },
              ]}
              onClick={() => router.push("/day")}
              action={{ label: "Start", icon: <ArrowRight className="w-3.5 h-3.5" />, onClick: () => router.push("/day") }}
            />

            {jobs.slice(0, 4).map((job) => (
              <JobCard key={job.id} job={job} variant="today" onClick={() => router.push(`/jobs/${job.id}`)} />
            ))}

            {isPro && firstGap && bestCandidate && (
              <div
                className="gap-card"
                style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}
              >
                <div
                  className="spark"
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(124,58,237,.12)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#7C3AED",
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="text-[12px] font-semibold text-primary-navy mb-0.5">
                    {gapsWithCandidates.length} gap opportunit
                    {gapsWithCandidates.length === 1 ? "y" : "ies"} found today
                  </div>
                  <div className="text-[11px] text-slate-secondary">
                    {bestCandidate.address} ·{" "}
                    {formatCurrency(bestCandidate.fee)} offered ·{" "}
                    {format(parseISO(firstGap.gap_start), "h:mm a")}
                    {bestCandidate.miles_from != null && (
                      <>
                        {" "}
                        · {formatMiles(bestCandidate.miles_from)} from{" "}
                        {bestCandidate.miles_from_label}
                      </>
                    )}
                  </div>
                </div>
                <span
                  className="text-[11px] font-semibold text-violet cursor-pointer whitespace-nowrap"
                  onClick={() =>
                    useUIStore.getState().openCITT({
                      address: bestCandidate.address,
                      time: bestCandidate.appointment_time,
                      fee: bestCandidate.fee,
                    })
                  }
                >
                  CITT <ChevronRight className="w-3.5 h-3.5 inline" />
                </span>
              </div>
            )}

            <div style={{ height: 20 }} />
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] font-medium text-slate-secondary">
                Good {greeting} · {format(parseISO(activeDate), "EEEE, MMMM d")}
              </span>
              <Link href="/jobs/new" className="btn-p" style={{ width: "auto", height: 36, padding: "0 14px", fontSize: 11 }}>
                <Plus className="w-3.5 h-3.5" /> Add job
              </Link>
            </div>

            <div className="empty-box">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-blue-bg flex items-center justify-center mx-auto mb-[18px] text-blue">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div className="font-sora font-semibold text-[18px] text-primary-navy mb-2">
                No signings today
              </div>
              <p className="text-[13px] text-slate-secondary leading-[1.6] max-w-[280px] mx-auto mb-6">
                Add your first job or run a Can I Take This? check on an incoming
                signing request to get started.
              </p>
              <div className="flex flex-col gap-[10px] max-w-[300px] mx-auto">
                <Link href="/jobs/new" className="btn-p" style={{ height: 44 }}>
                  <Plus className="w-4 h-4" /> Add a job
                </Link>
                <button
                  onClick={() => useUIStore.getState().openCITT()}
                  className="btn-s"
                  style={{ height: 44 }}
                >
                  <Sparkles className="w-4 h-4" /> Run Can I Take This?
                </button>
              </div>
            </div>

            <div className="flex gap-2.5 mt-3">
              <div className="mcard">
                <span className="mc-v">$0</span>
                <span className="mc-l">This week</span>
              </div>
              <div className="mcard">
                <span className="mc-v">0</span>
                <span className="mc-l">Jobs this month</span>
              </div>
              <div className="mcard">
                <span className="mc-v">—</span>
                <span className="mc-l">Avg net/job</span>
              </div>
            </div>

            {!isPro && (
              <div className="alert al-amber mt-3">
                <Sparkles className="w-4 h-4" />
                <div className="text-[12px] leading-[1.5]">
                  You are on Free plan.{" "}
                  <span
                    className="text-blue font-medium cursor-pointer"
                    onClick={() => router.push("/settings?tab=billing")}
                  >
                    Upgrade to Pro
                  </span>{" "}
                  to unlock route optimisation, Gap Finder, and more.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface WeekDayItem {
  date: Date;
  label: string;
  day: number;
  iso: string;
  isToday: boolean;
  hasJobs: boolean;
}

function WeekAtAGlanceBars({
  weekDays,
  weekJobs,
}: {
  weekDays: WeekDayItem[];
  weekJobs: Job[];
}) {
  const { activeDate, setActiveDate } = useUIStore();

  const dayStats = weekDays.map((d) => {
    const dayJobs = weekJobs.filter((j) =>
      j.appointment_time?.startsWith(d.iso)
    );
    const earn = dayJobs.reduce(
      (sum: number, j: Job) =>
        sum + (parseFloat(j.net_earnings ?? j.fee ?? "0") || 0),
      0
    );
    return { ...d, count: dayJobs.length, earn };
  });

  const maxEarn = Math.max(...dayStats.map((d) => d.earn), 0);

  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-[64px] mb-1">
      {dayStats.map((d) => {
        const isActive = d.iso === activeDate;
        const hasEarn = d.earn > 0;

        // Calculate vertical bar height proportional to earnings relative to maxEarn
        const h =
          hasEarn && maxEarn > 0
            ? Math.max(16, Math.round((d.earn / maxEarn) * 44))
            : 4;

        return (
          <button
            key={d.iso}
            type="button"
            onClick={() => setActiveDate(d.iso)}
            className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer border-none bg-transparent p-0 outline-none"
          >
            {/* Top earnings value or dash */}
            <span className="text-[10px] sm:text-[11px] text-slate-secondary font-medium mb-1 whitespace-nowrap leading-none">
              {hasEarn ? `$${Math.round(d.earn).toLocaleString("en-US")}` : "-"}
            </span>

            {/* Vertical Bar Chart Bar */}
            <div
              className={cn(
                "w-full rounded-t-[4px] transition-all duration-200",
                isActive
                  ? "bg-primary-navy shadow-sm"
                  : hasEarn
                  ? "bg-[#93C5FD] group-hover:bg-[#60A5FA]"
                  : "bg-[#E2E8F0] group-hover:bg-[#CBD5E1]"
              )}
              style={{ height: `${h}px` }}
            />

            {/* Bottom day name label */}
            <span
              className={cn(
                "text-[10px] sm:text-[11px] mt-1 transition-colors leading-none",
                isActive
                  ? "font-bold text-primary-navy"
                  : "font-normal text-muted group-hover:text-slate-secondary"
              )}
            >
              {d.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
