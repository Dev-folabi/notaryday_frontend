"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { BarChart2, DollarSign } from "lucide-react";
import { reportsApi } from "@/api/accounting.api";
import { formatCurrency, cn, unwrap } from "@/lib/utils";
import type { EarningsReport, PeriodBar, TypeBreakdown } from "@/types/reports";

type Period = "month" | "ytd";

const TYPE_CHIP: Record<string, string> = {
  loan_refi: "c-loan",
  purchase_closing: "c-loan",
  hybrid: "c-hyb",
  general: "c-gen",
  field_inspection: "c-gen",
  apostille: "c-gen",
};
const TYPE_LABEL: Record<string, string> = {
  loan_refi: "Loan Refi",
  purchase_closing: "Purchase Closing",
  hybrid: "Hybrid",
  general: "General",
  field_inspection: "Field Inspection",
  apostille: "Apostille",
};

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>("ytd");
  const now = new Date();

  const range =
    period === "month"
      ? {
          from: format(startOfMonth(now), "yyyy-MM-dd"),
          to: format(endOfMonth(now), "yyyy-MM-dd"),
        }
      : {
          from: format(startOfYear(now), "yyyy-MM-dd"),
          to: format(endOfMonth(now), "yyyy-MM-dd"),
        };

  const { data, isLoading } = useQuery({
    queryKey: ["earnings", period],
    queryFn: async () => {
      const res = await reportsApi.earnings(
        range.from,
        range.to,
        period === "ytd" ? "month" : "week",
      );
      return unwrap<EarningsReport>(res);
    },
  });

  const summary = data?.summary ?? {};
  const periods: PeriodBar[] = useMemo(() => data?.periods ?? [], [data]);
  const byType: TypeBreakdown[] = data?.byType ?? data?.bySigningType ?? [];

  const maxBar = useMemo(
    () => Math.max(...periods.map((p) => Number(p.net ?? p.gross ?? 0)), 1),
    [periods],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Earnings</div>
        <div className="flex gap-1 bg-border p-[3px] rounded-[8px]">
          {(["month", "ytd"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2.5 py-[5px] rounded-[6px] font-inter text-[11px] transition-colors",
                period === p
                  ? "bg-white text-navy font-semibold shadow-[0_1px_3px_rgba(0,0,0,.08)]"
                  : "bg-transparent text-slate-secondary font-medium",
              )}
            >
              {p === "month" ? "This month" : "YTD 2026"}
            </button>
          ))}
        </div>
      </div>

      <div className="con">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-blue rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Date range line */}
            <div className="flex items-center mb-3.5">
              <span className="font-inter text-[11px] text-slate-secondary ml-auto">
                {format(new Date(range.from), "MMM d")} to{" "}
                {format(new Date(range.to), "MMM d, yyyy")}
              </span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2 mb-4">
              <div className="mcard">
                <span className="mc-v text-navy">
                  {formatCurrency(summary.gross ?? 0)}
                </span>
                <span className="mc-l">Gross income</span>
              </div>
              <div className="mcard">
                <span className="mc-v text-teal">
                  {formatCurrency(summary.net ?? 0)}
                </span>
                <span className="mc-l">Net income</span>
              </div>
              <div className="mcard">
                <span className="mc-v text-amber">
                  −{formatCurrency(summary.mileageCost ?? summary.mileage ?? 0)}
                </span>
                <span className="mc-l">Mileage cost</span>
              </div>
              <div className="mcard">
                <span className="mc-v text-amber">
                  −
                  {formatCurrency(
                    summary.platformFees ?? summary.platform ?? 0,
                  )}
                </span>
                <span className="mc-l">Platform fees</span>
              </div>
              <div className="mcard">
                <span className="mc-v text-navy">
                  {formatCurrency(summary.effectiveHourly ?? 0)}/hr
                </span>
                <span className="mc-l">Effective hourly</span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="card p-4 mb-4">
              <div className="flex justify-between mb-2.5 flex-wrap gap-1.5">
                <div className="font-inter text-[12px] font-semibold text-navy">
                  Net income over time
                </div>
                <div className="font-inter text-[11px] text-teal font-medium flex gap-1 items-center">
                  <BarChart2 className="w-3.5 h-3.5" />
                  {summary.signings ??
                    periods.reduce((s, p) => s + (p.jobs ?? 0), 0)}{" "}
                  signings
                </div>
              </div>
              {periods.length === 0 ? (
                <div className="h-16 flex items-center justify-center font-inter text-[11px] text-slate-secondary">
                  No earnings data for this period
                </div>
              ) : (
                <div className="bar-wrap">
                  {periods.map((b, i) => {
                    const val = Number(b.net ?? b.gross ?? 0);
                    const h = Math.max((val / maxBar) * 56, 4);
                    const isLast = i === periods.length - 1;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-[3px]"
                      >
                        <span
                          className={cn(
                            "text-[9px]",
                            isLast
                              ? "text-navy font-semibold"
                              : "text-slate-secondary",
                          )}
                        >
                          {val > 0 ? formatCurrency(val) : ""}
                        </span>
                        <div
                          className={cn(
                            "bar w-full",
                            isLast ? "active" : val > 0 ? "has" : "",
                          )}
                          style={{ height: `${h}px` }}
                        />
                        <span
                          className={cn(
                            "text-[9px]",
                            isLast ? "text-navy font-semibold" : "text-muted",
                          )}
                        >
                          {b.period ?? b.label ?? ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Breakdown by signing type */}
            <div className="card p-3">
              <div className="font-inter text-[11px] font-semibold text-navy mb-2">
                By signing type
              </div>
              {byType.length === 0 ? (
                <div className="font-inter text-[11px] text-slate-secondary py-3 text-center">
                  No signings recorded yet
                </div>
              ) : (
                byType.map((t: TypeBreakdown, i: number) => {
                  const key = (t.signing_type ?? t.type ?? "").toLowerCase();
                  return (
                    <div
                      key={i}
                      className="flex justify-between py-1.5 border-b border-border last:border-b-0 gap-2"
                    >
                      <div>
                        <div className="mb-0.5">
                          <span
                            className={cn(
                              "chip !text-[8px]",
                              TYPE_CHIP[key] ?? "c-gen",
                            )}
                          >
                            {TYPE_LABEL[key] ?? t.type ?? "Other"}
                          </span>
                        </div>
                        <div className="font-inter text-[10px] text-slate-secondary">
                          {t.count ?? 0} signings
                        </div>
                      </div>
                      <div className="font-inter text-[12px] font-bold text-navy self-center">
                        {formatCurrency(t.gross ?? t.total ?? 0)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {byType.length === 0 && periods.length === 0 && (
              <div className="empty-box mt-4">
                <DollarSign className="w-8 h-8 text-slate-secondary mx-auto mb-2" />
                <p className="font-inter text-sm font-semibold text-navy mb-1">
                  No earnings yet
                </p>
                <p className="font-inter text-xs text-slate-secondary">
                  Complete signings to see your earnings breakdown here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
