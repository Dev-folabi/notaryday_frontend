"use client";

import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { cittApi } from "@/api/citt.api";
import { formatCurrency, formatDateTime, unwrap } from "@/lib/utils";
import { Check, Mail, Pencil, Info, Loader2, AlertTriangle, X } from "lucide-react";
import type { JobImport } from "@/types/import";
import type { ImportConfirmOverrides } from "@/types/import";
import type { CITTCheckResponse } from "@/types/citt";
import { useAuth } from "@/hooks/useAuth";
import { acceptedSigningTypes } from "@/lib/booking";
import type { SigningType } from "@/types/user";
import ProfitabilityRow from "@/components/jobs/ProfitabilityRow";

const PENDING_STATUSES = ["QUEUED", "PROCESSING"];

interface ImportReviewModalProps {
  imp: JobImport;
  overrides: ImportConfirmOverrides;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onConfirm: (overrides: ImportConfirmOverrides) => void;
  onDecline: () => void;
  isConfirming?: boolean;
}

function signingLabel(type: string | null): string {
  if (!type) return "—";
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function ImportReviewModal({
  imp,
  overrides,
  isOpen,
  onClose,
  onEdit,
  onConfirm,
  onDecline,
  isConfirming = false,
}: ImportReviewModalProps) {
  const { user } = useAuth();
  const address = overrides.address ?? imp.parsed_address ?? "";
  const appointmentTime =
    overrides.appointment_time ?? imp.parsed_appointment_time;
  const importedSigningType =
    overrides.signing_type ?? imp.parsed_signing_type ?? "GENERAL";
  const unsupportedImportedType = !acceptedSigningTypes(user).includes(
    importedSigningType as SigningType,
  );
  const signingType: SigningType = unsupportedImportedType
    ? "GENERAL"
    : (importedSigningType as SigningType);
  const fee = overrides.fee ?? Number(imp.parsed_fee ?? 0);
  const platformFee = overrides.platform_fee ?? Number(imp.parsed_platform_fee ?? 0);
  const clientName = overrides.client_name ?? imp.parsed_client_name;
  const platformName = overrides.platform_name ?? imp.parsed_platform_name;

  const { data: citt } = useQuery({
    queryKey: ["citt", imp.id, overrides],
    queryFn: async (): Promise<CITTCheckResponse | null> => {
      if (!address || !appointmentTime) return null;
      const res = await cittApi.check({
        address,
        appointment_time: new Date(appointmentTime).toISOString(),
        signing_type: signingType,
        fee,
        platform_fee: platformFee,
      });
      return unwrap<CITTCheckResponse>(res);
    },
    enabled: isOpen && !!address && !!appointmentTime,
    staleTime: 60_000,
  });

  const net = citt?.net_earnings ?? 0;
  const netIconBgCls = net >= 30 ? "bg-teal-bg text-teal" : net >= 10 ? "bg-amber-bg text-amber" : "bg-red-bg text-red";

  const verdict = citt
    ? citt.verdict === "TAKE_IT"
      ? { bg: "bg-teal-bg", border: "border-teal-border", solid: "bg-teal", text: "text-teal", title: "Take it" }
      : citt.verdict === "RISKY"
        ? { bg: "bg-amber-bg", border: "border-amber-border", solid: "bg-amber", text: "text-amber", title: "Risky" }
        : { bg: "bg-red-bg", border: "border-red-border", solid: "bg-red", text: "text-red", title: "Decline" }
    : null;

  const fields = [
    ["Address", address || "—"],
    ["Date", appointmentTime ? formatDateTime(appointmentTime).split(",")[0] || "—" : "—"],
    ["Time", appointmentTime ? formatDateTime(appointmentTime) : "—"],
    ["Signing type", signingLabel(signingType)],
    ["Fee", formatCurrency(fee)],
    ["Client name", clientName || "—"],
    ["Platform", platformName || imp.from_address || "—"],
  ] as const;

  const pending = PENDING_STATUSES.includes(imp.status);
  const failed = imp.status === "FAILED";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review imported job"
      size="lg"
    >
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="chip c-imported">
          <Mail className="w-3 h-3" /> Imported via {imp.import_type === "EMAIL" ? "email" : "screenshot"}
        </span>
        <span className="font-inter text-[10px] text-slate-secondary">
          Auto parsed · AI extracted
        </span>
      </div>

      {pending && (
        <div className="alert al-blue mb-3 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-blue flex-shrink-0 animate-spin" />
          <div className="text-[11px] leading-[1.3]">
            Still parsing this import. Fields will appear here automatically
            once the AI has finished. Keep this window open.
          </div>
        </div>
      )}

      {failed && (
        <div className="alert al-red mb-3 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-danger flex-shrink-0" />
          <div className="text-[11px] leading-[1.3]">
            This import failed to parse. You can retry by uploading a new
            screenshot or forwarding the email again.
          </div>
        </div>
      )}

      {unsupportedImportedType && (
        <div className="alert al-amber mb-3 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber flex-shrink-0" />
          <div className="text-[11px] leading-[1.3]">
            {signingLabel(importedSigningType)} is not in your accepted signing
            types, so this import was set to General for review.
          </div>
        </div>
      )}

      <div className="card p-3.5 mb-3">
        <span className="slbl">Fields extracted by AI</span>
        <div className="flex flex-col">
          {fields.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between items-center py-2 border-b border-border gap-2 last:border-b-0"
            >
              <span className="text-[11px] text-slate-secondary font-medium min-w-[90px]">
                {label}
              </span>
              <span className="text-[11px] text-primary-navy font-semibold flex-1 text-right break-words">
                {value}
              </span>
              <Check className="w-3.5 h-3.5 text-teal-success flex-shrink-0" />
            </div>
          ))}
        </div>
        <button
          className="btn-sm w-full mt-2.5"
          onClick={onEdit}
        >
          <Pencil className="w-3 h-3" /> Edit extracted fields
        </button>
      </div>

      {citt && verdict ? (
        <div className="card p-0 overflow-hidden mb-3">
          {/* VERDICT HEADER */}
          <div
            className={`px-6 pt-8 pb-6 text-center border-b ${verdict.bg} ${verdict.border}`}
          >
            <div
              className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-4 ${verdict.solid}`}
            >
              {citt.verdict === "TAKE_IT" ? (
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : citt.verdict === "RISKY" ? (
                <AlertTriangle className="w-8 h-8 text-white" />
              ) : (
                <X className="w-8 h-8 text-white" />
              )}
            </div>
            <div
              className={`font-sora text-[22px] font-bold mb-1.5 ${verdict.text}`}
            >
              {verdict.title}
            </div>
            <div className="text-[12px] text-slate-secondary leading-snug max-w-[300px] mx-auto">
              {citt.reason}
            </div>
          </div>

          <div className="p-5">
            {/* EARNINGS BREAKDOWN */}
            <span className="slbl">Earnings breakdown</span>
            <ProfitabilityRow
              variant="review"
              fee={fee}
              mileageCost={citt.mileage_cost}
              mileageDetail={`${citt.drive_distance_miles?.toFixed(1) ?? "0"} mi rt`}
              netEarnings={net}
              netDetail={`$${citt.effective_hourly?.toFixed(0) ?? "0"}/hr eff.`}
            />
            <div className="text-[12px] text-slate-secondary text-center mb-1">
              {citt.drive_distance_miles?.toFixed(1) ?? "0"} mi round trip ·{" "}
              {citt.total_job_mins || 45} min signing ·{" "}
              {citt.drive_time_mins || 0} min drive · $
              {citt.effective_hourly?.toFixed(2) ?? "0.00"} effective hourly
              rate
            </div>

            <div className="h-[1px] bg-border my-4" />

            {/* WHAT WE CHECKED */}
            <span className="slbl">What we checked</span>
            <div className="bg-white border border-border rounded-[12px] p-1 px-4 mb-2">
              <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${
                    citt.can_make_it
                      ? "bg-teal-bg text-teal"
                      : "bg-red-bg text-red"
                  }`}
                >
                  {citt.can_make_it ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-navy mb-[2px]">
                    Schedule fit
                  </div>
                  <div className="text-[12px] text-slate-secondary leading-snug">
                    {citt.can_make_it
                      ? "Schedule fits with enough time for the appointment and driving."
                      : citt.reason}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${
                    citt.scanback_conflict
                      ? "bg-red-bg text-red"
                      : "bg-teal-bg text-teal"
                  }`}
                >
                  {!citt.scanback_conflict ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-navy mb-[2px]">
                    Scanback conflicts
                  </div>
                  <div className="text-[12px] text-slate-secondary leading-snug">
                    {!citt.scanback_conflict
                      ? "No scanback window conflicts."
                      : citt.scanback_conflict_detail ||
                        "Conflicts with an existing scanback window."}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-[1px] ${netIconBgCls}`}
                >
                  {net >= 30 ? (
                    <Check className="w-4 h-4" />
                  ) : net >= 10 ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-navy mb-[2px]">
                    Net earnings
                  </div>
                  <div className="text-[12px] text-slate-secondary leading-snug">
                    {net >= 30
                      ? "Solid profitability. Good effective hourly rate."
                      : net >= 10
                        ? "Marginal profitability. Decide if the time investment is worth it."
                        : "Extremely low net earnings after mileage. Recommended decline."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-3.5 mb-3">
          <div className="flex gap-2 mb-2 items-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white bg-slate-2">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-secondary">
                CITT: Check
              </div>
              <div className="text-[10px] text-slate-secondary">
                Run a CITT check to see the net after mileage.
              </div>
            </div>
          </div>
          <ProfitabilityRow variant="placeholder" fee={fee} />
        </div>
      )}

      <div className="alert al-blue">
        <Info className="w-3.5 h-3.5 text-blue flex-shrink-0" />
        <div className="text-[11px] leading-[1.3]">
          All fields were extracted automatically via AI. Review them before
          confirming. Tap Edit fields to correct any extracted data.
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button
          className="btn-teal h-10"
          onClick={() =>
            onConfirm(
              unsupportedImportedType
                ? { ...overrides, signing_type: "GENERAL" }
                : overrides,
            )
          }
          disabled={isConfirming || pending}
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Parsing...
            </>
          ) : isConfirming ? (
            <>
              <Check className="w-4 h-4" /> Adding...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> Add to my schedule
            </>
          )}
        </button>
        <button className="btn-gh h-9" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5" /> Edit fields before adding
        </button>
        <button className="btn-gh h-9" onClick={onDecline}>
          Decline - not taking this job
        </button>
      </div>
    </Modal>
  );
}
