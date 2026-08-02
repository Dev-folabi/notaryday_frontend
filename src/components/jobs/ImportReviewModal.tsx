"use client";

import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { cittApi } from "@/api/citt.api";
import { formatCurrency, formatDateTime, unwrap } from "@/lib/utils";
import { Check, Mail, Pencil, Info } from "lucide-react";
import type { JobImport } from "@/types/import";
import type { ImportConfirmOverrides } from "@/types/import";
import type { CITTCheckResponse } from "@/types/citt";

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
  const address = overrides.address ?? imp.parsed_address ?? "";
  const appointmentTime =
    overrides.appointment_time ?? imp.parsed_appointment_time;
  const signingType = overrides.signing_type ?? imp.parsed_signing_type ?? "GENERAL";
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

  const verdictColor =
    citt?.verdict === "TAKE_IT"
      ? { bg: "var(--teal-bg)", color: "var(--teal)", border: "1px solid var(--teal-b)" }
      : citt?.verdict === "RISKY"
        ? { bg: "var(--amber-bg)", color: "var(--amber)", border: "1px solid var(--amber-b)" }
        : { bg: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-b)" };

  const verdictLabel = citt
    ? citt.verdict === "TAKE_IT"
      ? "CITT: Take it"
      : citt.verdict === "RISKY"
        ? "CITT: Risky"
        : "CITT: Decline"
    : "CITT: Check";

  const fields = [
    ["Address", address || "—"],
    ["Date", appointmentTime ? formatDateTime(appointmentTime).split(",")[0] || "—" : "—"],
    ["Time", appointmentTime ? formatDateTime(appointmentTime) : "—"],
    ["Signing type", signingLabel(signingType)],
    ["Fee", formatCurrency(fee)],
    ["Client name", clientName || "—"],
    ["Platform", platformName || imp.from_address || "—"],
  ] as const;

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
          Auto parsed — AI extracted
        </span>
      </div>

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

      <div
        className="card p-3.5 mb-3"
        style={{
          background: citt ? verdictColor.bg : undefined,
          borderColor: citt ? undefined : "var(--border)",
        }}
      >
        <div className="flex gap-2 mb-2 items-center">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{ background: citt ? verdictColor.color : "var(--slate2)" }}
          >
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <div
              className="text-[12px] font-bold"
              style={{ color: citt ? verdictColor.color : "var(--slate2)" }}
            >
              {verdictLabel}
            </div>
            <div className="text-[10px] text-slate-secondary">
              {citt
                ? citt.reason
                : "Run a CITT check to see the net after mileage."}
            </div>
          </div>
        </div>
        <div
          className="grid grid-cols-3 gap-px border border-border rounded-lg overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div className="bg-white p-2 text-center">
            <div className="text-[9px] font-semibold text-slate-secondary uppercase mb-1">
              Offered fee
            </div>
            <div className="font-sora text-[13px] font-bold" style={{ color: "var(--slate)" }}>
              {formatCurrency(fee)}
            </div>
          </div>
          <div className="bg-white p-2 text-center border-l border-border">
            <div className="text-[9px] font-semibold text-slate-secondary uppercase mb-1">
              Mileage cost
            </div>
            <div className="font-sora text-[13px] font-bold" style={{ color: "var(--amber)" }}>
              {citt ? `-${formatCurrency(citt.mileage_cost)}` : "—"}
            </div>
          </div>
          <div className="bg-white p-2 text-center border-l border-border">
            <div className="text-[9px] font-semibold text-slate-secondary uppercase mb-1">
              Net earnings
            </div>
            <div className="font-sora text-[13px] font-bold" style={{ color: "var(--teal)" }}>
              {citt ? formatCurrency(citt.net_earnings) : "—"}
            </div>
          </div>
        </div>
      </div>

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
          onClick={() => onConfirm(overrides)}
          disabled={isConfirming}
        >
          <Check className="w-4 h-4" />
          {isConfirming ? "Adding..." : "Add to my schedule"}
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
