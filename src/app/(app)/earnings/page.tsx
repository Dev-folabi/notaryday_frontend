"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/accounting.api";
import { formatCurrency } from "@/lib/utils";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
} from "date-fns";
import { TrendingUp, DollarSign, Car, Clock } from "lucide-react";
import EarningsChart from "@/components/reports/EarningsChart";

type Period = "month" | "quarter" | "year";

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const now = new Date();

  const getRange = () => {
    if (period === "month")
      return {
        from: format(startOfMonth(now), "yyyy-MM-dd"),
        to: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    if (period === "quarter")
      return {
        from: format(subMonths(startOfMonth(now), 2), "yyyy-MM-dd"),
        to: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    return {
      from: format(startOfYear(now), "yyyy-MM-dd"),
      to: format(endOfMonth(now), "yyyy-MM-dd"),
    };
  };

  const range = getRange();

  const { data, isLoading } = useQuery({
    queryKey: ["earnings", period],
    queryFn: async () => {
      const res = await reportsApi.earnings(
        range.from,
        range.to,
        period === "year" ? "month" : "week",
      );
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any;
    },
  });

  const summary = data?.summary;
  const periods = data?.periods ?? [];
  const topClients = data?.topClients ?? [];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
        <h1 className="font-sora font-bold text-xl text-primary-navy">
          Earnings
        </h1>
        <div className="flex gap-1.5">
          {(["month", "quarter", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg font-inter text-xs font-medium border ${period === p ? "border-primary-navy bg-blue-bg text-primary-navy font-semibold" : "border-border text-slate-secondary"}`}
            >
              {p === "month"
                ? "This month"
                : p === "quarter"
                  ? "Quarter"
                  : "Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-white border border-border rounded-12px p-4">
                <DollarSign className="w-4 h-4 text-teal-success mb-2" />
                <div className="font-sora text-xl font-bold text-teal-success">
                  {formatCurrency(summary?.net ?? 0)}
                </div>
                <div className="font-inter text-[10px] text-slate-secondary mt-1">
                  Net income
                </div>
              </div>
              <div className="bg-white border border-border rounded-12px p-4">
                <TrendingUp className="w-4 h-4 text-primary-navy mb-2" />
                <div className="font-sora text-xl font-bold text-primary-navy">
                  {formatCurrency(summary?.gross ?? 0)}
                </div>
                <div className="font-inter text-[10px] text-slate-secondary mt-1">
                  Gross income
                </div>
              </div>
              <div className="bg-white border border-border rounded-12px p-4">
                <Car className="w-4 h-4 text-amber-warning mb-2" />
                <div className="font-sora text-xl font-bold text-amber-warning">
                  −{formatCurrency(summary?.mileageCost ?? 0)}
                </div>
                <div className="font-inter text-[10px] text-slate-secondary mt-1">
                  Mileage cost
                </div>
              </div>
              <div className="bg-white border border-border rounded-12px p-4">
                <Clock className="w-4 h-4 text-interactive-blue mb-2" />
                <div className="font-sora text-xl font-bold text-interactive-blue">
                  {formatCurrency(summary?.effectiveHourly ?? 0)}/hr
                </div>
                <div className="font-inter text-[10px] text-slate-secondary mt-1">
                  Effective rate
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <EarningsChart periods={periods} className="mb-6" />

            {/* Top clients */}
            {topClients.length > 0 && (
              <div className="bg-white border border-border rounded-12px p-5">
                <div className="font-inter text-sm font-semibold text-primary-navy mb-3">
                  Top clients / platforms
                </div>
                {topClients.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                  >
                    <span className="font-inter text-sm text-slate-body">
                      {c.name}
                    </span>
                    <span className="font-inter text-sm font-semibold text-primary-navy">
                      {formatCurrency(c.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
