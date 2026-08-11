"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
} from "date-fns";
import {
  Download,
  BarChart2,
  Car,
  Info,
  FileText,
  Pencil,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { reportsApi, expensesApi } from "@/api/accounting.api";
import { invoicesApi } from "@/api/invoices.api";
import ProGate from "@/components/ui/ProGate";
import ExpensesView from "@/components/reports/ExpensesView";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
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

const escapeCsv = (v: string | number | null | undefined) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadCsv = (rows: (string | number)[][], filename: string) => {
  const csv = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

interface RecentInvoice {
  id: string;
  invoice_number?: string;
  is_paid: boolean;
  sent_at?: string | null;
  created_at?: string;
  total: number;
  job?: {
    client_name?: string | null;
    appointment_time?: string;
  };
}

function invoiceStatus(inv: RecentInvoice): "paid" | "sent" | "overdue" | "draft" {
  if (inv.is_paid) return "paid";
  if (inv.sent_at) {
    const days = (Date.now() - new Date(inv.sent_at).getTime()) / 86_400_000;
    if (days > 30) return "overdue";
    return "sent";
  }
  return "draft";
}

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("income");
  const { addToast } = useUIStore();
  const { user } = useAuth();
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  const handleExport = async () => {
    if (!isPro) {
      addToast({ title: "Exporting reports is a Pro feature", type: "warning" });
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (tab === "income") {
        const res = await reportsApi.earnings(
          format(startOfYear(new Date()), "yyyy-MM-dd"),
          format(endOfMonth(new Date()), "yyyy-MM-dd"),
          "month",
        );
        const data = unwrap<EarningsReport>(res);
        const s = data.summary ?? {};
        downloadCsv(
          [
            ["Metric", "Value"],
            ["Gross income", formatCurrency(s.gross ?? 0)],
            ["Mileage deductions", formatCurrency(s.mileageCost ?? 0)],
            ["Net income", formatCurrency(s.net ?? 0)],
            ["Signings", s.signings ?? 0],
            ["Period", `YTD ${new Date().getFullYear()}`],
          ],
          `notaryday-income-${today}.csv`,
        );
      } else if (tab === "mileage") {
        const res = await reportsApi.mileage(new Date().getFullYear());
        const data = unwrap<MileageReport>(res);
        const rows: string[][] = [
          ["Date", "Description", "Miles", "Deduction", "Method"],
          ...(data.entries ?? []).map((e) => [
            e.date ? format(new Date(e.date), "yyyy-MM-dd") : "",
            e.job ?? "",
            String(Number(e.miles ?? 0).toFixed(1)),
            formatCurrency(Number(e.deduction ?? 0)),
            (e.method ?? "auto").toUpperCase(),
          ]),
        ];
        downloadCsv(rows, `notaryday-mileage-${today}.csv`);
      } else if (tab === "tax") {
        const res = await reportsApi.tax(
          `${new Date().getFullYear()}-01-01`,
          `${new Date().getFullYear()}-12-31`,
        );
        const data = unwrap<TaxReport>(res);
        const income = data.income ?? {};
        const m = data.mileage ?? {};
        downloadCsv(
          [
            ["Schedule C", ""],
            ["Total gross income", formatCurrency(income.gross ?? 0)],
            ["Total mileage expense", formatCurrency(m.totalDeduction ?? 0)],
            [
              "Total other expenses",
              formatCurrency(data.expenses?.total ?? 0),
            ],
            ["Net self employment income", formatCurrency(income.net ?? 0)],
          ],
          `notaryday-tax-${today}.csv`,
        );
      } else {
        const res = await expensesApi.list();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list = unwrap<any[]>(res) ?? [];
        const rows: string[][] = [
          ["Date", "Description", "Category", "Amount"],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...list.map((e: any) => [
            e.expense_date ?? e.date ?? "",
            e.description ?? e.desc ?? "",
            e.category ?? e.cat ?? "",
            String(e.amount ?? e.amt ?? 0),
          ]),
        ];
        downloadCsv(rows, `notaryday-expenses-${today}.csv`);
      }
    } catch {
      addToast({ title: "Failed to export CSV", type: "error" });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Reports</div>
        <button className="btn-sm" onClick={handleExport}>
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
        {tab === "income" && (
          <ProGate feature="Income reports are a Pro feature">
            <IncomeTab />
          </ProGate>
        )}
        {tab === "mileage" && (
          <ProGate feature="Mileage reports are a Pro feature">
            <MileageTab />
          </ProGate>
        )}
        {tab === "tax" && (
          <ProGate feature="Tax reports are a Pro feature">
            <TaxTab />
          </ProGate>
        )}
        {tab === "expenses" && <ExpensesView />}
      </div>
    </div>
  );
}

/* ---------------- INCOME ---------------- */
function IncomeTab() {
  const now = new Date();
  const [period, setPeriod] = useState<"month" | "ytd">("ytd");

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
    queryKey: ["reports-income", period],
    queryFn: async () => {
      const res = await reportsApi.earnings(
        range.from,
        range.to,
        period === "ytd" ? "month" : "week",
        true,
      );
      return unwrap<EarningsReport>(res);
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["reports-recent-invoices"],
    queryFn: async () => {
      const res = await invoicesApi.list();
      return (unwrap<RecentInvoice[]>(res) ?? []) as RecentInvoice[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const summary = data?.summary ?? {};
  const periods: PeriodBar[] = useMemo(() => data?.periods ?? [], [data]);
  const byType: TypeBreakdown[] = data?.byType ?? data?.bySigningType ?? [];
  const maxBar = useMemo(
    () => Math.max(...periods.map((p) => Number(p.net ?? p.gross ?? 0)), 1),
    [periods],
  );

  const yoyPct = data?.yoy?.netPct;
  const avgNetPerSigning =
    (summary.signings ?? 0) > 0
      ? Number(summary.net ?? 0) / (summary.signings ?? 1)
      : 0;
  const daysInRange =
    (new Date(range.to).getTime() - new Date(range.from).getTime()) /
    86_400_000;
  const weeksInRange = Math.max(daysInRange / 7, 1);
  const avgSigningsPerWeek =
    (summary.signings ?? 0) / weeksInRange;
  const bestMonth = useMemo(() => {
    if (periods.length === 0) return null;
    return periods.reduce((best, p) =>
      Number(p.net ?? 0) > Number(best.net ?? 0) ? p : best,
    );
  }, [periods]);

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
          {(["month", "ytd"] as const).map((p) => (
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
              {p === "month" ? "This month" : `YTD ${now.getFullYear()}`}
            </button>
          ))}
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
            {period === "month" ? "This month" : "YTD"}
          </div>
        </div>
        <div className="mcard">
          <span className="mc-v text-amber">
            {formatCurrency(summary.mileageCost ?? summary.mileage ?? 0)}
          </span>
          <span className="mc-l">Mileage deductions</span>
          <div className="mt-1 font-inter text-[10px] text-slate-secondary">
            {period === "month" ? "This month" : "YTD"}
          </div>
        </div>
        <div className="mcard">
          <span className="mc-v text-teal">
            {formatCurrency(summary.net ?? 0)}
          </span>
          <span className="mc-l">Net income</span>
          <div className="mt-1 font-inter text-[10px] text-slate-secondary">
            {period === "month" ? "This month" : "YTD"}
          </div>
        </div>
        <div className="mcard">
          <span className="mc-v text-navy">{summary.signings ?? 0}</span>
          <span className="mc-l">Signings</span>
          <div className="mt-1 font-inter text-[10px] text-slate-secondary">
            {period === "month" ? "This month" : "YTD"}
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex justify-between mb-2.5 flex-wrap gap-1.5">
          <div className="font-inter text-[12px] font-semibold text-navy">
            Monthly net income
          </div>
          <div className="font-inter text-[11px] text-teal font-medium flex gap-1 items-center">
            <BarChart2 className="w-3.5 h-3.5" />
            {yoyPct != null ? (
              <span>
                {yoyPct >= 0 ? "+" : ""}
                {yoyPct}% vs last year
              </span>
            ) : (
              "Net over time"
            )}
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

      <div className="g2 mb-4">
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

        <div className="card p-3">
          <div className="font-inter text-[11px] font-semibold text-navy mb-2">
            Key metrics
          </div>
          {[
            ["Avg net per signing", formatCurrency(avgNetPerSigning), "text-navy"],
            [
              "Avg signings per week",
              avgSigningsPerWeek.toFixed(1),
              "text-navy",
            ],
            [
              "Best month",
              bestMonth
                ? `${bestMonth.period ?? ""} - ${formatCurrency(Number(bestMonth.net ?? 0))}`
                : "—",
              "text-teal",
            ],
            [
              "Mileage deducted",
              `${Number(summary.totalMiles ?? 0).toFixed(0)} mi`,
              "text-amber",
            ],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="flex justify-between py-1.5 border-b border-border last:border-b-0 gap-2"
            >
              <span className="font-inter text-[11px] text-slate-secondary">
                {label}
              </span>
              <span className={cn("font-inter text-[11px] font-semibold", color)}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <span className="slbl">Recent invoices</span>
      <div className="table-wrap mb-4">
        <table className="tbl">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).slice(0, 5).map((inv) => {
              const s = invoiceStatus(inv);
              return (
                <tr key={inv.id}>
                  <td className="font-semibold text-navy whitespace-nowrap">
                    {inv.invoice_number ?? inv.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>{inv.job?.client_name ?? "—"}</td>
                  <td className="text-slate-secondary">
                    {format(
                      new Date(inv.created_at ?? inv.job?.appointment_time ?? new Date()),
                      "MMM d",
                    )}
                  </td>
                  <td className="font-semibold">
                    {formatCurrency(inv.total)}
                  </td>
                  <td>
                    <span className={cn("chip", `c-${s}`)}>
                      {s.toUpperCase()}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(invoices ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center font-inter text-[11px] text-slate-secondary py-3"
                >
                  No invoices yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------- MILEAGE ---------------- */
function MileageTab() {
  const year = new Date().getFullYear();
  const qc = useQueryClient();
  const { addToast } = useUIStore();
  const [form, setForm] = useState({
    miles_date: format(new Date(), "yyyy-MM-dd"),
    miles: "",
    description: "",
  });
  const [editing, setEditing] = useState<MileageEntry | null>(null);
  const [editForm, setEditForm] = useState({
    miles_date: "",
    miles: "",
    description: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reports-mileage", year],
    queryFn: async () => {
      const res = await reportsApi.mileage(year);
      return unwrap<MileageReport>(res);
    },
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["reports-mileage", year] });

  const createEntry = useMutation({
    mutationFn: () =>
      reportsApi.createMileageEntry({
        miles_date: form.miles_date,
        miles: parseFloat(form.miles),
        description: form.description || "Manual entry",
      }),
    onSuccess: () => {
      invalidate();
      setForm({
        miles_date: format(new Date(), "yyyy-MM-dd"),
        miles: "",
        description: "",
      });
      addToast({ title: "Mileage entry added", type: "success" });
    },
    onError: () =>
      addToast({ title: "Failed to add mileage entry", type: "error" }),
  });

  const updateEntry = useMutation({
    mutationFn: () => {
      const payload = {
        miles_date: editForm.miles_date,
        miles: parseFloat(editForm.miles),
        description: editForm.description,
      };
      return editing?.jobId
        ? reportsApi.updateJobMileage(editing.jobId, payload)
        : reportsApi.updateMileageEntry(editing?.id ?? "", payload);
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      addToast({ title: "Mileage entry updated", type: "success" });
    },
    onError: () =>
      addToast({ title: "Failed to update mileage entry", type: "error" }),
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => reportsApi.deleteMileageEntry(id),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      addToast({ title: "Mileage entry deleted", type: "info" });
    },
    onError: () =>
      addToast({ title: "Failed to delete mileage entry", type: "error" }),
  });

  const entries: MileageEntry[] = data?.entries ?? [];
  const totalMiles = data?.totalMiles ?? 0;
  const totalDeduction = data?.totalDeduction ?? 0;
  const irsRate = data?.irsRate ?? 0.72;

  const openEdit = (e: MileageEntry) => {
    setEditing(e);
    setEditForm({
      miles_date: e.date ? e.date.slice(0, 10) : format(new Date(), "yyyy-MM-dd"),
      miles: String(e.miles ?? 0),
      description: e.job ?? "",
    });
  };

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
            any manual entry here.
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
                  {r.date ? format(new Date(r.date), "MMM dd") : ""}
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
              <button
                className="p-1 text-slate-secondary flex-shrink-0 hover:text-navy"
                onClick={() => openEdit(r)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <span className="slbl">Add manual entry</span>
      <div className="card p-3 mb-4">
        <div className="g2 gap-2">
          <div className="field">
            <label className="lbl">Date</label>
            <input
              className="inp"
              type="date"
              value={form.miles_date}
              onChange={(e) => setForm({ ...form, miles_date: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="lbl">Miles driven</label>
            <input
              className="inp"
              placeholder="0.0"
              type="number"
              step="0.1"
              value={form.miles}
              onChange={(e) => setForm({ ...form, miles: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label className="lbl">Description</label>
          <input
            className="inp"
            placeholder="Job description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>
        <button
          className="btn-p mt-2.5 !h-[38px] !text-[12px]"
          disabled={createEntry.isPending}
          onClick={() => {
            if (!form.miles || parseFloat(form.miles) <= 0) {
              addToast({ title: "Enter miles", type: "error" });
              return;
            }
            createEntry.mutate();
          }}
        >
          <Check className="w-4 h-4" /> Add entry
        </button>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div
            className="modal"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-hdr">
              <div className="modal-title">Edit mileage entry</div>
              <button className="modal-close" onClick={() => setEditing(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-3">
                <div className="field">
                  <label className="lbl">Date</label>
                  <input
                    className="inp"
                    type="date"
                    value={editForm.miles_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, miles_date: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label className="lbl">Job description</label>
                  <input
                    className="inp"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="g2">
                  <div className="field">
                    <label className="lbl">Miles</label>
                    <input
                      className="inp"
                      type="number"
                      step="0.1"
                      value={editForm.miles}
                      onChange={(e) =>
                        setEditForm({ ...editForm, miles: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label className="lbl">Cost</label>
                    <input
                      className="inp"
                      readOnly
                      value={formatCurrency(
                        (parseFloat(editForm.miles) || 0) * irsRate,
                      )}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="lbl">Method</label>
                  <select
                    className="sel"
                    disabled
                    value={(editing?.method ?? "auto") === "auto" ? "auto" : "manual"}
                  >
                    <option value="auto">auto</option>
                    <option value="manual">manual</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              {!editing?.jobId && (
                <button
                  className="btn-danger-gh"
                  onClick={() => editing.id && deleteEntry.mutate(editing.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                className="btn-p"
                disabled={updateEntry.isPending}
                onClick={() => updateEntry.mutate()}
              >
                <Check className="w-4 h-4" /> Save changes
              </button>
              <button className="btn-gh" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- TAX ---------------- */
function TaxTab() {
  const year = new Date().getFullYear();
  const { addToast } = useUIStore();
  const { user } = useAuth();
  const [range, setRange] = useState({ from: `${year}-01-01`, to: `${year}-12-31` });
  const [generated, setGenerated] = useState<TaxReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const presets = [
    { label: `Q1 ${year}`, from: `${year}-01-01`, to: `${year}-03-31` },
    { label: `Q2 ${year}`, from: `${year}-04-01`, to: `${year}-06-30` },
    { label: `Full year ${year}`, from: `${year}-01-01`, to: `${year}-12-31` },
    { label: `Full year ${year - 1}`, from: `${year - 1}-01-01`, to: `${year - 1}-12-31` },
  ];

  const generate = async () => {
    if (!range.from || !range.to) {
      addToast({ title: "Select a date range", type: "error" });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await reportsApi.tax(range.from, range.to);
      setGenerated(unwrap<TaxReport>(res));
    } catch {
      addToast({ title: "Failed to generate report", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const res = await reportsApi.taxPdf(range.from, range.to);
      const blob = (res as unknown as { data: Blob }).data ?? (res as unknown as Blob);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedule-c-tax-report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      addToast({ title: "Failed to generate PDF", type: "error" });
    }
  };

  const income = generated?.income ?? {};
  const mileage = generated?.mileage ?? {};
  const expenses = generated?.expenses ?? {};
  const byType: TypeBreakdown[] =
    generated?.byType ?? generated?.bySigningType ?? [];

  const credLine = [
    ...(user?.credentials ?? []),
    ...(user?.nna_certified ? ["NNA Certified"] : []),
  ];
  const headerSubtitle = [
    user?.full_name ?? "Notary",
    ...credLine,
    `Tax Year ${generated?.year ?? year}`,
    "Detailed",
  ].join(", ");

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
            <input
              className="inp"
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="lbl">To</label>
            <input
              className="inp"
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap mb-2.5">
          {presets.map((p) => (
            <button
              key={p.label}
              className={cn(
                "px-2.5 py-[5px] rounded-[6px] font-inter text-[11px] font-medium border-[1.5px] whitespace-nowrap",
                range.from === p.from && range.to === p.to
                  ? "border-navy bg-blue-bg text-navy"
                  : "border-border bg-background text-slate-secondary",
              )}
              onClick={() =>
                setRange({ from: p.from, to: p.to })
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          className="btn-p !w-auto px-4 !h-10"
          disabled={isGenerating}
          onClick={generate}
        >
          <FileText className="w-4 h-4" />{" "}
          {isGenerating ? "Generating..." : "Generate tax report PDF"}
        </button>
      </div>

      {generated ? (
        <>
          <span className="slbl">
            Report preview —{" "}
            {generated.from?.slice(0, 4) === String(year)
              ? `Full year ${year} YTD`
              : `${generated.from ?? ""} to ${generated.to ?? ""}`}
          </span>
          <div className="card overflow-hidden mb-4">
            <div className="bg-navy px-[18px] py-4">
              <div className="font-sora text-[15px] font-bold text-white mb-[3px]">
                Schedule C — Notary Income Summary
              </div>
              <div className="font-inter text-[11px] text-white/60">
                {headerSubtitle}
              </div>
            </div>
            <div className="px-[18px] py-4">
              <div className="text-[10px] font-semibold text-slate-secondary uppercase tracking-[0.5px] mb-2">
                Income summary
              </div>
              {[
                [
                  `Total gross income (${income.signings ?? 0} signings)`,
                  formatCurrency(income.gross ?? 0),
                  "text-navy",
                ],
                [
                  `Total mileage expense (${Number(mileage.totalMiles ?? 0).toFixed(0)} mi at $${mileage.irsRate ?? 0.72})`,
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
                  <span className={cn("font-inter text-[12px] font-bold", color)}>
                    {value}
                  </span>
                </div>
              ))}

              <div className="text-[10px] font-semibold text-slate-secondary uppercase tracking-[0.5px] mb-2 mt-5">
                By signing type, detailed
              </div>
              <div className="table-wrap">
                <table className="tbl !min-w-[480px]">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Count</th>
                      <th>Gross</th>
                      <th>Avg per signing</th>
                      <th>Mileage</th>
                      <th>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byType.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center font-inter text-[11px] text-slate-secondary py-3"
                        >
                          No signings in this period
                        </td>
                      </tr>
                    ) : (
                      byType.map((t, i) => (
                        <tr key={i}>
                          <td className="font-medium">
                            {TYPE_LABEL[(t.signing_type ?? t.type ?? "").toLowerCase()] ??
                              t.type ??
                              "Other"}
                          </td>
                          <td>{t.count ?? 0}</td>
                          <td className="font-semibold">
                            {formatCurrency(t.gross ?? 0)}
                          </td>
                          <td className="text-slate-secondary">
                            {formatCurrency(t.avg ?? 0)}
                          </td>
                          <td className="text-amber">
                            {Number(t.miles ?? 0).toFixed(0)} mi
                          </td>
                          <td className="font-semibold text-teal">
                            {formatCurrency(t.net ?? 0)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] font-semibold text-slate-secondary uppercase tracking-[0.5px] mb-2 mt-5">
                Mileage deduction detail
              </div>
              {[
                ["Total business miles driven", `${Number(mileage.totalMiles ?? 0).toFixed(0)} mi`],
                [
                  `IRS standard mileage rate ${generated?.year ?? year}`,
                  `$${mileage.irsRate ?? 0.72}/mile`,
                ],
                [
                  "Total deductible mileage expense",
                  formatCurrency(mileage.totalDeduction ?? 0),
                ],
                [
                  "Auto tracked miles",
                  `${Number(mileage.autoMiles ?? 0).toFixed(0)} mi (${mileage.autoPct ?? 0}%)`,
                ],
                [
                  "Manually entered miles",
                  `${Number(mileage.manualMiles ?? 0).toFixed(0)} mi (${mileage.manualPct ?? 0}%)`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between py-1.5 border-b border-border last:border-b-0 gap-2"
                >
                  <span className="font-inter text-[11px] text-slate">
                    {label}
                  </span>
                  <span className="font-inter text-[11px] font-semibold text-navy">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-[18px] py-2.5 bg-background border-t border-border flex justify-between items-center gap-2 flex-wrap">
              <span className="font-inter text-[11px] text-slate-secondary">
                Generated by Notary Day,{" "}
                {format(new Date(), "MMMM d, yyyy")}
              </span>
              <button
                className="bg-navy text-white border-none rounded-[7px] px-3 py-1.5 font-inter text-[11px] font-semibold flex gap-1 items-center"
                onClick={downloadPdf}
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
      ) : (
        <div className="card p-6 mb-4 text-center">
          <FileText className="w-8 h-8 text-slate-secondary mx-auto mb-2" />
          <p className="font-inter text-sm font-semibold text-navy mb-1">
            No report generated yet
          </p>
          <p className="font-inter text-xs text-slate-secondary">
            Pick a date range and tap “Generate tax report PDF” to build your
            Schedule C preview.
          </p>
        </div>
      )}
    </>
  );
}
