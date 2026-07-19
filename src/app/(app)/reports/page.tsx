"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  startOfYear,
  endOfMonth,
} from "date-fns";
import {
  Download,
  BarChart2,
  Car,
  Info,
  FileText,
  Pencil,
} from "lucide-react";
import { reportsApi } from "@/api/accounting.api";
import ProGate from "@/components/ui/ProGate";
import ExpensesView from "@/components/reports/ExpensesView";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, cn, unwrap } from "@/lib/utils";
import type {
  EarningsReport,
  PeriodBar,
  TypeBreakdown,
  MileageReport,
  MileageEntry,
  TaxReport,
} from "@/types/reports";

type Tab = "income" | "mileage" | "tax" | "expenses";
const TABS: Tab[] = ["income", "mileage", "tax", "expenses"];

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

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("income");
  const { addToast } = useUIStore();

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Reports</div>
        <button
          className="btn-sm"
          onClick={() => addToast({ title: "Exporting CSV", type: "info" })}
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn("tab", tab === t && "on")}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="con">
        <ProGate feature="Tax reports are a Pro feature">
          {tab === "income" && <IncomeTab />}
          {tab === "mileage" && <MileageTab />}
          {tab === "tax" && <TaxTab />}
          {tab === "expenses" && <ExpensesView />}
        </ProGate>
      </div>
    </div>
  );
}

