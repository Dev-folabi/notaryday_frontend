"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailImportApi, screenshotApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { Mail, Upload, Check, Copy, FileImage } from "lucide-react";
import ProGate from "@/components/ui/ProGate";

export default function ImportPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [importEmail] = useState("import@notaryday.app");

  const { data: imports = [], isLoading } = useQuery({
    queryKey: ["email-imports"],
    queryFn: async () => {
      const res = await emailImportApi.list();
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any[];
    },
  });

  const confirmImport = useMutation({
    mutationFn: (id: string) => emailImportApi.confirm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-imports"] });
      addToast({
        type: "success",
        title: "Job added to schedule",
      });
    },
    onError: () => addToast({ type: "error", title: "Could not add job" }),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await screenshotApi.upload(file);
      addToast({
        type: "success",
        title: "Screenshot uploaded — parsing...",
      });
      qc.invalidateQueries({ queryKey: ["email-imports"] });
    } catch {
      addToast({ type: "error", title: "Upload failed" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(importEmail);
    addToast({ type: "success", title: "Copied import address" });
  };

  return (
    <ProGate feature="Email import">
      <div className="flex flex-col h-full">
        <div className="ph">
          <div className="ph-title">Email Import</div>
        </div>

        <div className="con">
          <div className="alert al-blue mb-4 flex-col items-start">
            <div className="flex gap-2 w-full">
              <Mail className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-inter text-[12px] font-semibold mb-1">
                  Forward any Snapdocs or SigningOrder email to your import address
                </div>
                <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mb-2">
                  Notary Day reads it automatically and runs a CITT check. No
                  manual entry needed. The job appears here for your review before
                  it is added to your schedule.
                </div>
              </div>
            </div>
            <div
              className="w-full font-mono text-[12px] text-teal-success bg-[#0d1117] rounded-[8px] p-[10px_12px] flex justify-between items-center gap-2 border border-[#1e293b] flex-wrap"
              style={{ color: "#4ade80" }}
            >
              <span className="break-all">{importEmail}</span>
              <button
                onClick={copyEmail}
                className="bg-white/10 border border-white/20 rounded-[5px] py-1 px-2.5 font-inter text-[10px] flex items-center gap-1 flex-shrink-0"
                style={{ color: "#4ade80" }}
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
            </div>
          ) : imports.length === 0 ? (
            <div className="empty-box">
              <FileImage className="w-10 h-10 text-slate-secondary mx-auto mb-3" />
              <p className="font-inter text-sm text-slate-secondary mb-1">
                No imports yet.
              </p>
              <p className="font-inter text-[12px] text-muted mb-4">
                Forward an email or upload a screenshot to get started.
              </p>
              <label className="btn-sm inline-flex cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Uploading..." : "Upload screenshot"}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          ) : (
            <>
              <span className="slbl">Latest imports</span>
              <div className="flex flex-col gap-2 mb-4">
                {imports.map((imp: any) => (
                  <div key={imp.id} className="card p-3 flex gap-2.5">
                    <div className="w-9 h-9 rounded-[8px] bg-blue-bg text-blue flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-inter text-[12px] font-semibold text-primary-navy mb-0.5">
                        New job imported from {imp.from_address ?? imp.platform}
                      </div>
                      <div className="font-inter text-[11px] text-slate-secondary mb-1.5 leading-[1.3] break-words">
                        {imp.parsed_address ?? "—"} ·{" "}
                        {imp.parsed_date ? imp.parsed_date : "—"}
                        {imp.parsed_time ? ` · ${imp.parsed_time}` : ""}
                        {imp.parsed_fee
                          ? ` · nets $${imp.net_earnings ?? imp.parsed_fee} after mileage`
                          : ""}
                      </div>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        <span className="chip c-imported">
                          <Check className="w-3 h-3" /> Parsed successfully
                        </span>
                        {imp.citt_verdict && (
                          <span
                            className="chip"
                            style={{
                              background: "var(--amber-bg)",
                              color: "var(--amber)",
                              border: "1px solid var(--amber-b)",
                            }}
                          >
                            CITT: {imp.citt_verdict}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => confirmImport.mutate(imp.id)}
                          disabled={confirmImport.isPending}
                          className="btn-p"
                          style={{ width: "auto", height: 32, fontSize: 11, padding: "0 12px" }}
                        >
                          {confirmImport.isPending ? "Adding..." : "Add to schedule"}
                        </button>
                        <button
                          onClick={() =>
                            addToast({ type: "info", title: "Declined" })
                          }
                          className="btn-gh"
                          style={{ width: "auto", height: 32 }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <span className="slbl">How it works</span>
              <div className="card p-3.5">
                <div className="font-inter text-[12px] text-slate-secondary leading-[1.5]">
                  1. Forward confirmation email to your unique address
                  <br />
                  2. AI extracts address, date, time, fee, client name
                  <br />
                  3. CITT check runs automatically
                  <br />
                  4. You review and add to schedule in one tap
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProGate>
  );
}
