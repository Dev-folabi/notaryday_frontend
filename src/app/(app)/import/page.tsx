"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobImportApi } from "@/api/booking.api";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { importEmailFor, unwrap } from "@/lib/utils";
import { Mail, Upload, Check, Copy, FileImage, Camera, Loader2 } from "lucide-react";
import ProGate from "@/components/ui/ProGate";
import { ImportReviewModal } from "@/components/jobs/ImportReviewModal";
import { ImportEditModal } from "@/components/jobs/ImportEditModal";
import type { JobImport, ImportConfirmOverrides } from "@/types/import";

const PENDING_STATUSES = ["QUEUED", "PROCESSING"];

function isPending(imp: JobImport | null | undefined): boolean {
  return !!imp && PENDING_STATUSES.includes(imp.status);
}

/**
 * Deep link from the "import ready" email (…/import?review=<id>). Opens the
 * review modal for that specific import. Kept tiny + wrapped in Suspense so
 * useSearchParams doesn't force the whole page to suspend.
 */
function ReviewDeepLink({
  onOpen,
}: {
  onOpen: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("review");
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (reviewId && handledRef.current !== reviewId) {
      handledRef.current = reviewId;
      onOpen(reviewId);
    }
  }, [reviewId, onOpen]);

  return null;
}

