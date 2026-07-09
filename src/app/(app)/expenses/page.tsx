"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/api/accounting.api";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Plus, Receipt, Trash2 } from "lucide-react";

const CATEGORIES = [
  "ALL",
  "MILEAGE",
  "SUPPLIES",
  "EDUCATION",
  "INSURANCE",
  "EQUIPMENT",
  "MARKETING",
  "SOFTWARE",
  "OTHER",
] as const;
const CAT_LABELS: Record<string, string> = {
  ALL: "All",
  MILEAGE: "Mileage",
  SUPPLIES: "Supplies",
  EDUCATION: "Education",
  INSURANCE: "Insurance",
  EQUIPMENT: "Equipment",
  MARKETING: "Marketing",
  SOFTWARE: "Software",
  OTHER: "Other",
};

export default function ExpensesPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [category, setCategory] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "SUPPLIES",
    expense_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", category],
    queryFn: async () => {
      const params = category !== "ALL" ? { category } : undefined;
      const res = await expensesApi.list(params);
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any[];
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["expenses-summary"],
    queryFn: async () => {
      const res = await expensesApi.summary();
      const p = (res as any).data ?? res;
      return (p.data ?? p) as {
        total: number;
        byCategory: Record<string, number>;
        count: number;
      };
    },
  });

  const createExpense = useMutation({
    mutationFn: () =>
      expensesApi.create({ ...form, amount: parseFloat(form.amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expenses-summary"] });
      setShowForm(false);
      setForm({
        description: "",
        amount: "",
        category: "SUPPLIES",
        expense_date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
      });
      addToast({ type: "success", title: "Expense added" });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expenses-summary"] });
    },
  });

  const totalThisMonth = expenses.reduce(
    (s: number, e: any) => s + Number(e.amount),
    0,
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-sora font-bold text-xl text-primary-navy">
            Expenses
          </h1>
          <p className="font-inter text-xs text-slate-secondary mt-0.5">
            {summary?.count ?? 0} entries ·{" "}
            {formatCurrency(summary?.total ?? 0)} YTD
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-11 px-5"
        >
          <Plus className="w-4 h-4" /> Add expense
        </button>
      </div>

      {/* Category filters */}
      <div className="px-4 lg:px-8 py-3 bg-white border-b border-border flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-inter text-xs font-medium border whitespace-nowrap flex-shrink-0",
              category === c
                ? "border-primary-navy bg-blue-bg text-primary-navy font-semibold"
                : "border-border text-slate-secondary",
            )}
          >
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {/* Add form */}
        {showForm && (
          <div className="bg-white border border-border rounded-12px p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                placeholder="Description *"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="h-10 border border-border rounded-8px px-3 font-inter text-sm col-span-2"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="h-10 border border-border rounded-8px px-3 font-inter text-sm"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 border border-border rounded-8px px-3 font-inter text-sm"
              >
                {CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                  <option key={c} value={c}>
                    {CAT_LABELS[c]}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={form.expense_date}
                onChange={(e) =>
                  setForm({ ...form, expense_date: e.target.value })
                }
                className="h-10 border border-border rounded-8px px-3 font-inter text-sm"
              />
              <input
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="h-10 border border-border rounded-8px px-3 font-inter text-sm"
              />
            </div>
            <button
              onClick={() => createExpense.mutate()}
              disabled={
                !form.description || !form.amount || createExpense.isPending
              }
              className="h-10 px-5 bg-primary-navy text-white rounded-8px font-inter text-sm font-semibold disabled:opacity-50"
            >
              {createExpense.isPending ? "Saving..." : "Save expense"}
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-border rounded-12px p-3 text-center">
            <div className="font-sora text-lg font-bold text-primary-navy">
              {formatCurrency(totalThisMonth)}
            </div>
            <div className="font-inter text-[10px] text-slate-secondary">
              Showing
            </div>
          </div>
          <div className="bg-white border border-border rounded-12px p-3 text-center">
            <div className="font-sora text-lg font-bold text-primary-navy">
              {formatCurrency(summary?.total ?? 0)}
            </div>
            <div className="font-inter text-[10px] text-slate-secondary">
              YTD
            </div>
          </div>
          <div className="bg-white border border-border rounded-12px p-3 text-center">
            <div className="font-sora text-lg font-bold text-primary-navy">
              {summary?.count ?? 0}
            </div>
            <div className="font-inter text-[10px] text-slate-secondary">
              Entries
            </div>
          </div>
        </div>

        {/* Expense list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white border border-border rounded-14px p-8 text-center">
            <Receipt className="w-10 h-10 text-slate-secondary mx-auto mb-3" />
            <p className="font-inter text-sm text-slate-secondary">
              No expenses recorded yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {expenses.map((e: any) => (
              <div
                key={e.id}
                className="bg-white border border-border rounded-10px px-4 py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-inter text-sm font-semibold text-primary-navy truncate">
                      {e.description}
                    </span>
                    {e.receipt_url && (
                      <span className="text-[9px] bg-teal-bg text-teal-success px-1.5 py-0.5 rounded font-semibold">
                        RECEIPT
                      </span>
                    )}
                  </div>
                  <div className="font-inter text-xs text-slate-secondary">
                    {format(parseISO(e.expense_date), "MMM d, yyyy")} ·{" "}
                    {CAT_LABELS[e.category] ?? e.category}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-sora font-bold text-primary-navy">
                    {formatCurrency(Number(e.amount))}
                  </span>
                  <button
                    onClick={() => deleteExpense.mutate(e.id)}
                    className="p-1 text-slate-secondary hover:text-red-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
