import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { jobsApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { formatCurrency, formatMiles, toDateInputValue } from "@/lib/utils";
import {
  CalendarDays,
  Plus,
  Sparkles,
  Info,
  Clock,
  Car,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, addDays, startOfWeek, endOfWeek, parseISO, isToday, getDay } from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TodayPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeDate, setActiveDate } = useUIStore();
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday start

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      date: d,
      label: DAYS[d.getDay()],
      day: d.getDate(),
      iso: toDateInputValue(d),
      isToday: isToday(d),
    };
  });

  // Query jobs for the current active date
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: queryKeys.jobs({ date: activeDate }),
    queryFn: async () => {
      const res = await jobsApi.list({ date: activeDate, limit: 50 });
      return res as any[];
    },
    enabled: !!activeDate,
  });

  // Query jobs for the whole week to power the week stats
  const weekJobsQuery = useQuery({
    queryKey: queryKeys.jobs({ date: toDateInputValue(weekStart) }),
    queryFn: async () => {
      const res = await jobsApi.list({ date: toDateInputValue(weekStart), limit: 100 });
      return res as any[];
    },
  });
  const weekJobs = (weekJobsQuery.data as any[]) ?? [];

  // Metrics
  const weeklyEarnings = weekJobs.reduce(
    (sum: number, j: any) => sum + (parseFloat(j.net_earnings ?? j.fee ?? "0") || 0),
    0
  );
  const weeklyJobsCount = weekJobs.length;
  const avgNetPerJob = weeklyJobsCount > 0 ? weeklyEarnings / weeklyJobsCount : 0;

  const todayEarnings = jobs.reduce(
    (sum: number, j: any) => sum + (parseFloat(j.net_earnings ?? j.fee ?? "0") || 0),
    0
  );
  const totalDriveMins = jobs.reduce(
    (sum: number, j: any) => sum + (parseInt(j.drive_from_prev_mins ?? "0") || 0),
    0
  );

  const jobCount = jobs.length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  })();
  const userName = user?.full_name?.split(" ")[0] ?? user?.username ?? "there";

  const isEmpty = jobCount === 0 && weeklyJobsCount === 0;

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex flex-1 overflow-hidden flex-col">
        {/* Mobile top bar from prototype (blue Free/Pro chip + Avatar) */}
        <div className="lg:hidden h-[56px] bg-white border-b border-border flex items-center justify-between px-[18px] flex-shrink-0">
          <span className="font-sora font-bold text-[16px] text-primary-navy">Notary Day</span>
          <div className="flex items-center gap-[10px]">
            {!isPro ? (
              <span className="inline-flex items-center gap-1 bg-border text-slate-body font-semibold text-[10px] tracking-[0.2px] uppercase rounded-[4px] px-[7px] py-[3px]">Free</span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-pro-gold text-primary-navy font-semibold text-[10px] tracking-[0.2px] uppercase rounded-[4px] px-[7px] py-[3px]">Pro</span>
            )}
            <div className="w-[32px] h-[32px] rounded-full bg-primary-navy text-white text-[11px] font-semibold flex items-center justify-center font-inter">{getInitials(userName)}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {/* Week Strip */}
          <div className="bg-white border-b border-border flex px-4 lg:px-7 flex-shrink-0 overflow-x-auto">
            {weekDays.map((d) => {
              const hasJobs = weekJobs.some((j: any) => j.appointment_time?.startsWith(d.iso));
              return (
                <button
                  key={d.iso}
                  onClick={() => setActiveDate(d.iso)}
                  className={cn(
                    "flex-1 flex flex-col items-center py-[10px] px-[2px] pb-[8px] cursor-pointer gap-1 transition-colors border-b-2",
                    d.iso === activeDate ? "border-primary-navy" : "border-transparent"
                  )}
                >
                  <span className="text-[10px] font-medium text-muted uppercase tracking-[0.5px]">{d.label}</span>
                  <span
                    className={cn(
                      "w-[30px] h-[30px] rounded-full flex items-center justify-center text-[14px] font-semibold",
                      d.iso === activeDate
                        ? "bg-primary-navy text-white"
                        : d.isToday
                        ? "bg-blue-bg text-interactive-blue"
                        : "text-slate-body"
                    )}
                  >
                    {d.day}
                  </span>
                  <span className={cn("w-1 h-1 rounded-full", hasJobs ? "bg-primary-navy" : "opacity-0")} />
                </button>
              );
            })}
          </div>

          {!isEmpty ? (
            /* ============================================================== 
               S-10: DASHBOARD HOME (Weekly Overview)
               ============================================================== */
            <div className="p-5 lg:p-7 pt-4">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h1 className="font-sora text-[20px] font-bold text-primary-navy">Good {greeting}, {userName}.</h1>
                  <div className="text-[13px] text-slate-secondary mt-[3px]">
                    {format(parseISO(activeDate), "EEEE, MMMM d")} · {jobCount} signing{jobCount !== 1 ? "s" : ""} on today's schedule
                  </div>
                </div>
                <Link href="/jobs/new" className="hidden lg:inline-flex items-center justify-center bg-primary-navy text-white border-none rounded-[8px] h-[36px] text-[12px] font-semibold px-[13px] gap-1.5 flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add job</span>
                </Link>
              </div>

              {/* THIS WEEK */}
              <span className="text-[10px] font-semibold text-slate-secondary tracking-[0.6px] uppercase block mb-3">This week</span>
              <div className="flex gap-[10px] mb-5">
                <div className="bg-white border border-border rounded-[12px] p-4 flex-1">
                  <span className="font-sora text-[22px] font-bold text-teal-success block mb-[3px]">{formatCurrency(weeklyEarnings)}</span>
                  <span className="text-[11px] text-slate-secondary block">Net earned</span>
                </div>
                <div className="bg-white border border-border rounded-[12px] p-4 flex-1">
                  <span className="font-sora text-[22px] font-bold text-primary-navy block mb-[3px]">{weeklyJobsCount}</span>
                  <span className="text-[11px] text-slate-secondary block">Signings</span>
                </div>
                <div className="bg-white border border-border rounded-[12px] p-4 flex-1">
                  <span className="font-sora text-[22px] font-bold text-slate-body block mb-[3px]">{formatCurrency(avgNetPerJob)}</span>
                  <span className="text-[11px] text-slate-secondary block">Avg net/job</span>
                </div>
              </div>

              {/* DAILY BARS */}
              <div className="bg-white border border-border rounded-[12px] py-[18px] px-5 mb-5">
                <div className="flex items-center justify-between mb-[14px]">
                  <span className="text-[13px] font-semibold text-primary-navy">Week at a glance</span>
                  <span className="text-[11px] text-slate-secondary">{format(weekStart, "MMM d")}–{format(endOfWeek(weekStart), "d")}</span>
                </div>
                <WeekAtAGlanceBars weekDays={weekDays} weekJobs={weekJobs} maxEarn={weeklyEarnings > 0 ? (weeklyEarnings / weeklyJobsCount * 1.5) : 300} />
              </div>

              {/* TODAY PREVIEW */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold text-slate-secondary tracking-[0.6px] uppercase m-0">Today's schedule</span>
                <Link href="/day" className="text-[12px] font-medium text-interactive-blue cursor-pointer flex items-center gap-[1px]">
                  Open day view <ChevronRight className="w-3.5 h-3.5 stroke-2" />
                </Link>
              </div>

              {/* TODAY MINI STRIP */}
              <div className="bg-primary-navy rounded-[10px] p-[12px] px-[16px] flex items-center gap-0 mb-3">
                <div className="flex-1 text-center">
                  <div className="font-sora text-[17px] font-bold text-white leading-none">{jobCount}</div>
                  <div className="text-[10px] text-white/50 mt-[3px]">Signings</div>
                </div>
                <div className="w-[1px] h-[28px] bg-white/10 flex-shrink-0"></div>
                <div className="flex-1 text-center">
                  <div className="font-sora text-[17px] font-bold text-white leading-none">{formatCurrency(todayEarnings)}</div>
                  <div className="text-[10px] text-white/50 mt-[3px]">Est. net</div>
                </div>
                <div className="w-[1px] h-[28px] bg-white/10 flex-shrink-0"></div>
                <div className="flex-1 text-center">
                  <div className="font-sora text-[17px] font-bold text-white leading-none">{totalDriveMins}m</div>
                  <div className="text-[10px] text-white/50 mt-[3px]">Drive</div>
                </div>
                <button 
                  onClick={() => router.push("/day")}
                  className="bg-pro-gold text-primary-navy border-none rounded-[8px] py-[7px] px-[12px] text-[12px] font-bold cursor-pointer flex items-center gap-[5px] ml-3.5 whitespace-nowrap"
                >
                  <ArrowRight className="w-[13px] h-[13px] stroke-2" />
                  <span>Start</span>
                </button>
              </div>

              {/* COMPACT JOB LIST */}
              <div className="flex flex-col">
                {jobs.map((job: any) => <CompactJobItem key={job.id} job={job} />)}
              </div>

              {/* GAP FINDER HINT */}
              {isPro && jobs.length > 0 && (
                <div className="bg-violet-light border border-violet-200 rounded-[10px] p-[14px] px-[16px] mt-1 flex items-center gap-3">
                  <div className="w-[36px] h-[36px] bg-violet-100 rounded-[8px] flex items-center justify-center flex-shrink-0 text-violet">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-primary-navy mb-[2px]">1 gap opportunity found today</div>
                    <div className="text-[12px] text-slate-secondary">1847 Crenshaw Blvd · $125 offered · 2:00 PM</div>
                  </div>
                  <span onClick={() => useUIStore.getState().openCITT()} className="text-[12px] font-semibold text-violet cursor-pointer flex items-center gap-[3px]">
                    CITT <ChevronRight className="w-3.5 h-3.5 stroke-2" />
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== 
               S-09: EMPTY DASHBOARD
               ============================================================== */
            <div className="flex-1">
              <div className="p-[14px] px-5 lg:px-7 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
                <span className="text-[14px] font-medium text-slate-secondary">
                  Good {greeting} · {format(parseISO(activeDate), "EEEE, MMMM d")}
                </span>
                <Link href="/jobs/new" className="bg-primary-navy text-white border-none rounded-[8px] h-[36px] text-[13px] font-semibold cursor-pointer inline-flex items-center justify-center gap-[6px] px-[14px] font-inter">
                  <Plus className="w-4 h-4" /><span>Add job</span>
                </Link>
              </div>
              <div className="p-5 lg:p-7 flex flex-col gap-3">
                
                <div className="bg-white border border-border rounded-[14px] py-[40px] px-7 text-center shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-[12px] bg-blue-light flex items-center justify-center mx-auto mb-[18px] text-interactive-blue">
                    <CalendarDays className="w-6 h-6 stroke-2" />
                  </div>
                  <div className="font-sora font-semibold text-[18px] text-primary-navy mb-2">No signings today</div>
                  <p className="text-[13px] text-slate-secondary leading-[1.6] max-w-[280px] mx-auto mb-6">
                    Add your first job or run a Can I Take This? check on an incoming signing request to get started.
                  </p>
                  <div className="flex flex-col gap-[10px] max-w-[300px] mx-auto">
                    <Link href="/jobs/new" className="bg-primary-navy text-white rounded-[8px] h-[44px] text-[14px] font-semibold flex items-center justify-center gap-[6px] px-5">
                      <Plus className="w-4 h-4 stroke-2" /><span>Add a job</span>
                    </Link>
                    <button onClick={() => useUIStore.getState().openCITT()} className="bg-white border-[1.5px] border-primary-navy text-primary-navy rounded-[8px] h-[44px] text-[14px] font-semibold flex items-center justify-center gap-[6px] px-5">
                      <Sparkles className="w-4 h-4 stroke-2" /><span>Run Can I Take This?</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-[10px]">
                  <div className="bg-white border border-border rounded-[12px] p-4 flex-1 text-center">
                    <span className="font-sora text-[22px] font-bold text-navy block mb-[3px]">$0</span>
                    <span className="text-[11px] text-slate-secondary block">This week</span>
                  </div>
                  <div className="bg-white border border-border rounded-[12px] p-4 flex-1 text-center">
                    <span className="font-sora text-[22px] font-bold text-navy block mb-[3px]">0</span>
                    <span className="text-[11px] text-slate-secondary block">Jobs this month</span>
                  </div>
                  <div className="bg-white border border-border rounded-[12px] p-4 flex-1 text-center">
                     <span className="font-sora text-[22px] font-bold text-navy block mb-[3px]">—</span>
                     <span className="text-[11px] text-slate-secondary block">Avg net/job</span>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-[12px] py-[16px] px-[18px] flex items-start gap-3">
                  <div className="w-[36px] h-[36px] bg-amber-light rounded-[8px] flex items-center justify-center flex-shrink-0 text-amber-warning">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-primary-navy mb-[3px]">Try a CITT check first</div>
                    <div className="text-[12px] text-slate-secondary leading-[1.5]">Got an incoming signing request? Check if it fits your schedule and what you'll actually earn after mileage — before you commit.</div>
                  </div>
                </div>
              </div>

              {/* PRO BANNER */}
              {!isPro && (
                <div className="bg-white border-t border-border py-[14px] px-[20px] lg:px-[28px] flex items-center justify-between gap-3 flex-shrink-0">
                  <div>
                    <div className="text-[13px] font-semibold text-primary-navy mb-[2px]">Upgrade to Pro</div>
                    <div className="text-[12px] text-slate-secondary">Route optimisation · Gap Finder · Booking page · Auto invoicing</div>
                  </div>
                  <Link href="/settings/billing" className="bg-pro-gold text-primary-navy rounded-[8px] py-[8px] px-[16px] text-[13px] font-bold flex items-center gap-[5px] whitespace-nowrap">
                    <Sparkles className="w-[14px] h-[14px]" /><span>Upgrade</span>
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ==============================================================
   CompactJobItem (S-10 List Style) 
   ============================================================== */
function CompactJobItem({ job }: { job: any }) {
  const net = parseFloat(job.net_earnings ?? job.fee ?? "0") || 0;
  const isGood = net >= 30;
  const isFair = net >= 10 && net < 30;
  const feeColor = isGood ? "text-teal-success" : isFair ? "text-amber-warning" : "text-slate-body";
  const startTime = job.appointment_time ? format(parseISO(job.appointment_time), "h:mm a") : "—";
  
  // Basic scanback check
  const hasScanback = Number(job.scanback_duration_mins) > 0 || job.signing_type === "LOAN_REFI";

  return (
    <Link href={`/jobs/${job.id}`} className="bg-white border border-border rounded-[10px] p-[12px] px-[14px] mb-[7px] flex items-center justify-between gap-[10px] hover:border-slate-secondary transition-colors">
      <div className="flex items-center gap-[10px] flex-1 min-w-0">
        <div className={cn("w-[36px] h-[36px] rounded-[8px] flex items-center justify-center flex-shrink-0", hasScanback ? "bg-amber-light text-amber-warning" : "bg-blue-light text-interactive-blue")}>
          <Clock className="w-4 h-4 stroke-2" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-primary-navy mb-[2px]">{startTime} · {job.signing_duration_mins ?? 30} min</div>
          <div className="text-[12px] text-slate-secondary whitespace-nowrap overflow-hidden text-ellipsis">{job.address || "No address"}</div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={cn("text-[14px] font-bold mb-[2px]", feeColor)}>
          {formatCurrency(net)}
        </div>
        <span className={cn(
          "inline-flex items-center gap-[3px] px-[7px] py-[3px] rounded-[4px] text-[10px] font-semibold tracking-[0.2px] uppercase whitespace-nowrap",
          getTypeColorClass(job.signing_type)
        )}>
          {formatSigningType(job.signing_type)}
        </span>
      </div>
    </Link>
  );
}

function getTypeColorClass(type: string): string {
  const map: Record<string, string> = {
    GENERAL: "bg-[#D1FAE5] text-[#065F46]", // cg
    LOAN_REFI: "bg-[#DBEAFE] text-[#1D4ED8]", // cl
    HYBRID: "bg-violet-light text-violet", // ch
    PURCHASE_CLOSING: "bg-[#F1F5F9] text-[#64748B]", // cp
    FIELD_INSPECTION: "bg-border text-slate", // cfr
  };
  return map[type] ?? "bg-[#F1F5F9] text-[#64748B]";
}

function formatSigningType(type: string): string {
  const map: Record<string, string> = {
    GENERAL: "General",
    LOAN_REFI: "Loan Refi",
    HYBRID: "Hybrid",
    PURCHASE_CLOSING: "Purchase",
    FIELD_INSPECTION: "Field Insp.",
    APOSTILLE: "Apostille",
  };
  return map[type] ?? type ?? "Job";
}

/* ==============================================================
   WeekAtAGlanceBars Component
   ============================================================== */
function WeekAtAGlanceBars({ weekDays, weekJobs, maxEarn }: any) {
  return (
    <div className="flex items-end gap-[6px] h-[56px]">
      {weekDays.map((d: any, idx: number) => {
        const dayJobs = weekJobs.filter((j: any) => j.appointment_time?.startsWith(d.iso));
        const dayEarn = dayJobs.reduce((sum: number, j: any) => sum + (parseFloat(j.net_earnings ?? j.fee ?? "0") || 0), 0);
        
        let h = 4;
        if (dayJobs.length > 0 && maxEarn > 0) {
          h = Math.max(4, Math.min(52, (dayEarn / maxEarn) * 52));
        }

        return (
          <div key={d.iso} className="flex-1 flex flex-col items-center gap-[4px]">
            <span className="text-[10px] text-slate-secondary font-medium min-h-[14px]">
              {dayJobs.length > 0 ? formatCurrency(dayEarn) : ""}
            </span>
            <div 
              className={cn(
                "w-full rounded-t-[4px] transition-all min-h-[4px]",
                d.isToday ? "bg-primary-navy" : dayJobs.length > 0 ? "bg-[#BFDBFE]" : "bg-border"
              )}
              style={{ height: `${h}px` }}
            />
            <span className={cn(
              "text-[10px]",
              d.isToday ? "text-primary-navy font-semibold" : "text-muted font-normal"
            )}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}
