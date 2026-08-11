"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Info, X, Check } from "lucide-react";
import { expensesApi } from "@/api/accounting.api";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, cn, unwrap } from "@/lib/utils";

const CATEGORIES = [
  "Office supplies",
  "Software",
  "Vehicle",
  "Marketing",
  "Professional dev",
];
const FILTERS = ["All", ...CATEGORIES];

interface Expense {
  id: string;
  description?: string;
  desc?: string;
  category?: string;
  cat?: string;
  amount?: number;
  amt?: number;
  expense_date?: string;
  date?: string;
  receipt_url?: string | null;
  receipt?: boolean;
}

function normalize(e: Expense) {
  return {
    id: e.id,
    desc: e.description ?? e.desc ?? "",
    cat: e.category ?? e.cat ?? "Other",
    amt: Number(e.amount ?? e.amt ?? 0),
    date: e.expense_date ?? e.date ?? "",
    receipt: !!(e.receipt_url ?? e.receipt),
  };
}

function fmtDate(d: string) {
  if (!d) return "";
  const parsed = d.length > 10 ? parseISO(d) : new Date(d);
  if (Number.isNaN(parsed.getTime())) return d;
  return format(parsed, "MMM dd");
}

export default function ExpensesView() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<ReturnType<typeof normalize> | null>(
    null,
  );

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await expensesApi.list();
      return (unwrap<Expense[]>(res) ?? []) as Expense[];
    },
  });

  const expenses = useMemo(() => raw.map(normalize), [raw]);
  const filtered =
    filter === "All" ? expenses : expenses.filter((e) => e.cat === filter);

  const ytd = expenses.reduce((s, e) => s + e.amt, 0);

  const thisMonth = expenses
    .filter((e) => {
      const d = e.date ? new Date(e.date) : null;
      return (
        d &&
        d.getMonth() === new Date().getMonth() &&
        d.getFullYear() === new Date().getFullYear()
      );
    })
    .reduce((s, e) => s + e.amt, 0);

  const thisQuarter = expenses
    .filter((e) => {
      const d = e.date ? new Date(e.date) : null;
      if (!d) return false;
      const now = new Date();
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() >= qStart &&
        d.getMonth() <= qStart + 2
      );
    })
    .reduce((s, e) => s + e.amt, 0);

  const [form, setForm] = useState({
    desc: "",
    amt: "",
    cat: "Office supplies",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const createExpense = useMutation({
    mutationFn: () =>
      expensesApi.create({
        description: form.desc,
        amount: parseFloat(form.amt),
        category: form.cat,
        expense_date: form.date,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setForm({
        desc: "",
        amt: "",
        cat: "Office supplies",
        date: format(new Date(), "yyyy-MM-dd"),
      });
      addToast({ title: "Expense added", type: "success" });
    },
    onError: () => addToast({ title: "Failed to add expense", type: "error" }),
  });

  const updateExpense = useMutation({
    mutationFn: (payload: {
      id: string;
      desc: string;
      amt: number;
      cat: string;
    }) =>
      expensesApi.update(payload.id, {
        description: payload.desc,
        amount: payload.amt,
        category: payload.cat,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setEditing(null);
      addToast({ title: "Expense updated", type: "success" });
    },
    onError: () =>
      addToast({ title: "Failed to update expense", type: "error" }),
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      addToast({ title: "Expense deleted", type: "info" });
    },
    onError: () =>
      addToast({ title: "Failed to delete expense", type: "error" }),
  });

  const handleAdd = () => {
    if (!form.desc.trim() || !form.amt) {
      addToast({ title: "Enter description and amount", type: "error" });
      return;
    }
    createExpense.mutate();
  };

  return (
    <>
      {/* Summary metric cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 mb-3.5">
        <div className="mcard text-center">
          <div className="font-inter text-[10px] text-slate-secondary mb-[3px]">
            This month
          </div>
          <div className="font-sora text-[16px] font-bold text-navy">
            {formatCurrency(thisMonth)}
          </div>
        </div>
        <div className="mcard text-center">
          <div className="font-inter text-[10px] text-slate-secondary mb-[3px]">
            This quarter
          </div>
          <div className="font-sora text-[16px] font-bold text-navy">
            {formatCurrency(thisQuarter)}
          </div>
        </div>
        <div className="mcard text-center">
          <div className="font-inter text-[10px] text-slate-secondary mb-[3px]">
            YTD
          </div>
          <div className="font-sora text-[16px] font-bold text-navy">
            {formatCurrency(ytd)}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 mb-3 flex-wrap overflow-x-auto pb-0.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-2.5 py-[5px] rounded-[7px] font-inter text-[10px] whitespace-nowrap flex-shrink-0 border-[1.5px] transition-colors",
              filter === f
                ? "border-navy bg-blue-bg text-navy font-semibold"
                : "border-border bg-white text-slate-secondary font-medium",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <span className="slbl">{format(new Date(), "MMMM yyyy")}</span>

      {/* Expense list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-border border-t-blue rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-box mb-4">
          <p className="font-inter text-sm text-slate-secondary">
            No expenses recorded yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 mb-4">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="card p-2.5 flex justify-between gap-2 items-center"
            >
              <div className="flex-1 min-w-0">
                <div className="flex gap-1.5 mb-0.5 items-center flex-wrap">
                  <span className="font-inter text-[12px] font-semibold text-navy break-words">
                    {e.desc}
                  </span>
                  {e.receipt && (
                    <span className="text-[8px] bg-teal-bg text-teal px-1.5 py-px rounded-[3px] font-semibold">
                      RECEIPT
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 font-inter text-[10px] text-slate-secondary">
                  <span>{fmtDate(e.date)}</span>
                  <span>-</span>
                  <span>{e.cat}</span>
                </div>
              </div>
              <div className="flex gap-1.5 items-center flex-shrink-0">
                <div className="font-inter text-[13px] font-bold text-navy">
                  {formatCurrency(e.amt)}
                </div>
                <button
                  className="p-1 text-slate-secondary hover:text-navy"
                  onClick={() => setEditing(e)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1 text-red hover:opacity-70"
                  onClick={() => deleteExpense.mutate(e.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add expense form */}
      <div className="card p-3 mb-4">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="field">
            <label className="lbl">Description</label>
            <input
              className="inp"
              placeholder="What did you buy?"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="lbl">Amount</label>
            <input
              className="inp"
              placeholder="$0.00"
              type="number"
              step="0.01"
              value={form.amt}
              onChange={(e) => setForm({ ...form, amt: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="field">
            <label className="lbl">Category</label>
            <select
              className="sel"
              value={form.cat}
              onChange={(e) => setForm({ ...form, cat: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="lbl">Date</label>
            <input
              className="inp"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-background border-[1.5px] border-dashed border-border rounded-[8px] px-3 py-2 font-inter text-[11px] text-slate-secondary flex gap-1 items-center flex-1"
            onClick={() =>
              addToast({ title: "Receipt upload coming soon", type: "info" })
            }
          >
            <Info className="w-3.5 h-3.5" /> Upload receipt (photo or PDF)
          </button>
          <button
            className="btn-p !w-auto px-4 !h-[38px]"
            disabled={createExpense.isPending}
            onClick={handleAdd}
          >
            {createExpense.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div
            className="modal"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-hdr">
              <div className="modal-title">Edit expense</div>
              <button
                className="modal-close"
                onClick={() => setEditing(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-3">
                <div className="field">
                  <label className="lbl">Description</label>
                  <input
                    className="inp"
                    value={editing.desc}
                    onChange={(e) =>
                      setEditing({ ...editing, desc: e.target.value })
                    }
                  />
                </div>
                <div className="g2">
                  <div className="field">
                    <label className="lbl">Amount</label>
                    <input
                      className="inp"
                      type="number"
                      step="0.01"
                      value={editing.amt}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          amt: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label className="lbl">Category</label>
                    <select
                      className="sel"
                      value={editing.cat}
                      onChange={(e) =>
                        setEditing({ ...editing, cat: e.target.value })
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button
                className="btn-p"
                disabled={updateExpense.isPending}
                onClick={() =>
                  updateExpense.mutate({
                    id: editing.id,
                    desc: editing.desc,
                    amt: editing.amt,
                    cat: editing.cat,
                  })
                }
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
