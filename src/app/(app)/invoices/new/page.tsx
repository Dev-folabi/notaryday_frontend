"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, FileText, AlertTriangle, Send, X } from "lucide-react";
import { invoicesApi } from "@/api/invoices.api";
import { useJobs } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, unwrap, errMsg } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  invoice_number?: string;
  recipient_name?: string | null;
  recipient_email?: string | null;
  total: number;
  is_paid: boolean;
  sent_at?: string | null;
  job_id?: string;
  job?: { address?: string; signing_type?: string; fee?: number };
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
      const res = await (
        await import("@/api/jobs.api")
      ).jobsApi.list({ status: "COMPLETE" });
      return unwrap<any[]>(res) ?? [];
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

  const invoicedJobIds = useMemo(
    () => new Set(invoices.map((i) => i.job_id).filter(Boolean) as string[]),
    [invoices],
  );

  const generate = useMutation({
    mutationFn: (jid: string) => invoicesApi.generate(jid),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      const inv = res?.data ?? res;
      addToast({ type: "success", title: "Invoice generated" });
      router.push(`/invoices?focus=${inv?.id ?? ""}`);
    },
    onError: (err) =>
      addToast({
        type: "error",
        title: "Couldn't create invoice",
        message: errMsg(err),
      }),
  });

  const completeJobs = jobs.filter((j) => j.status === "COMPLETE");

  const selectedJob = jobId
    ? completeJobs.find((j) => j.id === jobId)
    : null;
  const alreadyInvoiced = selectedJob
    ? invoicedJobIds.has(selectedJob.id)
    : false;

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
            <div
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
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
                const hasInv = invoicedJobIds.has(j.id);
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
                        {hasInv && (
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
          <>
            <div
              className="bg-white border border-border rounded-[12px] p-4 mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-navy" />
                <span className="font-sora text-[15px] font-bold text-navy">
                  Invoice draft
                </span>
              </div>
              <div className="text-[12px] text-slate-secondary">
                {selectedJob.address}
              </div>
              <div className="text-[12px] text-slate-secondary mt-0.5">
                {selectedJob.client_name || "Client"} · Fee{" "}
                {formatCurrency(selectedJob.fee ?? 0)}
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3">
                <span className="text-[12px] text-slate-secondary">
                  Total due
                </span>
                <span className="font-sora text-[18px] font-bold text-navy">
                  {formatCurrency(selectedJob.fee ?? 0)}
                </span>
              </div>
            </div>

            {alreadyInvoiced && (
              <div
                className="flex gap-2 items-start p-3 mb-3 rounded-[8px]"
                style={{
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                }}
              >
                <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber leading-relaxed">
                  An invoice already exists for this job. Creating another will
                  generate a separate invoice.
                </div>
              </div>
            )}

            <button
              className="btn-p w-full"
              disabled={generate.isPending}
              onClick={() => generate.mutate(selectedJob.id)}
            >
              <Send className="w-4 h-4" />
              {generate.isPending ? "Generating…" : "Generate & send invoice"}
            </button>
          </>
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
