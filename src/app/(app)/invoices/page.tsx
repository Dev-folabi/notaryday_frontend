"use client";

import { useState } from "react";
import { useInvoices, useSendInvoice, useMarkInvoicePaid } from "@/hooks/useInvoices";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Send,
  CheckCircle2,
  Download,
  ChevronRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

type FilterTab = "all" | "unpaid" | "paid";

const SIGNING_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  LOAN_REFI: "Loan Refi",
  HYBRID: "Hybrid",
  PURCHASE_CLOSING: "Purchase",
  FIELD_INSPECTION: "Field Inspection",
  APOSTILLE: "Apostille",
};

function invoiceStatus(inv: {
  is_paid: boolean;
  sent_at: string | null;
  created_at: string;
}) {
  if (inv.is_paid) return "paid";
  if (inv.sent_at) return "sent";
  // overdue: sent more than 30 days ago and not paid
  if (inv.sent_at) {
    const sentDate = new Date(inv.sent_at);
    const daysSinceSent = (Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceSent > 30) return "overdue";
  }
  return "draft";
}

const STATUS_CONFIG = {
  draft: {
    label: "DRAFT",
    className: "bg-slate-100 text-slate-secondary border border-slate-200",
  },
  sent: {
    label: "SENT",
    className: "bg-blue-bg text-interactive-blue border border-blue-border",
  },
  paid: {
    label: "PAID",
    className: "bg-teal-bg text-teal-success border border-teal-border",
  },
  overdue: {
    label: "OVERDUE",
    className: "bg-red-danger/10 text-red-danger border border-red-danger/20",
  },
};

