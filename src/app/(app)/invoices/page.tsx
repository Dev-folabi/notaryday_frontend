"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Download,
  Plus,
  Search,
  Check,
  Mail,
  DollarSign,
  X,
} from "lucide-react";
import { invoicesApi } from "@/api/invoices.api";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, cn, unwrap } from "@/lib/utils";

type FilterTab = "all" | "sent" | "paid" | "overdue" | "draft";

interface InvoiceRow {
  id: string;
  invoice_number?: string;
  recipient_name?: string | null;
  recipient_email?: string | null;
  total: number;
  subtotal?: number;
  travel_fee?: number;
  is_paid: boolean;
  paid_at?: string | null;
  sent_at?: string | null;
  created_at?: string;
  payment_method_used?: string | null;
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
  };
}

function statusOf(inv: InvoiceRow): Exclude<FilterTab, "all"> {
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

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function fmtLongDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const FILTERS: FilterTab[] = ["all", "sent", "paid", "overdue", "draft"];
const FILTER_LABELS: Record<FilterTab, string> = {
  all: "All",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  draft: "Draft",
};

export default function InvoicesPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { addToast, openCITT } = useUIStore();
  const [tab, setTab] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<InvoiceRow | null>(null);
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", "all"],
    queryFn: async () => {
      const res = await invoicesApi.list();
      return (unwrap<InvoiceRow[]>(res) ?? []) as InvoiceRow[];
    },
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (focusId && invoices.length > 0 && !selected) {
      const match = invoices.find((inv) => inv.id === focusId);
      if (match) setSelected(match);
    }
  }, [focusId, invoices, selected]);

  const markPaid = useMutation({
    mutationFn: (id: string) => invoicesApi.markPaid(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      addToast({ title: `Invoice ${id} marked as paid`, type: "success" });
      setSelected(null);
    },
    onError: () =>
      addToast({ title: "Failed to update invoice", type: "error" }),
  });

  const resend = useMutation({
    mutationFn: (id: string) => invoicesApi.send(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      addToast({ title: "Invoice sent", type: "success" });
    },
    onError: () => addToast({ title: "Failed to send invoice", type: "error" }),
  });

  const filtered = useMemo(
    () =>
      tab === "all"
        ? invoices
        : invoices.filter((inv) => statusOf(inv) === tab),
    [invoices, tab],
  );

  const totals = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let outstanding = 0;
    let overdue = 0;
    for (const inv of invoices) {
      const s = statusOf(inv);
      billed += inv.total ?? 0;
      if (s === "paid") paid += inv.total ?? 0;
      else outstanding += inv.total ?? 0;
      if (s === "overdue") overdue += inv.total ?? 0;
    }
    return { billed, paid, outstanding, overdue };
  }, [invoices]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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
        {/* Filter pills */}
        <div className="flex gap-1.5 mb-3 flex-wrap overflow-x-auto pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTab(f)}
              className={cn(
                "px-3 py-1.5 rounded-[8px] font-inter text-[11px] whitespace-nowrap flex-shrink-0 border-[1.5px] transition-colors",
                tab === f
                  ? "border-navy bg-blue-bg text-navy font-semibold"
                  : "border-border bg-white text-slate-secondary font-medium",
              )}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Summary metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          <div className="mcard">
            <span className="mc-v text-navy">{formatCurrency(totals.billed)}</span>
            <span className="mc-l">Total billed</span>
          </div>
          <div className="mcard">
            <span className="mc-v text-teal">{formatCurrency(totals.paid)}</span>
            <span className="mc-l">Paid</span>
          </div>
          <div className="mcard">
            <span className="mc-v text-navy">
              {formatCurrency(totals.outstanding)}
            </span>
            <span className="mc-l">Outstanding</span>
          </div>
          <div className="mcard">
            <span className="mc-v text-red">{formatCurrency(totals.overdue)}</span>
            <span className="mc-l">Overdue</span>
          </div>
        </div>

        {/* Table header row */}
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <span className="slbl !mb-0">All invoices</span>
          <span className="font-inter text-[11px] text-slate-secondary">
            {invoices.length} invoices total
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-blue rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-box">
            <p className="font-inter text-sm font-semibold text-navy mb-1">
              No invoices yet
            </p>
            <p className="font-inter text-xs text-slate-secondary max-w-[300px] mx-auto leading-relaxed">
              Invoices are generated when you complete a job. Mark a job as
              complete from My Jobs to generate an invoice instantly.
            </p>
          </div>
        ) : (
          <div className="table-wrap mb-4">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const s = statusOf(inv);
                  return (
                    <tr
                      key={inv.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(inv)}
                    >
                      <td className="font-semibold text-navy">
                        {inv.invoice_number ?? inv.id}
                      </td>
                      <td>
                        {inv.recipient_name ?? inv.job?.client_name ?? "—"}
                      </td>
                      <td className="text-slate-secondary">
                        {fmtDate(inv.created_at ?? inv.job?.appointment_time)}
                      </td>
                      <td className="font-semibold">
                        {formatCurrency(inv.total)}
                      </td>
                      <td>
                        <span className={cn("chip", CHIP[s])}>
                          {s.toUpperCase()}
                        </span>
                      </td>
                      <td className="tbl-actions">
                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn-sm"
                            onClick={() => setSelected(inv)}
                          >
                            <Search className="w-3 h-3" /> View
                          </button>
                          {s !== "paid" && (
                            <button
                              className="btn-sm !bg-teal !text-white !border-teal"
                              disabled={markPaid.isPending}
                              onClick={() => markPaid.mutate(inv.id)}
                            >
                              <Check className="w-3 h-3" /> Mark paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom card */}
        <div className="card p-3 flex gap-2 flex-wrap justify-between items-center">
          <div className="font-inter text-[11px] text-slate-secondary">
            Need to invoice a completed job? Mark a job as complete from My Jobs
            to generate an invoice instantly.
          </div>
          <Link href="/jobs" className="btn-sm">
            Go to My Jobs
          </Link>
        </div>
      </div>

      {selected && (
        <InvoiceModal
          invoice={selected}
          status={statusOf(selected)}
          onClose={() => setSelected(null)}
          onMarkPaid={() => markPaid.mutate(selected.id)}
          onResend={() => resend.mutate(selected.id)}
          isMarking={markPaid.isPending}
          onDownload={() =>
            addToast({ title: "Downloading PDF", type: "info" })
          }
        />
      )}
    </div>
  );
}

function InvoiceModal({
  invoice,
  status,
  onClose,
  onMarkPaid,
  onResend,
  onDownload,
  isMarking,
}: {
  invoice: InvoiceRow;
  status: Exclude<FilterTab, "all">;
  onClose: () => void;
  onMarkPaid: () => void;
  onResend: () => void;
  onDownload: () => void;
  isMarking: boolean;
}) {
  const client = invoice.recipient_name ?? invoice.job?.client_name ?? "Client";
  const fee = invoice.job?.fee ?? invoice.subtotal ?? invoice.total;
  const mileage = invoice.job?.mileage_cost ?? 0;
  const platform = invoice.job?.platform_fee ?? 0;
  const net =
    invoice.job?.net_earnings ?? Math.max(fee - mileage - platform, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-hdr">
          <div className="modal-title">
            Invoice {invoice.invoice_number ?? invoice.id}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body">
          <div className="bg-white border border-border rounded-[12px] overflow-hidden">
            {/* Invoice header (navy) */}
            <div className="bg-navy px-[18px] py-4 flex justify-between gap-2">
              <div>
                <div className="font-sora text-[16px] font-bold text-white">
                  Notary Day
                </div>
                <div className="text-[11px] text-white/60">
                  {invoice.invoice_number ?? invoice.id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/50">Status</div>
                <span className={cn("chip mt-1", CHIP[status])}>
                  {status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="g2 mb-3">
                <div>
                  <div className="text-[9px] font-semibold text-slate-secondary uppercase mb-1">
                    Bill to
                  </div>
                  <div className="text-[13px] font-semibold text-navy">
                    {client}
                  </div>
                  <div className="text-[11px] text-slate-secondary leading-relaxed">
                    {invoice.recipient_email ?? ""}
                    {invoice.job?.address && (
                      <>
                        <br />
                        {invoice.job.address}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-secondary">Amount</div>
                  <div className="font-sora text-[20px] font-bold text-navy">
                    {formatCurrency(invoice.total)}
                  </div>
                </div>
              </div>

              <div className="h-px bg-border my-3" />

              {/* Line items: fee - mileage - platform = net */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-secondary">Signing fee</span>
                  <span className="font-semibold text-navy">
                    {formatCurrency(fee)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-secondary">Mileage cost</span>
                  <span className="font-semibold text-amber">
                    −{formatCurrency(mileage)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-secondary">Platform fee</span>
                  <span className="font-semibold text-amber">
                    −{formatCurrency(platform)}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] pt-1.5 border-t border-border">
                  <span className="font-semibold text-navy">Net earnings</span>
                  <span className="font-bold text-teal">
                    {formatCurrency(net)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total (navy) */}
            <div className="bg-navy px-[18px] py-3 flex justify-between items-center">
              <span className="text-[12px] text-white/70">Total due</span>
              <span className="font-sora text-[18px] font-bold text-white">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>

          {/* Payment info */}
          <div className="mt-4 p-3 bg-blue-bg border border-blue-border rounded-[8px] flex gap-2">
            <DollarSign className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue leading-relaxed">
              Your payment details (Zelle, Venmo, PayPal.me, or bank info from
              Settings) appear on the invoice PDF. {client} pays you directly —
              Notary Day is not involved in the transaction.
            </div>
          </div>

          {/* Payment history */}
          <div className="mt-4 p-3 bg-background rounded-[8px]">
            <div className="text-[11px] text-slate-secondary mb-1">
              Payment history
            </div>
            {status === "paid" ? (
              <div className="text-[12px] text-teal font-semibold">
                Paid{invoice.paid_at ? ` on ${fmtLongDate(invoice.paid_at)}` : ""}
                {invoice.payment_method_used
                  ? ` via ${invoice.payment_method_used}`
                  : ""}
              </div>
            ) : (
              <>
                <div className="text-[12px] text-amber">Awaiting payment</div>
                {invoice.recipient_email && (
                  <div className="text-[11px] text-slate-secondary mt-0.5">
                    Sent to {invoice.recipient_email}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="modal-foot">
          {status !== "paid" && (
            <button
              className="btn-teal"
              disabled={isMarking}
              onClick={onMarkPaid}
            >
              <Check className="w-4 h-4" /> Mark as paid
            </button>
          )}
          {status !== "paid" && (
            <button className="btn-sm w-full !h-11" onClick={onResend}>
              <Mail className="w-3.5 h-3.5" /> Resend invoice
            </button>
          )}
          <button className="btn-p" onClick={onDownload}>
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="btn-gh" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
