"use client";

import { useGaps } from "@/hooks/usePlanner";
import { useTodayPlan } from "@/hooks/usePlanner";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { toDateInputValue, formatCurrency } from "@/lib/utils";
import ProGate from "@/components/ui/ProGate";
import DaySummaryStrip from "@/components/planner/DaySummaryStrip";
import GapFinderCard from "@/components/planner/GapFinderCard";
import {
  Sparkles,
  Info,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function GapPage() {
  const { user } = useAuth();
  const { activeDate } = useUIStore();
  const date = activeDate || toDateInputValue(new Date());
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  const { data: gaps = [], isLoading: gapsLoading, refetch } = useGaps(date);
  const { data: plan, isLoading: planLoading } = useTodayPlan(date);

  const totalGaps = gaps.length;
  const totalCandidates = gaps.reduce((s, g) => s + g.candidates.length, 0);

  const content = (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/today"
            className="flex items-center gap-1 font-inter text-[12px] font-medium text-slate-secondary hover:text-primary-navy transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Today
          </Link>
          <span className="text-border">|</span>
          <h1 className="font-sora font-bold text-[17px] text-primary-navy flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet" />
            Gap Finder
          </h1>
          {totalCandidates > 0 && (
            <span className="text-[10px] font-bold bg-violet-bg text-violet px-2 py-0.5 rounded-full border border-violet-border">
              {totalCandidates} fit
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={gapsLoading}
          className="w-9 h-9 rounded-[8px] border border-border flex items-center justify-center text-slate-secondary hover:border-slate-secondary transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4", gapsLoading && "animate-spin")} />
        </button>
      </div>

      {/* Day summary strip */}
      {plan && (
        <div className="flex-shrink-0">
          <DaySummaryStrip
            totalJobs={plan.summary.total_jobs}
            totalDriveMins={plan.summary.total_drive_mins}
            totalEarnings={plan.summary.total_earnings}
            totalMiles={plan.summary.total_miles}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 max-w-2xl mx-auto">
          {/* Explainer */}
          <div className="flex items-start gap-2.5 p-3 bg-violet-bg border border-violet-border rounded-[10px] mb-5">
            <Sparkles className="w-4 h-4 text-violet flex-shrink-0 mt-0.5" />
            <p className="font-inter text-[11px] text-violet leading-relaxed">
              <strong>Gap Finder</strong> scans your confirmed schedule and surfaces
              pending jobs that physically fit inside free windows — accounting for
              drive time, signing duration, and scanback commitments. Tap{" "}
              <strong>CITT</strong> on any match to evaluate before accepting.
            </p>
          </div>

          {gapsLoading || planLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-border border-t-violet rounded-full animate-spin" />
            </div>
          ) : gaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-violet-bg flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-violet" />
              </div>
              <p className="font-inter text-sm font-semibold text-primary-navy mb-1">
                No gaps found today
              </p>
              <p className="font-inter text-xs text-slate-secondary max-w-[260px] leading-relaxed">
                Either your schedule is fully packed, or there are no pending
                jobs that fit your open windows. Add pending jobs to see
                opportunities.
              </p>
              <Link
                href="/jobs/new"
                className="mt-4 font-inter text-sm font-semibold text-interactive-blue hover:underline"
              >
                Add a pending job
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {gaps.map((gap, gapIdx) => {
                const startLabel = format(parseISO(gap.gap_start), "h:mm a");
                const endLabel = format(parseISO(gap.gap_end), "h:mm a");
                const hours = Math.floor(gap.gap_mins / 60);
                const mins = gap.gap_mins % 60;
                const durationLabel =
                  hours > 0
                    ? `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim()
                    : `${mins}m`;

                return (
                  <div key={gapIdx}>
                    {/* Gap window header */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-[3px] h-8 bg-violet rounded-full flex-shrink-0" />
                      <div>
                        <p className="font-inter text-[13px] font-bold text-primary-navy">
                          Gap — {startLabel} to {endLabel}
                        </p>
                        <p className="font-inter text-[11px] text-slate-secondary">
                          {durationLabel} free window ·{" "}
                          {gap.candidates.length} job
                          {gap.candidates.length !== 1 ? "s" : ""} fit this
                          window
                        </p>
                      </div>
                    </div>

                    {/* Candidates */}
                    {gap.candidates.length > 0 ? (
                      <div className="ml-3 space-y-2">
                        {gap.candidates.map((candidate, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-violet-bg border-l-[3px] border-l-violet rounded-r-[12px] p-3.5"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2.5">
                              <div className="flex-1 min-w-0">
                                <p className="font-inter text-[13px] font-semibold text-primary-navy truncate mb-0.5">
                                  {candidate.address}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-inter text-[11px] text-slate-secondary">
                                    {candidate.signing_type
                                      ? (
                                          {
                                            GENERAL: "General",
                                            LOAN_REFI: "Loan Refi",
                                            HYBRID: "Hybrid",
                                            PURCHASE_CLOSING: "Purchase",
                                            FIELD_INSPECTION: "Field Inspection",
                                            APOSTILLE: "Apostille",
                                          }[candidate.signing_type] ??
                                          candidate.signing_type
                                        )
                                      : ""}
                                  </span>
                                  <span className="text-muted text-[10px]">·</span>
                                  <span className="font-inter text-[11px] text-slate-secondary">
                                    Offered:{" "}
                                    <span className="font-semibold text-primary-navy">
                                      {formatCurrency(candidate.fee)}
                                    </span>
                                  </span>
                                  <span className="text-muted text-[10px]">·</span>
                                  <span className="font-inter text-[11px] text-teal-success font-semibold">
                                    ~{formatCurrency(candidate.net_earnings)} net
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* CITT CTA */}
                            <GapFinderCard gap={{ ...gap, candidates: [candidate] }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-3 flex items-center gap-2 p-3 bg-slate-50 border border-border rounded-[10px]">
                        <Info className="w-4 h-4 text-muted flex-shrink-0" />
                        <p className="font-inter text-[11px] text-muted">
                          No pending jobs fit this window
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Footer tip */}
              <div className="flex items-start gap-2 p-3 bg-blue-bg border border-blue-border rounded-[10px]">
                <Info className="w-4 h-4 text-interactive-blue flex-shrink-0 mt-0.5" />
                <p className="font-inter text-[11px] text-interactive-blue leading-relaxed">
                  Gap Finder only evaluates jobs in{" "}
                  <strong>Pending</strong> status. To add more candidates,
                  create jobs with Pending status from{" "}
                  <Link href="/jobs" className="underline font-semibold">
                    My Jobs
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isPro) {
    return <ProGate feature="Gap Finder">{content}</ProGate>;
  }

  return content;
}
