"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Plus,
  Mail,
  Download,
  Info,
  DollarSign,
  X,
} from "lucide-react";
import { invoicesApi } from "@/api/invoices.api";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, unwrap, errMsg } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { User } from "@/types/user";

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
  created_at?: string;
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
    client_phone?: string | null;
    signing_duration_mins?: number;
  };
}

interface JobRow {
  id: string;
  address?: string;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  fee?: number;
  status?: string;
  signing_type?: string;
  appointment_time?: string;
}

const SIGNING_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  LOAN_REFI: "Loan Refi",
  HYBRID: "Hybrid",
  PURCHASE_CLOSING: "Purchase Closing",
  FIELD_INSPECTION: "Field Inspection",
  APOSTILLE: "Apostille",
};

type FilterTab = "all" | "sent" | "paid" | "overdue" | "draft";

function statusOf(inv?: InvoiceRow | null): Exclude<FilterTab, "all"> {
  if (!inv) return "draft";
  if (inv.is_paid) return "paid";
  if (inv.sent_at) {
    const days = (Date.now() - new Date(inv.sent_at).getTime()) / 86_400_000;
    if (days > 30) return "overdue";
    return "sent";
  }
  return "draft";
}

const CHIP: Record<string, string> = {
  sent: "c-sent",
  paid: "c-paid",
  overdue: "c-overdue",
  draft: "c-draft",
};

