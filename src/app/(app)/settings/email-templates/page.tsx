"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { Mail, RotateCcw, Save, Eye, Edit2 } from "lucide-react";
import api from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  appointment_reminder: "Appointment Reminder",
  invoice: "Invoice",
  booking_confirmation: "Booking Confirmation",
  booking_declined: "Booking Declined",
  client_eta: "Client ETA",
};

const VARIABLES: Record<string, string[]> = {
  appointment_reminder: [
    "client_name",
    "appointment_time",
    "address",
    "notary_name",
  ],
  invoice: [
    "client_name",
    "invoice_number",
    "total",
    "service_type",
    "address",
    "date",
    "notary_name",
    "payment_info",
  ],
  booking_confirmation: [
    "client_name",
    "date",
    "appointment_time",
    "address",
    "service_type",
    "notary_name",
  ],
  booking_declined: ["client_name", "notary_name", "alternative_times"],
  client_eta: ["client_name", "notary_name", "eta_time"],
};

export default function EmailTemplatesPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [activeType, setActiveType] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [preview, setPreview] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const res = await api.get("/email-templates");
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any[];
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({
      id,
      subject,
      body,
    }: {
      id: string;
      subject: string;
      body: string;
    }) => {
      await api.patch(`/email-templates/${id}`, { subject, body });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-templates"] });
      addToast({ type: "success", title: "Template saved" });
      setActiveType(null);
    },
  });

  const resetTemplate = useMutation({
    mutationFn: async (type: string) => {
      await api.post(`/email-templates/${type}/reset`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-templates"] });
      addToast({ type: "success", title: "Reset to default" });
      setActiveType(null);
    },
  });

  const activeTemplate = templates.find((t: any) => t.type === activeType);

  const startEdit = (template: any) => {
    setActiveType(template.type);
    setEditSubject(template.subject);
    setEditBody(template.body);
    setPreview(false);
  };

  const renderPreview = (html: string) => {
    let rendered = html;
    const sampleVars: Record<string, string> = {
      client_name: "Marcus Johnson",
      notary_name: "Sarah Mitchell",
      appointment_time: "2:00 PM",
      address: "2201 E Century Blvd, Inglewood, CA",
      date: "March 20, 2026",
      service_type: "Hybrid Signing",
      invoice_number: "INV-2026-0047",
      total: "145.00",
      payment_info: "Zelle: sarah@email.com",
      eta_time: "2:15 PM",
      alternative_times:
        "<li>March 21 at 10:00 AM</li><li>March 22 at 3:00 PM</li>",
    };
    for (const [key, value] of Object.entries(sampleVars)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    return rendered;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-8 py-4 bg-white border-b border-border flex items-center gap-3 flex-shrink-0">
        <Mail className="w-5 h-5 text-primary-navy" />
        <div>
          <h1 className="font-sora font-bold text-xl text-primary-navy">
            Email Templates
          </h1>
          <p className="font-inter text-xs text-slate-secondary">
            Customize emails sent to your clients
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          </div>
        ) : activeType && activeTemplate ? (
          /* EDIT VIEW */
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setActiveType(null)}
                className="font-inter text-xs text-interactive-blue"
              >
                ← Back to templates
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(!preview)}
                  className={cn(
                    "h-8 px-3 rounded-8px font-inter text-xs font-medium border flex items-center gap-1.5",
                    preview
                      ? "border-primary-navy bg-blue-bg text-primary-navy"
                      : "border-border text-slate-secondary",
                  )}
                >
                  <Eye className="w-3.5 h-3.5" />{" "}
                  {preview ? "Editing" : "Preview"}
                </button>
                <button
                  onClick={() => resetTemplate.mutate(activeType)}
                  className="h-8 px-3 rounded-8px font-inter text-xs font-medium border border-border text-slate-secondary flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            <div className="bg-white border border-border rounded-12px overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border">
                <div className="font-inter text-sm font-semibold text-primary-navy mb-1">
                  {TYPE_LABELS[activeType]}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(VARIABLES[activeType] ?? []).map((v) => (
                    <span
                      key={v}
                      className="font-mono text-[10px] bg-blue-bg text-interactive-blue px-1.5 py-0.5 rounded cursor-pointer"
                      onClick={() => {
                        setEditBody(editBody + `{{${v}}}`);
                      }}
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>

              {preview ? (
                /* Preview */
                <div className="p-5">
                  <div className="font-inter text-xs text-slate-secondary mb-1">
                    Subject:
                  </div>
                  <div className="font-inter text-sm font-semibold text-primary-navy mb-4">
                    {renderPreview(editSubject)}
                  </div>
                  <div className="font-inter text-xs text-slate-secondary mb-1">
                    Body:
                  </div>
                  <div
                    className="prose prose-sm max-w-none border border-border rounded-8px p-4"
                    dangerouslySetInnerHTML={{
                      __html: renderPreview(editBody),
                    }}
                  />
                </div>
              ) : (
                /* Edit */
                <div className="p-5 space-y-4">
                  <div>
                    <label className="font-inter text-xs font-medium text-slate-body block mb-1.5">
                      Subject line
                    </label>
                    <input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full h-10 border border-border rounded-8px px-3 font-inter text-sm focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-inter text-xs font-medium text-slate-body block mb-1.5">
                      Email body (HTML)
                    </label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={12}
                      className="w-full border border-border rounded-8px p-3 font-mono text-xs leading-relaxed resize-y focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Save */}
              <div className="px-5 py-4 border-t border-border bg-bg">
                <button
                  onClick={() =>
                    updateTemplate.mutate({
                      id: activeTemplate.id,
                      subject: editSubject,
                      body: editBody,
                    })
                  }
                  disabled={updateTemplate.isPending}
                  className="h-10 px-5 bg-primary-navy text-white rounded-8px font-inter text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />{" "}
                  {updateTemplate.isPending ? "Saving..." : "Save template"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="max-w-2xl mx-auto space-y-3">
            {templates.map((t: any) => (
              <div
                key={t.id}
                className="bg-white border border-border rounded-12px p-4 flex items-center justify-between hover:border-slate-secondary transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-8px bg-blue-bg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-interactive-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-inter text-sm font-semibold text-primary-navy">
                      {t.name}
                    </div>
                    <div className="font-inter text-xs text-slate-secondary truncate">
                      {t.subject}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      "font-inter text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                      t.is_active
                        ? "bg-teal-bg text-teal-success"
                        : "bg-slate-100 text-slate-secondary",
                    )}
                  >
                    {t.is_active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => startEdit(t)}
                    className="w-8 h-8 rounded-8px border border-border flex items-center justify-center text-slate-secondary hover:text-primary-navy hover:border-primary-navy transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
