"use client";

import { BarChart2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { PeriodBar } from "@/types/reports";

interface EarningsChartProps {
  periods: PeriodBar[];
  yoyPct?: number | null;
}

export default function EarningsChart({ periods, yoyPct }: EarningsChartProps) {
  const maxBar = Math.max(...periods.map((period) => Number(period.net ?? period.gross ?? 0)), 1);
  return (
    <div className="card p-4 mb-4">
      <div className="flex justify-between mb-2.5 flex-wrap gap-1.5">
        <div className="font-inter text-[12px] font-semibold text-navy">Monthly net income</div>
        <div className="font-inter text-[11px] text-teal font-medium flex gap-1 items-center">
          <BarChart2 className="w-3.5 h-3.5" />
          {yoyPct != null ? <span>{yoyPct >= 0 ? "+" : ""}{yoyPct}% vs last year</span> : "Net over time"}
        </div>
      </div>
      {periods.length === 0 ? (
        <div className="h-16 flex items-center justify-center font-inter text-[11px] text-slate-secondary">No data for this period</div>
      ) : (
        <div className="bar-wrap">
          {periods.map((period, index) => {
            const value = Number(period.net ?? period.gross ?? 0);
            const height = Math.max((value / maxBar) * 56, 4);
            const isLast = index === periods.length - 1;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-[3px]">
                <span className={cn("text-[9px]", isLast ? "text-navy font-semibold" : "text-slate-secondary")}>
                  {value > 0 ? formatCurrency(value) : ""}
                </span>
                <div className={cn("bar w-full", isLast ? "active" : value > 0 ? "has" : "")} style={{ height: `${height}px` }} />
                <span className={cn("text-[9px]", isLast ? "text-navy font-semibold" : "text-muted")}>
                  {period.period ?? period.label ?? ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
