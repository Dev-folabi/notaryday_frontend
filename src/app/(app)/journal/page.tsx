"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useUIStore } from "@/store/uiStore";

const TYPES = ["All", "Loan Refi", "General", "Hybrid", "Purchase Closing", "Field Inspection", "Apostille"];
const ID_TYPES = ["CA Driver License", "US Passport", "State ID"];
const ACTS = ["Acknowledgement", "Jurat", "Oath", "Certified Copy"];
const TYPE_CHIP: Record<string, string> = {
  "Loan Refi": "c-loan",
  "Purchase Closing": "c-loan",
  Hybrid: "c-hyb",
  General: "c-gen",
  "Field Inspection": "c-gen",
  Apostille: "c-gen",
};

interface Entry {
  id: string;
  date: string;
  time: string;
  type: string;
  act: string;
  signer: string;
  idType: string;
  idNo: string;
  doc: string;
  addr: string;
  fee: string;
}

export default function JournalPage() {
  const { addToast } = useUIStore();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [form, setForm] = useState({
    date: "2026-03-18",
    time: "14:00",
    act: "Acknowledgement",
    type: "General",
    signer: "",
    idType: ID_TYPES[0],
    idNo: "",
    doc: "",
    addr: "",
    fee: "",
  });

  const filtered = entries.filter((e) => {
    if (filter !== "All" && e.type !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!e.signer.toLowerCase().includes(s) && !e.addr.toLowerCase().includes(s) && !e.doc.toLowerCase().includes(s))
        return false;
    }
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      date: "2026-03-18",
      time: "14:00",
      act: "Acknowledgement",
      type: "General",
      signer: "",
      idType: ID_TYPES[0],
      idNo: "",
      doc: "",
      addr: "",
      fee: "",
    });
    setModalOpen(true);
  };

  const openEdit = (e: Entry) => {
    setEditing(e);
    setForm({
      date: e.date,
      time: e.time,
      act: e.act,
      type: e.type,
      signer: e.signer,
      idType: e.idType,
      idNo: e.idNo,
      doc: e.doc,
      addr: e.addr,
      fee: e.fee,
    });
    setModalOpen(true);
  };

  const save = () => {
    const next: Entry = {
      id: editing?.id ?? `#JN-${(entries.length + 129).toString()}`,
      date: form.date,
      time: form.time,
      act: form.act,
      type: form.type,
      signer: form.signer || "New Signer",
      idType: form.idType,
      idNo: form.idNo || "X0000000",
      doc: form.doc || "General Document",
      addr: form.addr || "Los Angeles, CA",
      fee: form.fee || "$0",
    };
    if (editing) {
      setEntries((prev) => prev.map((e) => (e.id === editing.id ? next : e)));
      addToast({ type: "success", title: "Journal entry updated" });
    } else {
      setEntries((prev) => [next, ...prev]);
      addToast({ type: "success", title: "Journal entry added" });
    }
    setModalOpen(false);
  };

  const remove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    addToast({ type: "info", title: "Journal entry deleted" });
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Notarial Journal</div>
        <button onClick={openNew} className="btn-p" style={{ width: "auto", height: 34, padding: "0 12px", fontSize: 11 }}>
          <Plus className="w-3.5 h-3.5" /> New entry
        </button>
      </div>

      <div className="bg-white border-b border-border px-3.5 py-2.5 flex gap-2 flex-shrink-0 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, address, or document"
            className="w-full h-9 bg-background border border-border rounded-[8px] pl-8 pr-3 font-inter text-[12px] text-navy outline-none focus:border-blue"
          />
        </div>
        <div className="flex gap-1 bg-border p-0.5 rounded-[8px] overflow-x-auto flex-shrink-0">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-2.5 py-1 rounded-[5px] font-inter text-[11px] font-medium whitespace-nowrap"
              style={{
                color: filter === t ? "var(--navy)" : "var(--slate2)",
                background: filter === t ? "#fff" : "transparent",
                boxShadow: filter === t ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-b border-border px-3.5 py-2 flex gap-5 flex-shrink-0 flex-wrap">
        <div>
          <span className="font-sora text-[16px] font-bold text-navy">{entries.length}</span>
          <span className="font-inter text-[10px] text-muted ml-1">Total acts, 2026</span>
        </div>
        <div>
          <span className="font-sora text-[16px] font-bold text-navy">0</span>
          <span className="font-inter text-[10px] text-muted ml-1">This month</span>
        </div>
        <div className="ml-auto font-inter text-[11px] text-slate-secondary">
          Showing {filtered.length} entries
        </div>
      </div>

      <div className="con">
        <div className="alert al-blue mb-4">
          <span className="text-blue flex-shrink-0 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg></span>
          <div className="font-inter text-[11px] leading-[1.4]">
            Journal entries are auto created when you mark a job complete. You can
            edit any entry manually. All entries meet California, Texas, Florida,
            and New York requirements.
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-box">
            <p className="font-inter text-sm text-slate-secondary">No entries found</p>
          </div>
        ) : (
          filtered.map((e) => (
            <div key={e.id} className="card p-3 mb-2">
              <div className="flex justify-between gap-2 mb-1.5 flex-wrap">
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="font-sora text-[12px] font-bold text-navy">{e.id}</span>
                  <span className={`chip ${TYPE_CHIP[e.type] ?? "c-gen"}`} style={{ fontSize: 8 }}>{e.type}</span>
                  <span className="bg-background border border-border rounded-[4px] font-inter text-[9px] font-medium text-slate-secondary px-1.5 py-0.5">{e.act}</span>
                </div>
                <span className="font-inter text-[10px] text-muted">{e.date} · {e.time}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-2">
                {[
                  ["Signer", e.signer],
                  ["ID", `${e.idType} — ${e.idNo}`],
                  ["Document", e.doc],
                  ["Location", e.addr],
                  ["Fee", e.fee],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="font-inter text-[9px] font-semibold text-muted uppercase tracking-[0.3px] mb-0.5">{l}</div>
                    <div className="font-inter text-[11px] text-navy font-medium break-words">{v}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => openEdit(e)} className="font-inter text-[11px] font-medium text-blue bg-transparent border-none cursor-pointer flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => remove(e.id)} className="font-inter text-[11px] font-medium text-red bg-transparent border-none cursor-pointer flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit journal entry" : "New journal entry"} showClose>
        <div className="flex flex-col gap-3">
          <div className="g2">
            <div className="field"><label className="lbl">Date</label><input type="date" className="inp" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
            <div className="field"><label className="lbl">Time</label><input type="time" className="inp" value={form.time} onChange={(e) => set("time", e.target.value)} /></div>
          </div>
          <div className="g2">
            <div className="field">
              <label className="lbl">Type of act</label>
              <select className="sel" value={form.act} onChange={(e) => set("act", e.target.value)}>
                {ACTS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="lbl">Signing type</label>
              <select className="sel" value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.filter((t) => t !== "All").map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label className="lbl">Signer name</label><input className="inp" placeholder="Signer full name" value={form.signer} onChange={(e) => set("signer", e.target.value)} /></div>
          <div className="g2">
            <div className="field">
              <label className="lbl">ID type</label>
              <select className="sel" value={form.idType} onChange={(e) => set("idType", e.target.value)}>
                {ID_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label className="lbl">ID number</label><input className="inp" placeholder="ID number" value={form.idNo} onChange={(e) => set("idNo", e.target.value)} /></div>
          </div>
          <div className="field"><label className="lbl">Document type</label><input className="inp" placeholder="Document type" value={form.doc} onChange={(e) => set("doc", e.target.value)} /></div>
          <div className="field"><label className="lbl">Location</label><input className="inp" placeholder="Signing location" value={form.addr} onChange={(e) => set("addr", e.target.value)} /></div>
          <div className="field"><label className="lbl">Fee charged</label><input className="inp" placeholder="$0" value={form.fee} onChange={(e) => set("fee", e.target.value)} /></div>
        </div>
        <div className="modal-foot flex-col gap-2">
          <button onClick={save} className="btn-p"><Check className="w-4 h-4" /> {editing ? "Update" : "Add"} entry</button>
          <button onClick={() => setModalOpen(false)} className="btn-gh">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
