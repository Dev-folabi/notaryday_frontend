"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  ScanLine,
  Pencil,
  Trash2,
  Phone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useJob, useUpdateJobStatus, useDeleteJob } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import type { Job, JobStatus } from "@/types/job";
import {
  formatTime,
  formatDate,
  formatCurrency,
  openNavigation,
  errMsg,
} from "@/lib/utils";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { invoicesApi } from "@/api/invoices.api";
import { unwrap } from "@/lib/utils";

function typeLabel(signingType: string): string {
  const t = signingType.toUpperCase();
  if (t === "LOAN_REFI") return "Loan Refi";
  if (t === "GENERAL") return "General";
  if (t === "HYBRID") return "Hybrid";
  if (t === "PURCHASE_CLOSING") return "Purchase Closing";
  if (t === "FIELD_INSPECTION") return "Field Inspection";
  if (t === "APOSTILLE") return "Apostille";
  return signingType;
}

function typeKey(signingType: string): "gen" | "loan" | "hyb" {
  const t = signingType.toUpperCase();
  if (t === "LOAN_REFI" || t === "PURCHASE_CLOSING") return "loan";
  if (t === "HYBRID") return "hyb";
  return "gen";
}

function typeChipClass(typeKey: string): string {
  if (typeKey === "loan") return "bg-blue-100 text-blue-700";
  if (typeKey === "hyb") return "bg-violet-100 text-violet-700";
  return "bg-emerald-100 text-emerald-800";
}

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError } = useJob(id ?? "");
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();
  const { addToast, closeCITT } = useUIStore();
  const { user } = useAuth();
  const [showDelete, setShowDelete] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(false);

  const viewInvoice = async () => {
    try {
      setViewingInvoice(true);
      const res = await invoicesApi.list();
      const invoices = (unwrap<any[]>(res) ?? []) as any[];
      const inv = invoices.find((i) => i.job_id === job?.id);
      if (inv) {
        router.push(`/invoices?focus=${inv.id}`);
      } else {
        router.push(`/invoices/new?jobId=${job?.id}`);
      }
    } catch {
      router.push(`/invoices/new?jobId=${job?.id}`);
    } finally {
      setViewingInvoice(false);
    }
  };

  const handleStatus = (status: JobStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          if (status === "IN_PROGRESS") {
            addToast({ type: "success", title: "Signing started" });
            router.push(`/active`);
          } else if (status === "COMPLETE") {
            addToast({ type: "success", title: "Job complete" });
            router.push(`/invoices/new?jobId=${id}`);
          } else {
            addToast({ type: "success", title: "Job updated" });
          }
        },
        onError: (err) =>
          addToast({
            type: "error",
            title: "Couldn't update job",
            message: errMsg(err),
          }),
      },
    );
  };

  const handleDelete = () => {
    deleteJob.mutate(id, {
      onSuccess: () => {
        addToast({ type: "success", title: "Job removed, route recalculated" });
        router.push("/jobs");
      },
      onError: (err) => {
        setShowDelete(false);
        addToast({
          type: "error",
          title: "Couldn't delete job",
          message: errMsg(err),
        });
      },
    });
  };

  const navApp = (user?.settings?.preferred_nav_app ?? "GOOGLE_MAPS").toLowerCase() as
    | "google"
    | "apple"
    | "waze";

  if (isLoading) {
    return (
      <div className="con" style={{ padding: 24, textAlign: "center", color: "#64748B", fontSize: 12 }}>
        Loading job…
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="con" style={{ padding: 24, textAlign: "center", color: "#C0392B", fontSize: 12 }}>
        Job not found.
        <div style={{ marginTop: 12 }}>
          <button className="btn-s" onClick={() => router.push("/jobs")}>
            Back to My Jobs
          </button>
        </div>
      </div>
    );
  }

  const net = parseFloat(job.net_earnings ?? "0") || 0;
  const mileageCost = parseFloat(job.mileage_cost ?? "0") || 0;
  const miles = parseFloat(job.mileage_miles ?? "0") || 0;
  const fee = parseFloat(job.fee ?? "0") || 0;
  const platformFee = parseFloat(job.platform_fee ?? "0") || 0;
  const irsRate = parseFloat(String(user?.settings?.irs_rate_per_mile ?? 0.67)) || 0.67;
  const needsScanback = job.scanback_duration_mins > 0;
  const tk = typeKey(job.signing_type);
  const isActive = job.status === "IN_PROGRESS" || job.status === "SCANNING";
  const isCompleted = job.status === "COMPLETE" || job.status === "CANCELLED";

  return (
    <>
      <div className="ph" style={{ alignItems: "center" }}>
        <button className="ph-back" onClick={() => router.push("/jobs")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="ph-title">Job detail</div>
        <div style={{ minWidth: 44 }} />
      </div>

      <div className="con">
        {/* Header card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "#EFF6FF",
                    color: "#2563EB",
                    display: "inline-flex",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  <Clock className="w-3 h-3" /> {job.status.replace(/_/g, " ").toLowerCase()}
                </span>
                <span className={`chip ${typeChipClass(tk)}`}>{typeLabel(job.signing_type)}</span>
                <span className="chip c-plat">{job.platform_name || "Direct"}</span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0F2C4E",
                  marginBottom: 4,
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <Clock className="w-3 h-3" />
                {formatTime(job.appointment_time)} - {job.signing_duration_mins} min
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#475569",
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  lineHeight: 1.3,
                }}
              >
                <MapPin className="w-3 h-3 flex-shrink-0" /> {job.address}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0E7B6C",
                }}
              >
                {formatCurrency(fee)}
              </div>
              <div style={{ fontSize: 9, color: "#64748B" }}>offered fee</div>
            </div>
          </div>
          <button
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              background: "#0F2C4E",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() => openNavigation(job.address, navApp)}
          >
            <Navigation className="w-4 h-4" /> Navigate to address
          </button>
        </div>

        {/* Net earnings breakdown */}
        <span className="slbl">Net earnings</span>
        <div className="em" style={{ marginBottom: 16 }}>
          <div className="em-c">
            <span className="em-l">Offered fee</span>
            <span className="em-v" style={{ color: "#475569" }}>
              {formatCurrency(fee)}
            </span>
          </div>
          <div className="em-c" style={{ borderLeft: "1px solid #E2E8F0" }}>
            <span className="em-l">Mileage cost</span>
            <span className="em-v" style={{ color: "#D97706" }}>
              -{formatCurrency(mileageCost)}
            </span>
            <span style={{ fontSize: 9, color: "#64748B", display: "block", marginTop: 2 }}>
              {miles.toFixed(1)} mi x ${irsRate.toFixed(2)}
            </span>
          </div>
          <div className="em-c" style={{ borderLeft: "1px solid #E2E8F0" }}>
            <span className="em-l">Net earnings</span>
            <span className="em-v" style={{ color: "#0E7B6C" }}>
              {formatCurrency(net)}
            </span>
          </div>
        </div>

        {/* Details */}
        <span className="slbl">Details</span>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 10,
            padding: "0 12px",
            marginBottom: 16,
          }}
        >
          {[
            ["Client", job.client_name || "—"],
            ["Phone", job.client_phone || "(555) 555-0000"],
            ["Status", job.status.replace(/_/g, " ").toLowerCase()],
            ["Platform", job.platform_name || "Direct"],
            ["Date", formatDate(job.appointment_time)],
            ["Start time", formatTime(job.appointment_time)],
            ["Duration", `${job.signing_duration_mins} minutes`],
            [
              "Scanback",
              needsScanback
                ? `${job.scanback_duration_mins} min auto blocked`
                : "None",
            ],
          ].map(([l, v], i) => (
            <div
              key={l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: i < 7 ? "1px solid #E2E8F0" : "none",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500, width: 90, flexShrink: 0 }}>
                {l}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#0F2C4E",
                  fontWeight: 500,
                  textAlign: "right",
                  flex: 1,
                  display: "flex",
                  gap: 6,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                {l === "Phone" && <Phone className="w-3 h-3" />}
                {v}
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        <span className="slbl">Notes</span>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            color: "#475569",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          {job.notes || "No notes"}
        </div>

        {/* Scanback info */}
        {needsScanback && (
          <div
            style={{
              background: "#FFFBEB",
              borderLeft: "3px solid #D97706",
              borderRadius: "0 10px 10px 0",
              padding: "10px 12px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: "#D97706" }}>
                <ScanLine className="w-4 h-4" />
              </span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#D97706" }}>
                  Scanback auto blocked
                </div>
                <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>
                  {job.scanback_ends_at
                    ? `${formatTime(job.scanback_ends_at)} - ${job.scanback_duration_mins} min`
                    : `After this signing - ${job.scanback_duration_mins} min`}
                </div>
              </div>
            </div>
            <span style={{ fontSize: 10, color: "#D97706", fontStyle: "italic" }}>
              After this signing
            </span>
          </div>
        )}

        {/* Status actions */}
        {!isCompleted && !isActive && (
          <>
            <button
              className="btn-p"
              style={{ background: "#0E7B6C", marginBottom: 8 }}
              onClick={() => handleStatus("IN_PROGRESS")}
              disabled={updateStatus.isPending}
            >
              <Clock className="w-4 h-4" /> Start Signing
            </button>
          </>
        )}
        {job.status === "IN_PROGRESS" && (
          <button
            className="btn-p"
            style={{ background: "#D97706", marginBottom: 8 }}
            onClick={() => router.push("/active")}
          >
            <ScanLine className="w-4 h-4" /> Go to Active Signing
          </button>
        )}
        {job.status === "SCANNING" && (
          <button
            className="btn-p"
            style={{ background: "#D97706", marginBottom: 8 }}
            onClick={() => router.push("/active")}
          >
            <ScanLine className="w-4 h-4" /> Go to Active Signing
          </button>
        )}
        {job.status === "COMPLETE" && (
          <button
            className="btn-p"
            style={{ background: "#0E7B6C", marginBottom: 8 }}
            onClick={viewInvoice}
            disabled={viewingInvoice}
          >
            {viewingInvoice ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Loading invoice…
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" /> View invoice
              </>
            )}
          </button>
        )}

        {/* Edit + Delete */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            className="btn-s"
            style={{ flex: 1 }}
            onClick={() => router.push(`/jobs/${job.id}/edit`)}
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            className="btn-gh"
            style={{ flex: 1, color: "#C0392B", borderColor: "#F1C7C2" }}
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="w-4 h-4" /> Delete job
          </button>
        </div>

        {isActive && (
          <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginTop: 6 }}>
            Active signing lets you update progress step by step: navigated, started,
            signing done, scanback, complete. When done, you will be taken to send invoice.
          </div>
        )}
        {isCompleted && (
          <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginTop: 6 }}>
            This job is marked as {job.status.toLowerCase().replace(/_/g, " ")}. You can
            edit details or delete it. To create an invoice, go to Invoices tab.
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showDelete && (
        <div className="modal-overlay" style={{ display: "flex" }}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ padding: "24px 20px 0", textAlign: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#FEF2F2",
                  border: "1px solid #F1C7C2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  color: "#C0392B",
                }}
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <div style={{ fontFamily: "Sora, sans-serif", fontSize: 17, fontWeight: 700, color: "#0F2C4E" }}>
                Remove this job
              </div>
            </div>
            <div style={{ padding: "14px 20px" }}>
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0F2C4E" }}>
                    {typeLabel(job.signing_type)} - {formatTime(job.appointment_time)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0E7B6C" }}>
                    {formatCurrency(fee)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>{job.address}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span className={`chip ${typeChipClass(tk)}`}>{typeLabel(job.signing_type)}</span>
                  <span className="chip c-plat">{job.platform_name || "Direct"}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, marginBottom: 12 }}>
                This job and its scanback block will be removed. Your route and earnings
                for this day recalculate immediately.
              </p>
              <div className="alert al-blue">
                <AlertTriangle className="w-4 h-4" />
                <span style={{ fontSize: 11, lineHeight: 1.4 }}>
                  Jobs are retained for 30 days before permanent deletion, you can recover
                  it from Settings.
                </span>
              </div>
            </div>
            <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleteJob.isPending}
              >
                <Trash2 className="w-4 h-4" /> Yes, remove job
              </button>
              <button className="btn-gh" onClick={() => setShowDelete(false)}>
                Cancel, keep job
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