// Render arbitrary payment_info JSON (user-supplied in Settings) into human-readable lines. Handles a plain string ("Zelle: sarah@email.com"), the canonical object shape, and unknown shapes gracefully.
function paymentInfoLines(value: unknown): string[] {
  if (typeof value === "string") return value ? [value] : [];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [];
  }
  const info = value as Record<string, unknown>;
  const out: string[] = [];
  if (typeof info.bank_name === "string" && info.bank_name) {
    const last4 =
      typeof info.account_last4 === "string" && info.account_last4
        ? ` ending in ${info.account_last4}`
        : "";
    out.push(`${info.bank_name}${last4}`);
  }
  const labeled: [string, string][] = [
    ["zelle", "Zelle"],
    ["venmo", "Venmo"],
    ["paypal", "PayPal"],
  ];
  for (const [key, label] of labeled) {
    const v = info[key];
    if (typeof v === "string" && v) out.push(`${label}: ${v}`);
  }
  if (typeof info.routing_last4 === "string" && info.routing_last4) {
    out.push(`Routing: ••••${info.routing_last4}`);
  }
  if (typeof info.other === "string" && info.other) out.push(info.other);
  return out;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get("jobId");
  const qc = useQueryClient();
  const { addToast } = useUIStore();
  const { user } = useAuth();

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", "complete-for-invoice"],
    queryFn: async () => {
      const res = await (
        await import("@/api/jobs.api")
      ).jobsApi.list({
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

  // Auto-generate the draft for older completed jobs that predate automatic
  // generation (prototype: the draft always exists once a job is complete).
  const generateDraft = useMutation({
    mutationFn: (jid: string) => invoicesApi.generate(jid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: () => {
      addToast({ title: "Couldn't create invoice draft", type: "error" });
    },
  });

  useEffect(() => {
    if (jobId && selectedJob && !existing && !generateDraft.isPending) {
      generateDraft.mutate(jobId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, selectedJob?.id, existing?.id]);

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="flex items-center gap-2.5">
          <Link href="/jobs" className="ph-back">
            Back to My Jobs
          </Link>
          <div className="ph-title">Invoices</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn-sm"
            onClick={() =>
              addToast({ title: "Exporting all invoices CSV", type: "info" })
            }
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            className="btn-sm"
            onClick={() => router.push("/invoices/new")}
          >
            <Plus className="w-3.5 h-3.5" /> Add invoice
          </button>
        </div>
      </div>

      <div className="con">
        {!jobId && (
          <>
            <span className="slbl">Select a completed job</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {jobs.filter((j) => j.status === "COMPLETE").length === 0 && (
                <div className="empty-box">
                  <p className="font-inter text-sm font-semibold text-navy mb-1">
                    No completed jobs
                  </p>
                  <p className="font-inter text-xs text-slate-secondary">
                    Mark a job as complete first, then come back to invoice it.
                  </p>
                </div>
              )}
              {jobs
                .filter((j) => j.status === "COMPLETE")
                .map((j) => {
                  const inv = invoices.find((i) => i.job_id === j.id);
                  return (
                    <button
                      key={j.id}
                      className="jcard"
                      style={{ textAlign: "left", cursor: "pointer" }}
                      onClick={() => router.push(`/invoices/new?jobId=${j.id}`)}
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
                              className="chip c-draft"
                              style={{ marginLeft: 6 }}
                            >
                              already invoiced
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
          <InvoiceDraft
            key={existing?.id ?? "creating"}
            job={selectedJob}
            invoice={existing}
            user={user}
            onSaved={() => qc.invalidateQueries({ queryKey: ["invoices"] })}
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

function InvoiceDraft({
  job,
  invoice,
  user,
  onSaved,
}: {
  job: JobRow;
  invoice: InvoiceRow | null;
  user: User | null | undefined;
  onSaved: () => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  const initialFee = Number(
    invoice?.total ?? invoice?.subtotal ?? job.fee ?? 0,
  );
  const [client, setClient] = useState(
    invoice?.recipient_name ?? job.client_name ?? "",
  );
  const [email, setEmail] = useState(
    invoice?.recipient_email ?? job.client_email ?? "",
  );
  const [fee, setFee] = useState(initialFee);
  const [note, setNote] = useState(invoice?.note_to_client ?? "");
  const [confirmSend, setConfirmSend] = useState(false);

  const total = Number(fee);

  const isPaid = invoice?.is_paid ?? false;
  const isSent = !isPaid && !!invoice?.sent_at;

  const save = useMutation({
    mutationFn: () =>
      invoicesApi.update(invoice?.id ?? "", {
        recipient_name: client,
        recipient_email: email,
        ...(isPaid
          ? {}
          : { final_fee: Number(fee) }),
        note_to_client: note,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      onSaved();
      addToast({
        title: isPaid
          ? "Details saved"
          : isSent
            ? "Saved — PDF will regenerate"
            : "Saved as draft",
        type: "success",
      });
      router.push("/invoices");
    },
    onError: (err) =>
      addToast({ type: "error", title: "Save failed", message: errMsg(err) }),
  });

  const send = useMutation({
    mutationFn: () => invoicesApi.send(invoice?.id ?? "", email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      addToast({ title: "Invoice sent", type: "success" });
      router.push("/invoices");
    },
    onError: (err) =>
      addToast({ type: "error", title: "Couldn't send", message: errMsg(err) }),
  });

  const handleSaveClick = () => {
    if (!invoice) {
      addToast({
        title: "Draft still being created — try again in a moment",
        type: "info",
      });
      return;
    }
    if (isPaid) {
      save.mutate();
      return;
    }
    setConfirmSend(true);
  };

  const handleSaveOnly = () => {
    setConfirmSend(false);
    save.mutate();
  };

  const handleSaveAndSend = () => {
    setConfirmSend(false);
    if (!email.trim()) {
      addToast({ title: "Enter a recipient email first", type: "info" });
      return;
    }
    save.mutate(undefined, {
      onSuccess: () => send.mutate(),
    });
  };

  const fromName = user?.full_name ?? "Your name";
  const fromEmail = user?.email ?? "";
  const fromLine2 = user?.settings?.home_base_address || "City, State";
  const nnaLine = user?.nna_certified ? "NNA Certified" : null;
  const billToPhone = job.client_phone ?? invoice?.job?.client_phone ?? null;

  // Payment details from Settings (payment_info) — shown on the invoice so the
  // client knows exactly how to pay the notary directly.
  const paymentLines = paymentInfoLines(user?.settings?.payment_info);

  const invoiceDate = invoice?.created_at
    ? format(parseISO(invoice.created_at), "MMMM d, yyyy")
    : format(new Date(), "MMMM d, yyyy");

  return (
    <div>
      {/* Status-aware notice */}
      {isPaid ? (
        <div
          className="alert"
          style={{
            marginBottom: 16,
            background: "var(--bg)",
            borderColor: "var(--border)",
          }}
        >
          <span>
            <Info className="w-4 h-4" />
          </span>
          <div style={{ fontSize: 11, lineHeight: 1.4 }}>
            This invoice was paid and is read-only for the amount. You can still
            update the client name, email, or note.
          </div>
        </div>
      ) : isSent ? (
        <div className="alert al-amber" style={{ marginBottom: 16 }}>
          <span>
            <Info className="w-4 h-4" />
          </span>
          <div style={{ fontSize: 11, lineHeight: 1.4 }}>
            This invoice was already sent
            {invoice?.sent_at
              ? ` on ${format(parseISO(invoice.sent_at), "MMMM d, yyyy")}`
              : ""}
            . Changes regenerate the PDF — use Resend to send the updated copy.
          </div>
        </div>
      ) : (
        <div className="alert al-blue" style={{ marginBottom: 16 }}>
          <span>
            <Info className="w-4 h-4" />
          </span>
          <div style={{ fontSize: 11, lineHeight: 1.4 }}>
            This invoice was generated automatically when you marked the signing
            complete. Review and edit this individual invoice before sending.
            This is how it will appear to the receiver. Your payment details
            from Settings will be shown on the invoice PDF.
          </div>
        </div>
      )}

      {/* Invoice preview */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,.06)",
          marginBottom: 16,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "var(--navy)",
            padding: "18px 20px",
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 2,
              }}
            >
              Notary Day
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>
              Invoice {invoice?.invoice_number ?? "DRAFT"} -{" "}
              {statusOf(invoice).toUpperCase()} - Preview as receiver sees it
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.5)",
                marginBottom: 1,
              }}
            >
              Invoice date
            </div>
            <div style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>
              {invoiceDate}
            </div>
            <div style={{ marginTop: 6 }}>
              <span className={cn("chip", CHIP[statusOf(invoice)])}>
                {statusOf(invoice).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* From / Bill to */}
        <div style={{ padding: "18px 20px" }}>
          <div className="g2" style={{ marginBottom: 16 }}>
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "var(--slate2)",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  marginBottom: 4,
                }}
              >
                From
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--navy)",
                  marginBottom: 1,
                }}
              >
                {fromName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--slate2)",
                  lineHeight: 1.5,
                }}
              >
                {fromEmail}
                <br />
                {fromLine2}
                {nnaLine && (
                  <>
                    <br />
                    {nnaLine}
                  </>
                )}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "var(--slate2)",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  marginBottom: 4,
                }}
              >
                Bill to
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--navy)",
                  marginBottom: 1,
                }}
              >
                {client || job.client_name || "Client"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--slate2)",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {job.address}
                {email && (
                  <>
                    <br />
                    {email}
                  </>
                )}
                {billToPhone && (
                  <>
                    <br />
                    {billToPhone}
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            style={{ height: 1, background: "var(--border)", marginBottom: 12 }}
          />

          {/* Line items */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                fontSize: 10,
                fontWeight: 600,
                color: "var(--slate2)",
                textTransform: "uppercase",
                letterSpacing: ".3px",
                paddingBottom: 6,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ flex: 1 }}>Description</span>
              <span style={{ width: 50, textAlign: "right" }}>Qty</span>
              <span style={{ width: 80, textAlign: "right" }}>Amount</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--navy)",
                    marginBottom: 1,
                  }}
                >
                  {SIGNING_TYPE_LABELS[job.signing_type ?? ""] ??
                    job.signing_type ??
                    "Signing"}{" "}
                  - {job.address}
                </div>
                <div style={{ fontSize: 10, color: "var(--slate2)" }}>
                  {job.appointment_time
                    ? format(parseISO(job.appointment_time), "h:mm a")
                    : ""}{" "}
                  - {invoice?.job?.signing_duration_mins ?? 60} min -{" "}
                  {SIGNING_TYPE_LABELS[job.signing_type ?? ""] ??
                    job.signing_type ??
                    "Signing"}
                </div>
              </div>
              <div
                style={{
                  width: 50,
                  textAlign: "right",
                  fontSize: 12,
                  color: "var(--slate)",
                }}
              >
                1
              </div>
              <div
                style={{
                  width: 80,
                  textAlign: "right",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--navy)",
                }}
              >
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 20, fontSize: 11 }}>
              <span style={{ color: "var(--slate2)" }}>Subtotal</span>
              <span
                style={{
                  color: "var(--navy)",
                  fontWeight: 600,
                  width: 70,
                  textAlign: "right",
                }}
              >
                {formatCurrency(total)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: 11 }}>
              <span style={{ color: "var(--slate2)" }}>Tax (0%)</span>
              <span
                style={{
                  color: "var(--navy)",
                  fontWeight: 600,
                  width: 70,
                  textAlign: "right",
                }}
              >
                $0.00
              </span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div
          style={{
            background: "var(--navy)",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,.8)",
            }}
          >
            Total due
          </span>
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {formatCurrency(total)}
          </span>
        </div>

        {/* Payment note strip */}
        <div
          style={{
            padding: "10px 18px",
            background: "var(--bg)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--slate2)",
              display: "flex",
              gap: 6,
              lineHeight: 1.4,
            }}
          >
            <span>
              <Info className="w-3 h-3 flex-shrink-0" />
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {paymentLines.length > 0 ? (
                <>
                  <span>
                    <span style={{ fontWeight: 600 }}>Pay by</span>{" "}
                    {paymentLines.join(" · ")}.{" "}
                    {client || job.client_name || "Your client"} pays you
                    directly - Notary Day is not involved in the transaction.
                    This is the exact preview as the receiver will see it in
                    email.
                  </span>
                </>
              ) : (
                <span>
                  Your payment details (Zelle, Venmo, or bank info from
                  Settings) will appear on the invoice PDF.{" "}
                  {client || job.client_name || "Your client"} pays you directly
                  - Notary Day is not involved in the transaction. This is the
                  exact preview as the receiver will see it in email.
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Before you send */}
      <span className="slbl">
        {isPaid
          ? "Invoice details"
          : isSent
            ? "Edit this invoice"
            : "Before you send - Edit this individual invoice"}
      </span>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field">
            <label className="lbl">Billable client (editable)</label>
            <input
              className="inp"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="lbl">Send to email *</label>
            <div className="icw">
              <span className="ico">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                className="inp has-icon"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <span className="hint">
              Invoice will be sent to this email with PDF attached and payment
              link if Stripe enabled.
            </span>
          </div>
          <div className="g2">
            <div className="field">
              <label className="lbl">Final fee amount *</label>
              <div className="icw">
                <span className="ico">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
                <input
                  className="inp has-icon"
                  type="number"
                  value={fee}
                  disabled={isPaid}
                  onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                />
              </div>
              <span className="hint">
                {isPaid
                  ? "Paid invoices can't change the amount."
                  : "Edit if final amount differs from agreed fee. Updates total automatically."}
              </span>
            </div>
            <div className="field">
              <label className="lbl">Invoice number</label>
              <input
                className="inp"
                value={invoice?.invoice_number ?? "Auto on send"}
                readOnly
              />
            </div>
          </div>
          <div className="field">
            <label className="lbl">Note to client (optional)</label>
            <textarea
              className="ta"
              placeholder="Thank you for your business. This note appears on the invoice below the total."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <span className="hint">
              This note appears on the invoice below the total.
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <button
          className="btn-p"
          disabled={save.isPending || !invoice}
          onClick={handleSaveClick}
        >
          {isPaid
            ? "Save details"
            : save.isPending
              ? "Saving…"
              : "Save & regenerate PDF"}
        </button>
      </div>

      {confirmSend && (
        <div className="modal-overlay" onClick={handleSaveOnly}>
          <div
            className="modal"
            style={{ maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-hdr">
              <div className="modal-title">Send PDF to client?</div>
              <button className="modal-close" onClick={handleSaveOnly}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-body">
              <p className="font-inter text-[13px] text-slate-body leading-relaxed">
                The PDF will be regenerated with your changes. Do you want to
                send it to{" "}
                {email.trim() || client || job.client_name || "the client"}?
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn-p" onClick={handleSaveAndSend}>
                <Mail className="w-4 h-4" /> Save & send to client
              </button>
              <button className="btn-gh" onClick={handleSaveOnly}>
                Save without sending
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