export default function ImportPage() {
  const { addToast } = useUIStore();
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [reviewing, setReviewing] = useState<JobImport | null>(null);
  const [modalView, setModalView] = useState<"review" | "edit">("review");
  const [overrides, setOverrides] = useState<ImportConfirmOverrides>({});
  const importEmail = importEmailFor(user?.username);

  const { data: imports = [], isLoading } = useQuery({
    queryKey: ["imports"],
    queryFn: async () => unwrap<JobImport[]>(await jobImportApi.list()),
    // Poll while any import is still queued/processing so the list reflects
    // the backend parse finishing without a manual refresh.
    refetchInterval: (query) => {
      const data = query.state.data as JobImport[] | undefined;
      return data?.some(isPending) ? 3000 : false;
    },
  });

  const confirmImport = useMutation({
    mutationFn: ({
      id,
      overrides: o,
    }: {
      id: string;
      overrides: ImportConfirmOverrides;
    }) => jobImportApi.confirm(id, o),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["imports"] });
      addToast({ type: "success", title: "Job added to schedule" });
      setReviewing(null);
      router.push("/jobs");
    },
    onError: () => addToast({ type: "error", title: "Could not add job" }),
  });

  const declineImport = useMutation({
    mutationFn: (id: string) => jobImportApi.decline(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["imports"] });
      addToast({ type: "success", title: "Import declined" });
      setReviewing(null);
    },
    onError: () => addToast({ type: "error", title: "Could not decline import" }),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await jobImportApi.upload(file);
      addToast({
        type: "success",
        title: "Screenshot uploaded, parsing...",
      });
      qc.invalidateQueries({ queryKey: ["imports"] });
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

  const openReview = async (imp: JobImport) => {
    setOverrides({});
    setModalView("review");
    setReviewing(imp);
    try {
      const fresh = unwrap<JobImport>(await jobImportApi.get(imp.id));
      setReviewing(fresh);
    } catch {
      // keep the row we already had
    }
  };

  const openReviewById = useCallback(
    (id: string) => {
      setOverrides({});
      setModalView("review");
      jobImportApi
        .get(id)
        .then((res) => {
          const imp = unwrap<JobImport>(res);
          setReviewing(imp);
          qc.invalidateQueries({ queryKey: ["imports"] });
        })
        .catch(() => {
          addToast({ type: "error", title: "Could not load that import" });
        });
    },
    [qc, addToast],
  );

  const reviewingId = reviewing?.id;
  const reviewingPending = isPending(reviewing);

  // While the reviewed import is still being parsed, poll the backend until
  // it finishes (or fails) and live-update the review modal.
  useEffect(() => {
    if (!reviewingPending || !reviewingId) return;
    let stopped = false;
    const timer = setInterval(async () => {
      try {
        const fresh = unwrap<JobImport>(await jobImportApi.get(reviewingId));
        if (stopped) return;
        setReviewing(fresh);
        if (!isPending(fresh)) {
          clearInterval(timer);
          qc.invalidateQueries({ queryKey: ["imports"] });
        }
      } catch {
        // transient failure; keep polling
      }
    }, 2000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [reviewingId, reviewingPending, qc]);

  const openEdit = () => setModalView("edit");

  const handleSaveEdits = (o: ImportConfirmOverrides) => {
    setOverrides(o);
    addToast({ type: "info", title: "Fields updated, running CITT again" });
    setModalView("review");
  };

  return (
    <ProGate feature="Job import">
      <Suspense fallback={null}>
        <ReviewDeepLink onOpen={openReviewById} />
      </Suspense>
      <div className="flex flex-col h-full">
        <div className="ph">
          <div className="ph-title">Job Import</div>
        </div>

        <div className="con">
          <div className="alert al-blue mb-4 flex-col items-start">
            <div className="flex gap-2 w-full">
              <Mail className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-inter text-[12px] font-semibold mb-1">
                  Forward any Snapdocs or SigningOrder email to your import
                  address
                </div>
                <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mb-2">
                  Notary Day reads it automatically and runs a CITT check. No
                  manual entry needed. The job appears here for your review
                  before it is added to your schedule.
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

          <div className="card p-3.5 mb-4">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-[8px] bg-blue-bg text-blue flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-inter text-[12px] font-semibold text-primary-navy mb-0.5">
                  Import from a screenshot
                </div>
                <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mb-2">
                  Upload a screenshot of a signing order and Notary Day will
                  extract the details for review.
                </div>
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
              <p className="font-inter text-[12px] text-muted">
                Forward an email or upload a screenshot to get started.
              </p>
            </div>
          ) : (
            <>
              <span className="slbl">Latest imports</span>
              <div className="flex flex-col gap-2 mb-4">
                {imports.map((imp) => (
                  <div key={imp.id} className="card p-3 flex gap-2.5">
                    <div className="w-9 h-9 rounded-[8px] bg-blue-bg text-blue flex items-center justify-center flex-shrink-0">
                      {imp.import_type === "EMAIL" ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-inter text-[12px] font-semibold text-primary-navy mb-0.5">
                        New job imported from{" "}
                        {imp.parsed_platform_name ??
                          imp.from_address ??
                          "import"}
                      </div>
                      <div className="font-inter text-[11px] text-slate-secondary mb-1.5 leading-[1.3] break-words">
                        {imp.parsed_address ?? "—"}
                        {imp.parsed_appointment_time
                          ? ` · ${new Date(
                              imp.parsed_appointment_time,
                            ).toLocaleDateString()} ${new Date(
                              imp.parsed_appointment_time,
                            ).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}`
                          : ""}
                        {imp.parsed_fee
                          ? ` · nets $${Number(imp.parsed_fee).toFixed(2)}`
                          : ""}
                      </div>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {imp.status === "COMPLETE" && (
                          <span className="chip c-imported">
                            <Check className="w-3 h-3" /> Parsed successfully
                          </span>
                        )}
                        {isPending(imp) && (
                          <span className="chip" style={{ background: "var(--amber-bg)", color: "var(--amber)" }}>
                            <Loader2 className="w-3 h-3 animate-spin" /> Parsing...
                          </span>
                        )}
                        {imp.status === "FAILED" && (
                          <span className="chip" style={{ background: "var(--red-bg)", color: "var(--red)" }}>
                            Failed to parse
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => openReview(imp)}
                          className="btn-p"
                          style={{
                            width: "auto",
                            height: 32,
                            fontSize: 11,
                            padding: "0 12px",
                          }}
                        >
                          Review job
                        </button>
                        <button
                          onClick={() => declineImport.mutate(imp.id)}
                          disabled={declineImport.isPending}
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
                  1. Forward confirmation email or upload a screenshot
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

      <ImportReviewModal
        imp={reviewing ?? ({} as JobImport)}
        overrides={overrides}
        isOpen={!!reviewing && modalView === "review"}
        onClose={() => setReviewing(null)}
        onEdit={openEdit}
        onConfirm={(o) =>
          reviewing && confirmImport.mutate({ id: reviewing.id, overrides: o })
        }
        onDecline={() => reviewing && declineImport.mutate(reviewing.id)}
        isConfirming={confirmImport.isPending}
      />

      <ImportEditModal
        key={`${reviewing?.id ?? "none"}-${modalView}-${JSON.stringify(overrides)}`}
        imp={reviewing ?? ({} as JobImport)}
        overrides={overrides}
        isOpen={!!reviewing && modalView === "edit"}
        onClose={() => setReviewing(null)}
        onBack={() => setModalView("review")}
        onSave={handleSaveEdits}
      />
    </ProGate>
  );
}
