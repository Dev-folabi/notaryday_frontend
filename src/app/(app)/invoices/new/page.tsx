"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  FileText,
  Mail,
  Download,
  RefreshCw,
  Send,
  Check,
  AlertTriangle,
} from "lucide-react";
import { invoicesApi } from "@/api/invoices.api";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, unwrap, errMsg, cn } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  invoice_number?: string;
  recipient_name?: string | null;
  recipient_email?: string | null;
  note_to_client?: string | null;
  total: number;
  subtotal?: number;
  travel_fee?: number;
  is_paid: boolean;
  sent_at?: string | null;
  pdf_url?: string | null;
  pdf_pending?: boolean;
  job_id?: string;
  job?: {
    address?: string;
    signing_type?: string;
    appointment_time?: string;
    fee?: number;
    platform_fee?: number;
    net_earnings?: number;
    mileage_cost?: number;
    client_name?: string;
    client_email?: string;
  };
}

interface JobRow {
  id: string;
  address?: string;
  client_name?: string | null;
  client_email?: string | null;
  fee?: number;
  status?: string;
}

function useFreshInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: ["invoices", "get", invoiceId],
    queryFn: async () => {
      const res = await invoicesApi.get(invoiceId!);
      return unwrap<InvoiceRow>(res) ?? null;
    },
    enabled: !!invoiceId,
    staleTime: 15 * 1000,
  });
}
export default function NewInvoicePage() {
  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get("jobId");
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", "complete-for-invoice"],
    queryFn: async () => {
      const res = await (await import("@/api/jobs.api")).jobsApi.list({
        status: "COMPLETE",
      });
      return unwrap<JobRow[]>(res) ?? [];
    },
    staleTime: 30 * 1000,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", "all"],
    queryFn: async () => {
      const res = await invoicesApi.list();
      return unwrap<InvoiceRow[]>(res) ?? [];
    },
    staleTime: 30 * 1000,
  });

  const selectedJob = jobId ? jobs.find((j) => j.id === jobId) : null;
  const existing = useMemo(
    () => invoices.find((i) => i.job_id === jobId) ?? null,
    [invoices, jobId],
  );

  const {
    data: fresh,
    isLoading: loadingFresh,
    refetch: refreshInvoice,
    isRefetching,
  } = useFreshInvoice(existing?.id ?? null);

  const invoice = fresh ?? existing;

  // Local editable fields, kept in sync when a (different) invoice loads.
  const [recipientEmail, setRecipientEmail] = useState("");
  const [note, setNote] = useState("");
  const [dirty, setDirty] = useState(false);
  const lastInvoiceId = useRef<string | null>(null);

  useEffect(() => {
    if (invoice && invoice.id !== lastInvoiceId.current) {
      lastInvoiceId.current = invoice.id;
      setRecipientEmail(invoice.recipient_email ?? "");
      setNote(invoice.note_to_client ?? "");
      setDirty(false);
    }
  }, [invoice]);

  // Job fee is the invoice's source of truth until the notary edits it.
  const fee = Number(invoice?.total ?? selectedJob?.fee ?? 0);

  const generateDraft = useMutation({
    mutationFn: (jid: string) => invoicesApi.generate(jid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      addToast({ title: "Draft invoice created", type: "success" });
    },
    onError: (err) =>
      addToast({
        type: "error",
        title: "Couldn't create invoice",
        message: errMsg(err),
      }),
  });

  const save = useMutation({
    mutationFn: (data: { recipient_email: string; note_to_client: string }) =>
      invoicesApi.update(invoice!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setDirty(false);
      addToast({ title: "Invoice updated", type: "success" });
    },
    onError: (err) =>
      addToast({ type: "error", title: "Save failed", message: errMsg(err) }),
  });

  const sendInvoice = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      invoicesApi.send(id, email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      addToast({ title: "Invoice sent to client", type: "success" });
      router.push("/invoices");
    },
    onError: (err) =>
      addToast({ type: "error", title: "Couldn't send", message: errMsg(err) }),
  });

  const download = useMutation({
    mutationFn: (id: string) =>
      invoicesApi.get(id).then((res) => unwrap<InvoiceRow>(res)),
    onSuccess: (freshInv) => {
      const url = freshInv?.pdf_url;
      if (!url) {
        addToast({
          title: "PDF not ready yet — check back in a minute",
          type: "error",
        });
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (err) =>
      addToast({ type: "error", title: "Failed to get PDF", message: errMsg(err) }),
  });

  const handleSend = () => {
    if (!invoice) return;
    if (save.isPending) {
      addToast({ title: "Saving changes first…", type: "info" });
      return;
    }
    if (dirty) {
      addToast({
        title: "You have unsaved changes",
        message: "Save before sending so the email and PDF match.",
        type: "info",
      });
      return;
    }
    sendInvoice.mutate({ id: invoice.id, email: recipientEmail.trim() });
  };

  const handleDownload = () => {
    if (!invoice) return;
    if (invoice.pdf_pending || !invoice.pdf_url) {
      addToast({
        title: "PDF still generating — try again in a moment",
        type: "info",
      });
      return;
    }
    download.mutate(invoice.id);
  };

  const completeJobs = jobs.filter((j) => j.status === "COMPLETE");

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <button className="ph-back" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="ph-title">New invoice</div>
        <div style={{ minWidth: 44 }} />
      </div>

      <div className="con">
        {!jobId && (
          <>
            <span className="slbl">Select a completed job</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {completeJobs.length === 0 && (
                <div className="empty-box">
                  <p className="font-inter text-sm font-semibold text-navy mb-1">
                    No completed jobs
                  </p>
                  <p className="font-inter text-xs text-slate-secondary">
                    Mark a job as complete first, then come back to invoice it.
                  </p>
                </div>
              )}
              {completeJobs.map((j) => {
                const inv = invoices.find((i) => i.job_id === j.id);
                return (
                  <button
                    key={j.id}
                    className="jcard"
                    style={{ textAlign: "left", cursor: "pointer" }}
                    onClick={() =>
                      router.push(`/invoices/new?jobId=${j.id}`)
                    }
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0F2C4E",
                        }}
                      >
                        {j.address}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          marginTop: 2,
                        }}
                      >
                        {j.client_name || "Client"} ·{" "}
                        {formatCurrency(j.fee ?? 0)}
                        {inv && (
                          <span
                            className={cn(
                              "chip",
                              inv.is_paid
                                ? "c-paid"
                                : inv.sent_at
                                  ? "c-sent"
                                  : "c-draft",
                            )}
                            style={{ marginLeft: 6 }}
                          >
                            {inv.is_paid
                              ? "paid"
                              : inv.sent_at
                                ? "sent"
                                : "draft"}
                          </span>
                        )}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-slate-secondary" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {jobId && selectedJob && (
          <InvoiceEditor
            job={selectedJob}
            invoice={invoice}
            loading={loadingFresh}
            recipientEmail={recipientEmail}
            setRecipientEmail={(v) => {
              setRecipientEmail(v);
              setDirty(true);
            }}
            note={note}
            setNote={(v) => {
              setNote(v);
              setDirty(true);
            }}
            fee={fee}
            onSave={() => save.mutate({ recipient_email: recipientEmail, note_to_client: note })}
            saving={save.isPending}
            onSend={handleSend}
            sending={sendInvoice.isPending}
            onDownload={handleDownload}
            downloading={download.isPending}
            onGenerate={() => generateDraft.mutate(jobId)}
            generating={generateDraft.isPending}
            onRefresh={() => {
              refreshInvoice();
              addToast({ title: "Refreshing invoice…", type: "info" });
            }}
            refreshing={isRefetching}
          />
        )}

        {jobId && !selectedJob && (
          <div className="empty-box">
            <p className="font-inter text-sm font-semibold text-navy mb-1">
              Job not found
            </p>
            <button
              className="btn-s mt-2"
              onClick={() => router.push("/invoices/new")}
            >
              Choose a job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceEditor({
  job,
  invoice,
  loading,
  recipientEmail,
  setRecipientEmail,
  note,
  setNote,
  fee,
  onSave,
  saving,
  onSend,
  sending,
  onDownload,
  downloading,
  onGenerate,
  generating,
  onRefresh,
  refreshing,
}: {
  job: JobRow;
  invoice: InvoiceRow | null;
  loading: boolean;
  recipientEmail: string;
  setRecipientEmail: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  fee: number;
  onSave: () => void;
  saving: boolean;
  onSend: () => void;
  sending: boolean;
  onDownload: () => void;
  downloading: boolean;
  onGenerate: () => void;
  generating: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const hasDraft = !!invoice;

  return (
    <div className="flex flex-col gap-3">
      {!hasDraft && (
        <div className="empty-box">
          <p className="font-inter text-sm font-semibold text-navy mb-1">
            Invoice draft not created yet
          </p>
          <p className="font-inter text-xs text-slate-secondary max-w-[280px] mx-auto leading-relaxed">
            This job completed before drafts were automatic — create one now, then
            review it before sending.
          </p>
        </div>
      )}

      {/* Job summary card */}
      <div className="bg-white border border-border rounded-[12px] p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-navy" />
          <span className="font-sora text-[15px] font-bold text-navy">
            Invoice draft
          </span>
          {invoice && (
            <span
              className={cn(
                "chip ml-auto",
                invoice.is_paid ? "c-paid" : invoice.sent_at ? "c-sent" : "c-draft",
              )}
            >
              {invoice.is_paid
                ? "PAID"
                : invoice.sent_at
                  ? "SENT"
                  : "DRAFT"}
            </span>
          )}
        </div>
        <div className="text-[12px] text-slate-secondary">{job.address}</div>
        <div className="text-[12px] text-slate-secondary mt-0.5">
          {job.client_name || "Client"}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="text-[12px] text-slate-secondary">Total due</span>
          <span className="font-sora text-[18px] font-bold text-navy">
            {formatCurrency(fee)}
          </span>
        </div>
      </div>

      {/* Before you send — editable fields */}
      <div className="bg-white border border-border rounded-[12px] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-navy" />
          <span className="font-sora text-[14px] font-bold text-navy">
            Before you send
          </span>
          <button
            className="ml-auto flex items-center gap-1 text-[11px] text-slate-secondary hover:text-navy"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        <label className="font-inter font-medium text-xs text-slate-body block mb-1.5">
          Send invoice to
        </label>
        <input
          className="bg-white border border-border rounded-input h-10 px-3 text-sm w-full outline-none focus:border-interactive-blue focus:ring-2 focus:ring-blue-100"
          type="email"
          placeholder="client@example.com"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          disabled={loading}
        />

        <label className="font-inter font-medium text-xs text-slate-body block mt-4 mb-1.5">
          Note to client (optional)
        </label>
        <textarea
          className="bg-white border border-border rounded-input px-3 py-2 text-sm w-full outline-none focus:border-interactive-blue focus:ring-2 focus:ring-blue-100"
          rows={3}
          placeholder="e.g. Thank you for your business —"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={loading}
        />

        <div className="mt-3 flex gap-2">
          <button
            className="btn-sm flex-1"
            onClick={onSave}
            disabled={!hasDraft || saving || loading}
          >
            <Check className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save changes"}
          </button>
          {!hasDraft && (
            <button
              className="btn-sm flex-1"
              onClick={onGenerate}
              disabled={generating || loading}
            >
              <FileText className="w-3.5 h-3.5" />
              {generating ? "Creating…" : "Create draft"}
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border border-border rounded-[12px] overflow-hidden">
        <div className="bg-navy px-[18px] py-4 flex justify-between gap-2">
          <div>
            <div className="font-sora text-[16px] font-bold text-white">
              Notary Day
            </div>
            <div className="text-[11px] text-white/60">
              {invoice?.invoice_number ?? "Draft"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/50">Total due</div>
            <div className="font-sora text-[18px] font-bold text-white">
              {formatCurrency(fee)}
            </div>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 text-[12px]">
          <div className="text-slate-secondary">
            <div className="text-[9px] font-semibold uppercase text-slate-secondary mb-1">
              Service
            </div>
            <div className="text-navy font-semibold">
              {job.address}
              <br />
              <span className="font-normal text-slate-secondary">
                {(invoice?.job?.signing_type ?? "")
                  .replace("_", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </div>
          </div>
          <div className="text-slate-secondary">
            <div className="text-[9px] font-semibold uppercase text-slate-secondary mb-1">
              Client
            </div>
            <div className="text-navy font-semibold">
              {invoice?.recipient_name ?? job.client_name ?? "Client"}
              <br />
              <span className="font-normal text-slate-secondary">
                {recipientEmail || "email to be added"}
              </span>
            </div>
          </div>
        </div>
        {note && (
          <div className="mx-4 mb-4 px-3 py-2 bg-blue-bg border border-blue-border rounded-[8px] text-[11px] text-blue">
            {note}
          </div>
        )}
        <div className="bg-navy px-[18px] py-3">
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-white/70">Service fee</span>
            <span className="text-[11px] text-white">
              {formatCurrency(fee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/70">Status</span>
            <span className="text-[11px] text-white">
              {invoice?.sent_at ? "Sent" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {invoice && (
        <div
          className="flex gap-2 items-start p-3 rounded-[8px]"
          style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}
        >
          <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber leading-relaxed">
            The PDF reflects the latest saved details. If you edit fields above,
            save before sending so the client sees the updated version.
          </div>
        </div>
      )}

      {!invoice?.is_paid && (
        <>
          <button
            className="btn-p w-full"
            disabled={sending || !hasDraft || loading}
            onClick={onSend}
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending…" : "Send invoice"}
          </button>
          <button
            className="btn-s w-full"
            disabled={downloading || !invoice?.pdf_url}
            onClick={onDownload}
          >
            <Download className="w-4 h-4" />
            {downloading
              ? "Preparing…"
              : invoice?.pdf_pending || !invoice?.pdf_url
                ? "PDF generating…"
                : "Download PDF draft"}
          </button>
        </>
      )}
    </div>
  );
}