export default function InvoicesPage() {
  const [tab, setTab] = useState<FilterTab>("all");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const { addToast } = useUIStore();

  const { data: invoices = [], isLoading, refetch } = useInvoices(
    tab === "paid" ? { is_paid: true } : tab === "unpaid" ? { is_paid: false } : undefined
  );

  const sendInvoice = useSendInvoice();
  const markPaid = useMarkInvoicePaid();

  const handleSend = async (id: string) => {
    setSendingId(id);
    try {
      await sendInvoice.mutateAsync({ id });
      addToast({ title: "Invoice sent successfully", type: "success" });
    } catch {
      addToast({ title: "Failed to send invoice", type: "error" });
    } finally {
      setSendingId(null);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setMarkingId(id);
    try {
      await markPaid.mutateAsync({ id });
      addToast({ title: "Invoice marked as paid", type: "success" });
    } catch {
      addToast({ title: "Failed to update invoice", type: "error" });
    } finally {
      setMarkingId(null);
    }
  };

  const unpaidCount = invoices.filter((inv) => !inv.is_paid).length;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="font-sora font-bold text-xl text-primary-navy">
            Invoices
          </h1>
          {unpaidCount > 0 && (
            <span className="text-[10px] font-bold bg-red-danger/10 text-red-danger px-2 py-0.5 rounded-full border border-red-danger/20">
              {unpaidCount} unpaid
            </span>
          )}
        </div>
        <button
          onClick={() => addToast({ title: "CSV export coming soon", type: "info" })}
          className="flex items-center gap-1.5 h-9 px-3 border border-border rounded-[8px] font-inter text-xs font-semibold text-slate-secondary hover:border-slate-secondary transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-white border-b border-border px-4 lg:px-8 gap-1 flex-shrink-0">
        {(["all", "unpaid", "paid"] as FilterTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "py-2.5 px-4 font-inter text-[12.5px] font-medium border-b-2 transition-colors capitalize",
              tab === t
                ? "border-primary-navy text-primary-navy font-semibold"
                : "border-transparent text-slate-secondary"
            )}
          >
            {t === "unpaid" ? "Unpaid" : t === "paid" ? "Paid" : "All"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-muted" />
            </div>
            <p className="font-inter text-sm font-semibold text-primary-navy mb-1">
              No invoices yet
            </p>
            <p className="font-inter text-xs text-slate-secondary max-w-[280px] leading-relaxed">
              Invoices are generated when you complete a job. Mark a job as
              complete to create your first invoice.
            </p>
            <Link
              href="/jobs"
              className="mt-4 font-inter text-sm font-semibold text-interactive-blue hover:underline"
            >
              Go to My Jobs
            </Link>
          </div>
        ) : (
          <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-3">
            {invoices.map((inv) => {
              const status = invoiceStatus(inv);
              const statusCfg = STATUS_CONFIG[status];
              const appointmentDate = inv.job?.appointment_time
                ? format(parseISO(inv.job.appointment_time), "MMM d, yyyy")
                : null;
              const signingTypeLabel = inv.job?.signing_type
                ? SIGNING_TYPE_LABELS[inv.job.signing_type] ?? inv.job.signing_type
                : null;
              const isSending = sendingId === inv.id;
              const isMarkingThisOne = markingId === inv.id;

              return (
                <div
                  key={inv.id}
                  className="bg-white border border-border rounded-[12px] p-4 hover:border-slate-secondary transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {/* Left: invoice info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-inter text-[12px] font-mono text-muted">
                          {inv.invoice_number}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide",
                            statusCfg.className
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      {inv.recipient_name && (
                        <p className="font-inter text-[13px] font-semibold text-primary-navy truncate">
                          {inv.recipient_name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {signingTypeLabel && (
                          <span className="font-inter text-[11px] text-slate-secondary">
                            {signingTypeLabel}
                          </span>
                        )}
                        {appointmentDate && (
                          <>
                            <span className="text-muted text-[10px]">·</span>
                            <span className="font-inter text-[11px] text-slate-secondary">
                              {appointmentDate}
                            </span>
                          </>
                        )}
                        {inv.sent_at && (
                          <>
                            <span className="text-muted text-[10px]">·</span>
                            <span className="font-inter text-[11px] text-slate-secondary flex items-center gap-1">
                              <Send className="w-2.5 h-2.5" />
                              Sent {format(parseISO(inv.sent_at), "MMM d")}
                            </span>
                          </>
                        )}
                        {inv.paid_at && (
                          <>
                            <span className="text-muted text-[10px]">·</span>
                            <span className="font-inter text-[11px] text-teal-success flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Paid {format(parseISO(inv.paid_at), "MMM d")}
                            </span>
                          </>
                        )}
                      </div>
                      {inv.job?.address && (
                        <p className="font-inter text-[11px] text-muted truncate mt-0.5">
                          {inv.job.address}
                        </p>
                      )}
                    </div>

                    {/* Right: total */}
                    <div className="text-right flex-shrink-0">
                      <span
                        className={cn(
                          "font-sora text-[18px] font-bold block",
                          status === "paid"
                            ? "text-teal-success"
                            : status === "overdue"
                              ? "text-red-danger"
                              : "text-primary-navy"
                        )}
                      >
                        {formatCurrency(inv.total)}
                      </span>
                      {inv.travel_fee > 0 && (
                        <span className="font-inter text-[10px] text-slate-secondary">
                          incl. ${inv.travel_fee.toFixed(2)} travel
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action row */}
                  {!inv.is_paid && (
                    <div className="flex gap-2 pt-3 border-t border-border">
                      {/* Send / Re-send */}
                      <button
                        onClick={() => handleSend(inv.id)}
                        disabled={isSending}
                        className={cn(
                          "flex-1 h-9 rounded-[8px] font-inter text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                          status === "draft"
                            ? "bg-primary-navy text-white hover:bg-navy-active disabled:opacity-50"
                            : "border border-border text-slate-secondary hover:border-slate-secondary disabled:opacity-50"
                        )}
                      >
                        {isSending ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        {status === "draft"
                          ? "Send Invoice"
                          : "Re-send Invoice"}
                      </button>

                      {/* Mark as Paid */}
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        disabled={isMarkingThisOne}
                        className="flex-1 h-9 rounded-[8px] border border-teal-success text-teal-success font-inter text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-bg transition-colors disabled:opacity-50"
                      >
                        {isMarkingThisOne ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Mark Paid
                      </button>

                      {/* Link to job */}
                      {inv.job_id && (
                        <Link
                          href={`/jobs/${inv.job_id}`}
                          className="w-9 h-9 rounded-[8px] border border-border flex items-center justify-center text-slate-secondary hover:border-slate-secondary transition-colors flex-shrink-0"
                          title="View job"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Paid state footer */}
                  {inv.is_paid && (
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <CheckCircle2 className="w-4 h-4 text-teal-success flex-shrink-0" />
                      <span className="font-inter text-xs text-teal-success font-medium">
                        Payment received
                        {inv.payment_method_used
                          ? ` via ${inv.payment_method_used}`
                          : ""}
                        {inv.paid_at
                          ? ` on ${format(parseISO(inv.paid_at), "MMMM d, yyyy")}`
                          : ""}
                      </span>
                      {inv.job_id && (
                        <Link
                          href={`/jobs/${inv.job_id}`}
                          className="ml-auto font-inter text-xs text-slate-secondary hover:text-primary-navy transition-colors flex items-center gap-0.5"
                        >
                          View job <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Tip */}
            <div className="flex items-start gap-2 p-3 bg-blue-bg border border-blue-border rounded-[10px]">
              <AlertCircle className="w-4 h-4 text-interactive-blue flex-shrink-0 mt-0.5" />
              <p className="font-inter text-[11px] text-interactive-blue leading-relaxed">
                Your payment details (Zelle, Venmo, or bank info) from Settings
                appear on the invoice PDF. Clients pay you directly — Notary Day
                does not process payments.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
