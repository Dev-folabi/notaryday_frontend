"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Car, Check, Pencil, Trash2, X } from "lucide-react";
import { reportsApi } from "@/api/accounting.api";
import { useUIStore } from "@/store/uiStore";
import { cn, formatCurrency, unwrap } from "@/lib/utils";
import type { MileageEntry, MileageReport } from "@/types/reports";

const PAGE_SIZE = 50;

export default function MileageLog() {
  const year = new Date().getFullYear();
  const queryClient = useQueryClient();
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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data, isLoading } = useQuery({
    queryKey: ["reports-mileage", year],
    queryFn: async () => {
      const response = await reportsApi.mileage(year);
      return unwrap<MileageReport>(response);
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["reports-mileage", year] });

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
    onError: () => addToast({ title: "Failed to add mileage entry", type: "error" }),
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
    onError: () => addToast({ title: "Failed to update mileage entry", type: "error" }),
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => reportsApi.deleteMileageEntry(id),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      addToast({ title: "Mileage entry deleted", type: "info" });
    },
    onError: () => addToast({ title: "Failed to delete mileage entry", type: "error" }),
  });

  const entries: MileageEntry[] = data?.entries ?? [];
  const totalMiles = data?.totalMiles ?? 0;
  const totalDeduction = data?.totalDeduction ?? 0;
  const irsRate = data?.irsRate ?? 0.72;
  const visibleEntries = entries.slice(0, visibleCount);

  const openEdit = (entry: MileageEntry) => {
    setEditing(entry);
    setEditForm({
      miles_date: entry.date ? entry.date.slice(0, 10) : format(new Date(), "yyyy-MM-dd"),
      miles: String(entry.miles ?? 0),
      description: entry.job ?? "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 mb-3.5">
        <div className="mcard">
          <span className="mc-v text-navy !text-[18px]">{Number(totalMiles).toFixed(0)} mi</span>
          <span className="mc-l">Total miles, YTD</span>
        </div>
        <div className="mcard">
          <span className="mc-v text-amber !text-[18px]">{formatCurrency(totalDeduction)}</span>
          <span className="mc-l">Deduction value</span>
        </div>
        <div className="mcard">
          <span className="mc-v !text-[18px]">${irsRate}/mi</span>
          <span className="mc-l">IRS rate, {year}</span>
        </div>
      </div>

      <div className="alert al-teal mb-3.5">
        <span><Car className="w-4 h-4" /></span>
        <div>
          <div className="font-inter text-[12px] font-semibold mb-0.5">Auto tracking is on</div>
          <div className="font-inter text-[11px] text-slate-secondary leading-relaxed">
            Mileage is recorded automatically when you tap Navigate. You can edit any manual entry here.
          </div>
        </div>
      </div>

      <span className="slbl">{format(new Date(), "MMMM yyyy")}</span>
      {entries.length === 0 ? (
        <div className="empty-box mb-4">
          <p className="font-inter text-sm text-slate-secondary">No mileage entries for this year.</p>
        </div>
      ) : (
        <div className="card px-3 py-0 mb-4">
          {visibleEntries.map((entry, index) => (
            <div key={entry.id ?? index} className="flex items-center py-2.5 border-b border-border last:border-b-0 gap-2">
              <div className="w-[52px] flex-shrink-0">
                <div className="font-inter text-[11px] font-semibold text-navy">
                  {entry.date ? format(new Date(entry.date), "MMM dd") : ""}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-inter text-[11px] font-medium text-slate truncate">
                  {entry.job ?? entry.address ?? "Signing"}
                </div>
                <div className="font-inter text-[10px] text-muted mt-px">
                  <span className={cn(
                    "text-[8px] font-semibold px-1 py-px rounded-[3px]",
                    (entry.method ?? "auto") === "auto"
                      ? "bg-teal-bg text-teal"
                      : "bg-background text-slate-secondary",
                  )}>
                    {(entry.method ?? "AUTO").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-inter text-[11px] font-bold text-navy">{Number(entry.miles ?? 0).toFixed(1)} mi</div>
                <div className="font-inter text-[10px] text-amber font-medium">{formatCurrency(entry.deduction ?? entry.cost ?? 0)}</div>
              </div>
              <button className="p-1 text-slate-secondary flex-shrink-0 hover:text-navy" onClick={() => openEdit(entry)}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {entries.length > visibleEntries.length && (
        <div className="flex justify-center mb-4">
          <button className="btn-gh !w-auto px-4" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Show more ({entries.length - visibleEntries.length} remaining)
          </button>
        </div>
      )}

      <span className="slbl">Add manual entry</span>
      <div className="card p-3 mb-4">
        <div className="g2 gap-2">
          <div className="field">
            <label className="lbl">Date</label>
            <input className="inp" type="date" value={form.miles_date} onChange={(event) => setForm({ ...form, miles_date: event.target.value })} />
          </div>
          <div className="field">
            <label className="lbl">Miles driven</label>
            <input className="inp" placeholder="0.0" type="number" step="0.1" value={form.miles} onChange={(event) => setForm({ ...form, miles: event.target.value })} />
          </div>
        </div>
        <div className="field">
          <label className="lbl">Description</label>
          <input className="inp" placeholder="Job description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
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
          <div className="modal" style={{ maxWidth: 440 }} onClick={(event) => event.stopPropagation()}>
            <div className="modal-hdr">
              <div className="modal-title">Edit mileage entry</div>
              <button className="modal-close" onClick={() => setEditing(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-3">
                <div className="field">
                  <label className="lbl">Date</label>
                  <input className="inp" type="date" value={editForm.miles_date} onChange={(event) => setEditForm({ ...editForm, miles_date: event.target.value })} />
                </div>
                <div className="field">
                  <label className="lbl">Job description</label>
                  <input className="inp" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} />
                </div>
                <div className="g2">
                  <div className="field">
                    <label className="lbl">Miles</label>
                    <input className="inp" type="number" step="0.1" value={editForm.miles} onChange={(event) => setEditForm({ ...editForm, miles: event.target.value })} />
                  </div>
                  <div className="field">
                    <label className="lbl">Cost</label>
                    <input className="inp" readOnly value={formatCurrency((parseFloat(editForm.miles) || 0) * irsRate)} />
                  </div>
                </div>
                <div className="field">
                  <label className="lbl">Method</label>
                  <select className="sel" disabled value={(editing.method ?? "auto") === "auto" ? "auto" : "manual"}>
                    <option value="auto">auto</option>
                    <option value="manual">manual</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              {!editing.jobId && (
                <button className="btn-danger-gh" onClick={() => editing.id && deleteEntry.mutate(editing.id)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button className="btn-p" disabled={updateEntry.isPending} onClick={() => updateEntry.mutate()}>
                <Check className="w-4 h-4" /> Save changes
              </button>
              <button className="btn-gh" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