/* ---------------- INCOME ---------------- */
function IncomeTab() {
  const now = new Date();
  const range = {
    from: format(startOfYear(now), "yyyy-MM-dd"),
    to: format(endOfMonth(now), "yyyy-MM-dd"),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["reports-income", range.from, range.to],
    queryFn: async () => {
      const res = await reportsApi.earnings(range.from, range.to, "month");
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

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-blue rounded-full animate-spin" />
      </div>
    );

  return (
    <>
      <div className="flex gap-1.5 mb-3.5 flex-wrap items-center">
        <div className="flex gap-1 bg-border p-[3px] rounded-[8px]">
          <button className="px-2.5 py-[5px] rounded-[6px] font-inter text-[11px] font-medium text-slate-secondary bg-transparent">
            This month
          </button>
          <button className="px-2.5 py-[5px] rounded-[6px] font-inter text-[11px] font-semibold text-navy bg-white shadow-[0_1px_3px_rgba(0,0,0,.08)]">
            YTD 2026
          </button>
        </div>
        <span className="font-inter text-[11px] text-slate-secondary ml-auto">
          {format(new Date(range.from), "MMM d")} to{" "}
          {format(new Date(range.to), "MMM d, yyyy")}
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2 mb-4">
        <div className="mcard">
          <span className="mc-v text-navy">
            {formatCurrency(summary.gross ?? 0)}
          </span>
          <span className="mc-l">Gross income</span>
          <div className="mt-1 font-inter text-[10px] text-slate-secondary">
            YTD
          </div>
        </div>
        <div className="mcard">
          <span className="mc-v text-amber">
            {formatCurrency(summary.mileageCost ?? summary.mileage ?? 0)}
          </span>
          <span className="mc-l">Mileage deductions</span>
          <div className="mt-1 font-inter text-[10px] text-slate-secondary">
            YTD
          </div>
        </div>
        <div className="mcard">
          <span className="mc-v text-teal">
            {formatCurrency(summary.net ?? 0)}
          </span>
          <span className="mc-l">Net income</span>
          <div className="mt-1 font-inter text-[10px] text-slate-secondary">
            YTD
          </div>
        </div>
        <div className="mcard">
          <span className="mc-v text-navy">{summary.signings ?? 0}</span>
          <span className="mc-l">Signings</span>
          <div className="mt-1 font-inter text-[10px] text-slate-secondary">
            YTD
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex justify-between mb-2.5 flex-wrap gap-1.5">
          <div className="font-inter text-[12px] font-semibold text-navy">
            Monthly net income
          </div>
          <div className="font-inter text-[11px] text-teal font-medium flex gap-1 items-center">
            <BarChart2 className="w-3.5 h-3.5" /> Net over time
          </div>
        </div>
        {periods.length === 0 ? (
          <div className="h-16 flex items-center justify-center font-inter text-[11px] text-slate-secondary">
            No data for this period
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
    </>
  );
}

/* ---------------- MILEAGE ---------------- */
function MileageTab() {
  const year = new Date().getFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["reports-mileage", year],
    queryFn: async () => {
      const res = await reportsApi.mileage(year);
      return unwrap<MileageReport>(res);
    },
  });

  const entries: MileageEntry[] = data?.entries ?? [];
  const totalMiles = data?.totalMiles ?? 0;
  const totalDeduction = data?.totalDeduction ?? 0;
  const irsRate = data?.irsRate ?? 0.67;

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-blue rounded-full animate-spin" />
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 mb-3.5">
        <div className="mcard">
          <span className="mc-v text-navy !text-[18px]">
            {Number(totalMiles).toFixed(0)} mi
          </span>
          <span className="mc-l">Total miles, YTD</span>
        </div>
        <div className="mcard">
          <span className="mc-v text-amber !text-[18px]">
            {formatCurrency(totalDeduction)}
          </span>
          <span className="mc-l">Deduction value</span>
        </div>
        <div className="mcard">
          <span className="mc-v !text-[18px]">${irsRate}/mi</span>
          <span className="mc-l">IRS rate, {year}</span>
        </div>
      </div>

      <div className="alert al-teal mb-3.5">
        <span>
          <Car className="w-4 h-4" />
        </span>
        <div>
          <div className="font-inter text-[12px] font-semibold mb-0.5">
            Auto tracking is on
          </div>
          <div className="font-inter text-[11px] text-slate-secondary leading-relaxed">
            Mileage is recorded automatically when you tap Navigate. You can edit
            any entry manually.
          </div>
        </div>
      </div>

      <span className="slbl">{format(new Date(), "MMMM yyyy")}</span>
      {entries.length === 0 ? (
        <div className="empty-box mb-4">
          <p className="font-inter text-sm text-slate-secondary">
            No mileage entries for this year.
          </p>
        </div>
      ) : (
        <div className="card px-3 py-0 mb-4">
          {entries.map((r: MileageEntry, i: number) => (
            <div
              key={r.id ?? i}
              className="flex items-center py-2.5 border-b border-border last:border-b-0 gap-2"
            >
              <div className="w-[52px] flex-shrink-0">
                <div className="font-inter text-[11px] font-semibold text-navy">
                  {r.date
                    ? format(new Date(r.date), "MMM dd")
                    : ""}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-inter text-[11px] font-medium text-slate truncate">
                  {r.job ?? r.address ?? "Signing"}
                </div>
                <div className="font-inter text-[10px] text-muted mt-px">
                  <span
                    className={cn(
                      "text-[8px] font-semibold px-1 py-px rounded-[3px]",
                      (r.method ?? "auto") === "auto"
                        ? "bg-teal-bg text-teal"
                        : "bg-background text-slate-secondary",
                    )}
                  >
                    {(r.method ?? "AUTO").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-inter text-[11px] font-bold text-navy">
                  {Number(r.miles ?? 0).toFixed(1)} mi
                </div>
                <div className="font-inter text-[10px] text-amber font-medium">
                  {formatCurrency(r.deduction ?? r.cost ?? 0)}
                </div>
              </div>
              <button className="p-1 text-slate-secondary flex-shrink-0">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------------- TAX ---------------- */
function TaxTab() {
  const year = new Date().getFullYear();
  const { addToast } = useUIStore();
  const { data, isLoading } = useQuery({
    queryKey: ["reports-tax", year],
    queryFn: async () => {
      const res = await reportsApi.tax(year);
      return unwrap<TaxReport>(res);
    },
  });

  const income = data?.income ?? {};
  const mileage = data?.mileage ?? {};
  const expenses = data?.expenses ?? {};

  return (
    <>
      <div className="alert al-blue mb-3.5">
        <span>
          <Info className="w-4 h-4" />
        </span>
        <div className="font-inter text-[11px] leading-relaxed">
          Generate a formatted tax report for any date range. PDF includes total
          gross income, itemised mileage log, IRS deduction total, and net
          income, ready to hand to your accountant.
        </div>
      </div>

      <span className="slbl">Select date range</span>
      <div className="card p-3 mb-4">
        <div className="g2 mb-2.5">
          <div className="field">
            <label className="lbl">From</label>
            <input className="inp" type="date" defaultValue={`${year}-01-01`} />
          </div>
          <div className="field">
            <label className="lbl">To</label>
            <input className="inp" type="date" defaultValue={`${year}-12-31`} />
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap mb-2.5">
          {[`Q1 ${year}`, `Q2 ${year}`, `Full year ${year}`, `Full year ${year - 1}`].map(
            (p, i) => (
              <button
                key={p}
                className={cn(
                  "px-2.5 py-[5px] rounded-[6px] font-inter text-[11px] font-medium border-[1.5px] whitespace-nowrap",
                  i === 2
                    ? "border-navy bg-blue-bg text-navy"
                    : "border-border bg-background text-slate-secondary",
                )}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn-p !w-auto px-4"
            onClick={() =>
              addToast({ title: "Tax report PDF generated", type: "success" })
            }
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button
            className="btn-sm !h-11"
            onClick={() => addToast({ title: "Exporting CSV", type: "info" })}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-border border-t-blue rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <span className="slbl">
            Report preview — Full year {year} YTD
          </span>
          <div className="card overflow-hidden mb-4">
            <div className="bg-navy px-[18px] py-4">
              <div className="font-sora text-[15px] font-bold text-white mb-[3px]">
                Schedule C — Notary Income Summary
              </div>
              <div className="font-inter text-[11px] text-white/60">
                Tax Year {year}
              </div>
            </div>
            <div className="px-[18px] py-4">
              <div className="text-[10px] font-semibold text-slate-secondary uppercase tracking-[0.5px] mb-2">
                Income summary
              </div>
              {[
                ["Total gross income", formatCurrency(income.gross ?? 0), "text-navy"],
                [
                  `Total mileage expense (${Number(mileage.totalMiles ?? 0).toFixed(0)} mi at $${mileage.irsRate ?? 0.67})`,
                  `−${formatCurrency(mileage.totalDeduction ?? 0)}`,
                  "text-amber",
                ],
                [
                  "Total other expenses",
                  `−${formatCurrency(expenses.total ?? 0)}`,
                  "text-amber",
                ],
                [
                  "Net self employment income",
                  formatCurrency(income.net ?? 0),
                  "text-teal",
                ],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="flex justify-between py-[7px] border-b border-border last:border-b-0 gap-2"
                >
                  <span className="font-inter text-[11px] text-slate">
                    {label}
                  </span>
                  <span
                    className={cn("font-inter text-[12px] font-bold", color)}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-[18px] py-2.5 bg-background border-t border-border flex justify-between items-center gap-2 flex-wrap">
              <span className="font-inter text-[11px] text-slate-secondary">
                Generated by Notary Day
              </span>
              <button
                className="bg-navy text-white border-none rounded-[7px] px-3 py-1.5 font-inter text-[11px] font-semibold flex gap-1 items-center"
                onClick={() =>
                  addToast({ title: "Downloading PDF", type: "info" })
                }
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>

          <p className="font-inter text-[11px] text-muted text-center italic">
            For informational purposes only — not tax advice. Consult your
            accountant.
          </p>
        </>
      )}
    </>
  );
}
