"use client";

import { formatCurrency } from "@/lib/utils";

interface PeriodData {
  period: string;
  gross: number;
  net: number;
  jobs: number;
  miles: number;
}

interface EarningsChartProps {
  periods: PeriodData[];
  className?: string;
}

export default function EarningsChart({
  periods,
  className,
}: EarningsChartProps) {
  const maxNet = Math.max(...periods.map((p) => p.net), 1);

  if (periods.length === 0) {
    return (
      <div
        className={`bg-white border border-border rounded-12px p-5 ${className ?? ""}`}
      >
        <div className="font-inter text-sm font-semibold text-primary-navy mb-4">
          Income over time
        </div>
        <div className="h-32 flex items-center justify-center text-sm text-slate-secondary">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-border rounded-12px p-5 ${className ?? ""}`}
    >
      <div className="font-inter text-sm font-semibold text-primary-navy mb-4">
        Income over time
      </div>
      <div className="flex items-end gap-1 h-32">
        {periods.map((p, i) => {
          const pct = Math.max((p.net / maxNet) * 100, 4);
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-primary-navy text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                {formatCurrency(p.net)} net · {p.jobs} jobs
              </div>
              {/* Bar */}
              <div
                className="w-full rounded-t-sm overflow-hidden"
                style={{ height: `${pct}%` }}
              >
                <div className="w-full h-full bg-teal-success hover:bg-teal-success/80 transition-colors" />
              </div>
              <span className="font-inter text-[9px] text-muted truncate w-full text-center">
                {p.period.slice(-2)}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="font-inter text-[10px] text-slate-secondary">
          {periods.length} periods · {periods.reduce((s, p) => s + p.jobs, 0)}{" "}
          total jobs
        </span>
        <span className="font-inter text-[10px] text-teal-success font-semibold">
          {formatCurrency(periods.reduce((s, p) => s + p.net, 0))} total net
        </span>
      </div>
    </div>
  );
}
