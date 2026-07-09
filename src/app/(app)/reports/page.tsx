"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/accounting.api";
import { formatCurrency } from "@/lib/utils";
import MileageLog from "@/components/reports/MileageLog";

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [tab, setTab] = useState<"mileage" | "tax">("mileage");

  const { data: mileage, isLoading: mileageLoading } = useQuery({
    queryKey: ["mileage", year],
    queryFn: async () => {
      const res = await reportsApi.mileage(year);
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any;
    },
    enabled: tab === "mileage",
  });

  const { data: tax, isLoading: taxLoading } = useQuery({
    queryKey: ["tax-report", year],
    queryFn: async () => {
      const res = await reportsApi.tax(year);
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any;
    },
    enabled: tab === "tax",
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
        <h1 className="font-sora font-bold text-xl text-primary-navy">
          Reports
        </h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-9 px-3 border border-border rounded-8px font-inter text-sm"
        >
          {[2026, 2025, 2024].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="px-4 lg:px-8 py-3 bg-white border-b border-border flex gap-2 flex-shrink-0">
        <button
          onClick={() => setTab("mileage")}
          className={`px-4 py-1.5 rounded-lg font-inter text-xs font-medium border ${tab === "mileage" ? "border-primary-navy bg-blue-bg text-primary-navy font-semibold" : "border-border text-slate-secondary"}`}
        >
          Mileage Log
        </button>
        <button
          onClick={() => setTab("tax")}
          className={`px-4 py-1.5 rounded-lg font-inter text-xs font-medium border ${tab === "tax" ? "border-primary-navy bg-blue-bg text-primary-navy font-semibold" : "border-border text-slate-secondary"}`}
        >
          Tax Report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {tab === "mileage" && (
          <>
            {mileageLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
              </div>
            ) : (
              mileage && (
                <MileageLog
                  entries={mileage.entries ?? []}
                  totalMiles={mileage.totalMiles}
                  totalDeduction={mileage.totalDeduction}
                  irsRate={mileage.irsRate}
                  year={year}
                />
              )
            )}
          </>
        )}

        {tab === "tax" && (
          <>
            {taxLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
              </div>
            ) : (
              tax && (
                <div className="space-y-4">
                  <div className="bg-white border border-border rounded-12px p-5">
                    <div className="font-inter text-sm font-semibold text-primary-navy mb-4">
                      Tax Summary — {year}
                    </div>
                    <div className="space-y-3">
                      {[
                        [
                          "Gross income",
                          formatCurrency(tax.income?.gross ?? 0),
                        ],
                        [
                          "Mileage deduction",
                          `−${formatCurrency(tax.mileage?.totalDeduction ?? 0)}`,
                        ],
                        [
                          "Total miles driven",
                          `${(tax.mileage?.totalMiles ?? 0).toFixed(1)} mi`,
                        ],
                        [
                          "Business expenses",
                          `−${formatCurrency(tax.expenses?.total ?? 0)}`,
                        ],
                        [
                          "Notarial acts performed",
                          String(tax.notarialActs ?? 0),
                        ],
                        ["Net income", formatCurrency(tax.income?.net ?? 0)],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                        >
                          <span className="font-inter text-sm text-slate-body">
                            {label}
                          </span>
                          <span className="font-inter text-sm font-semibold text-primary-navy">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expenses by category */}
                  {tax.expenses?.byCategory &&
                    Object.keys(tax.expenses.byCategory).length > 0 && (
                      <div className="bg-white border border-border rounded-12px p-5">
                        <div className="font-inter text-sm font-semibold text-primary-navy mb-3">
                          Expenses by category
                        </div>
                        {Object.entries(tax.expenses.byCategory).map(
                          ([cat, amt]) => (
                            <div
                              key={cat}
                              className="flex justify-between py-2 border-b border-border last:border-b-0"
                            >
                              <span className="font-inter text-sm text-slate-body capitalize">
                                {cat.toLowerCase()}
                              </span>
                              <span className="font-inter text-sm font-medium text-primary-navy">
                                {formatCurrency(amt as number)}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                  <p className="font-inter text-[11px] text-muted text-center italic">
                    For informational purposes only — not tax advice. Consult
                    your accountant.
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
