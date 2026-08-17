"use client";

import { useGaps, useTodayPlan, type TodayPlan } from "@/hooks/usePlanner";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import {
  toDateInputValue,
  formatCurrency,
  formatMiles,
  importEmailFor,
} from "@/lib/utils";
import ProGate from "@/components/ui/ProGate";
import { Sparkles, Info, ChevronLeft, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import DaySummaryStrip from "@/components/planner/DaySummaryStrip";

export default function GapPage() {
  const { user } = useAuth();
  const { activeDate } = useUIStore();
  const router = useRouter();
  const date = activeDate || toDateInputValue(new Date());
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  const { data: gaps = [], isLoading: gapsLoading } = useGaps(date);
  const { data: plan, isLoading: planLoading } = useTodayPlan(date);

  const totalCandidates = gaps.reduce((s, g) => s + g.candidates.length, 0);

  const content = (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-back" onClick={() => router.push("/day")}>
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Day timeline
        </div>
        <div className="ph-title">
          <Sparkles className="w-4 h-4 text-violet" /> Gap Finder
        </div>
        <div style={{ minWidth: 60 }} />
      </div>

      {/* Navy summary strip */}
      {plan && <GapDayStrip plan={plan} />}

      <div className="con">
        <div className="alert al-violet mb-4">
          <Sparkles className="w-4 h-4" />
          <div className="text-[11px] leading-[1.4]">
            <strong>Gap Finder</strong> scans your pending jobs and surfaces
            ones that fit inside free windows in your day based on geography,
            drive time, and scanback commitments. Tap CITT to evaluate before
            accepting.
          </div>
        </div>

        {gapsLoading || planLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-violet rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {gaps.map((gap, gapIdx) => {
              const startLabel = format(parseISO(gap.gap_start), "h:mm a");
              const endLabel = format(parseISO(gap.gap_end), "h:mm a");
              const hasCandidates = gap.candidates.length > 0;
              return (
                <div key={gapIdx} className="mb-3">
                  <div className="flex gap-2 items-center mb-2">
                    <div
                      className="w-[3px] h-8 rounded-full flex-shrink-0"
                      style={{
                        background: hasCandidates ? "#7C3AED" : "var(--border)",
                      }}
                    />
                    <div>
                      <div className="text-[12px] font-bold text-primary-navy">
                        Gap - {startLabel} to {endLabel}
                      </div>
                      <div className="text-[11px] text-slate-secondary">
                        {gap.gap_mins} min free, after {gap.prev_job_label}{" "}
                        {hasCandidates ? "" : "· no pending jobs fit this window"}
                      </div>
                    </div>
                  </div>

                  <div className="ml-2.5">
                    {hasCandidates ? (
                      gap.candidates.map((candidate, cIdx) => (
                        <div
                          key={cIdx}
                          className="gap-card"
                          style={{ marginBottom: 8 }}
                        >
                          <div className="flex justify-between gap-2 mb-1.5 flex-wrap">
                            <div className="flex-1 min-w-[160px]">
                              <div className="text-[12px] font-bold text-primary-navy mb-0.5">
                                {candidate.address}
                              </div>
                              <div className="text-[11px] text-slate-secondary mb-1.5 flex gap-1.5 flex-wrap">
                                <span>
                                  {formatSigningType(
                                    candidate.signing_type as string,
                                  )}{" "}
                                  - {candidate.signing_duration_mins} min
                                </span>
                                <span>
                                  {format(
                                    parseISO(candidate.appointment_time),
                                    "h:mm a",
                                  )}{" "}
                                  start
                                </span>
                                {candidate.miles_from != null && (
                                  <span>
                                    {formatMiles(candidate.miles_from)} from{" "}
                                    {candidate.miles_from_label}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 flex-wrap">
                                <span
                                  className={cn(
                                    "chip",
                                    getTypeChipClass(
                                      candidate.signing_type as string,
                                    ),
                                  )}
                                >
                                  {formatSigningType(
                                    candidate.signing_type as string,
                                  )}
                                </span>
                                {candidate.platform_name && (
                                  <span className="chip c-plat">
                                    {candidate.platform_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[14px] font-bold text-primary-navy">
                                {formatCurrency(candidate.fee)}
                              </div>
                              <div className="text-[9px] text-slate-secondary">
                                offered
                              </div>
                              <div className="text-[12px] font-bold text-teal mt-0.5">
                                ~{formatCurrency(candidate.net_earnings)} net
                              </div>
                            </div>
                          </div>
                          <button
                            className="btn-sm w-full"
                            style={{ borderColor: "#C4B5FD", color: "#7C3AED" }}
                            onClick={() =>
                              useUIStore.getState().openCITT({
                                address: candidate.address,
                                time: candidate.appointment_time,
                                type: candidate.signing_type,
                                fee: candidate.fee,
                              })
                            }
                          >
                            <Zap className="w-3 h-3" /> Run CITT check
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="bg-bg border border-border rounded-[8px] p-2.5 flex gap-2 items-center">
                        <Info className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-[11px] text-muted">
                          No pending jobs match this gap geographically.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="h-px bg-border my-3.5" />

            {gaps.length === 0 ? (
              <div className="bg-bg border border-border rounded-[8px] p-3.5 text-center">
                <div className="text-[12px] font-semibold text-primary-navy mb-1">
                  No gaps today
                </div>
                <div className="text-[11px] text-slate-secondary leading-[1.5]">
                  Add a second signing or confirm a pending job to unlock free
                  windows between appointments.
                </div>
              </div>
            ) : null}

            <div className="alert al-blue">
              <Info className="w-4 h-4" />
              <div>
                <div className="text-[11px] font-semibold mb-0.5">
                  {totalCandidates} pending job
                  {totalCandidates === 1 ? "" : "s"}  matched today&apos;s gaps
                </div>
                <div className="text-[11px] leading-[1.4]">
                  Don&apos;t see one? Forward Snapdocs confirmations to{" "}
                  <span
                    className="font-mono text-[10px]"
                    style={{
                      background: "rgba(37,99,235,.1)",
                      padding: "1px 4px",
                      borderRadius: 3,
                    }}
                  >
                    {importEmailFor(user?.username)}
                  </span>{" "}
                  to load it into your inbox.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (!isPro) {
    return (
      <div className="h-full">
        <ProGate feature="Gap Finder">{content}</ProGate>
      </div>
    );
  }

  return content;
}

function GapDayStrip({ plan }: { plan: TodayPlan }) {
  const s = plan.summary ?? {};
  const driveMins = s.total_drive_mins ?? 0;
  return (
    <DaySummaryStrip
      items={[
        { value: s.total_jobs ?? 0, label: "Signings" },
        { value: formatCurrency(s.total_earnings ?? 0), label: "Est. net" },
        { value: `${Math.floor(driveMins / 60)}h ${driveMins % 60}m`, label: "Drive time" },
      ]}
      cursor="default"
    />
  );
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
