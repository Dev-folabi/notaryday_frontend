"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailImportApi, screenshotApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  Mail,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileImage,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-slate-100 text-slate-secondary",
  PROCESSING: "bg-amber-bg text-amber-warning",
  COMPLETE: "bg-teal-bg text-teal-success",
  FAILED: "bg-red-danger/10 text-red-danger",
};

export default function ImportPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

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
      addToast({ type: "success", title: "Job added to schedule" });
    },
  });

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [addToast, qc],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-sora font-bold text-xl text-primary-navy">
            Import Jobs
          </h1>
          <p className="font-inter text-xs text-slate-secondary mt-0.5">
            Forward emails or upload screenshots
          </p>
        </div>
        <label
          className={cn(
            "inline-flex items-center gap-2 bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-11 px-5 cursor-pointer",
            uploading && "opacity-50",
          )}
        >
          <Upload className="w-4 h-4" />
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

      {/* Email address info */}
      <div className="px-4 lg:px-8 py-3 bg-blue-bg border-b border-border">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-interactive-blue" />
          <span className="font-inter text-xs text-primary-navy">
            Forward confirmation emails to:{" "}
          </span>
          <code className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-border text-interactive-blue">
            import@notaryday.app
          </code>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : imports.length === 0 ? (
          <div className="bg-white border border-border rounded-14px p-8 text-center">
            <FileImage className="w-10 h-10 text-slate-secondary mx-auto mb-3" />
            <p className="font-inter text-sm text-slate-secondary">
              No imports yet. Forward an email or upload a screenshot to get
              started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {imports.map((imp: any) => (
              <div
                key={imp.id}
                className="bg-white border border-border rounded-12px p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-inter text-sm font-semibold text-primary-navy truncate">
                        {imp.subject ?? imp.from_address}
                      </span>
                      <span
                        className={cn(
                          "font-inter text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                          STATUS_COLORS[imp.status],
                        )}
                      >
                        {imp.status}
                      </span>
                    </div>
                    <div className="font-inter text-xs text-slate-secondary flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(imp.received_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>

                {/* Parsed fields */}
                {imp.status === "COMPLETE" && imp.parsed_address && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                      {imp.parsed_address && (
                        <div>
                          <span className="text-slate-secondary">Address:</span>{" "}
                          <span className="text-primary-navy font-medium">
                            {imp.parsed_address}
                          </span>
                        </div>
                      )}
                      {imp.parsed_fee && (
                        <div>
                          <span className="text-slate-secondary">Fee:</span>{" "}
                          <span className="text-primary-navy font-medium">
                            ${imp.parsed_fee}
                          </span>
                        </div>
                      )}
                      {imp.parsed_signing_type && (
                        <div>
                          <span className="text-slate-secondary">Type:</span>{" "}
                          <span className="text-primary-navy font-medium">
                            {imp.parsed_signing_type}
                          </span>
                        </div>
                      )}
                      {imp.parsed_platform_name && (
                        <div>
                          <span className="text-slate-secondary">
                            Platform:
                          </span>{" "}
                          <span className="text-primary-navy font-medium">
                            {imp.parsed_platform_name}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => confirmImport.mutate(imp.id)}
                      className="h-9 px-4 bg-teal-success text-white rounded-8px font-inter text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & add to
                      schedule
                    </button>
                  </div>
                )}

                {imp.status === "FAILED" && (
                  <div className="mt-2 pt-2 border-t border-border flex items-center gap-2 text-xs text-red-danger">
                    <AlertCircle className="w-3.5 h-3.5" />{" "}
                    {imp.error_message ??
                      "Parsing failed — please add manually"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
