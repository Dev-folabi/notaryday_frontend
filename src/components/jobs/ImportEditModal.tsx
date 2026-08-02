"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Check, ArrowLeft, AlertTriangle } from "lucide-react";
import type { JobImport, ImportConfirmOverrides } from "@/types/import";
import type { SigningType } from "@/types/user";

const SIGNING_TYPES: SigningType[] = [
  "GENERAL",
  "LOAN_REFI",
  "HYBRID",
  "PURCHASE_CLOSING",
  "FIELD_INSPECTION",
  "APOSTILLE",
];

const SIGNING_LABELS: Record<SigningType, string> = {
  GENERAL: "General",
  LOAN_REFI: "Loan / Refinance",
  HYBRID: "Hybrid",
  PURCHASE_CLOSING: "Purchase closing",
  FIELD_INSPECTION: "Field inspection",
  APOSTILLE: "Apostille",
};

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function toTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(11, 16);
}

interface ImportEditModalProps {
  imp: JobImport;
  overrides: ImportConfirmOverrides;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSave: (overrides: ImportConfirmOverrides) => void;
}

export function ImportEditModal({
  imp,
  overrides,
  isOpen,
  onClose,
  onBack,
  onSave,
}: ImportEditModalProps) {
  const parsedTime = overrides.appointment_time ?? imp.parsed_appointment_time;

  const [address, setAddress] = useState(
    overrides.address ?? imp.parsed_address ?? "",
  );
  const [date, setDate] = useState(toDateInput(parsedTime));
  const [time, setTime] = useState(toTimeInput(parsedTime));
  const [signingType, setSigningType] = useState<SigningType>(
    overrides.signing_type ?? imp.parsed_signing_type ?? "GENERAL",
  );
  const [fee, setFee] = useState(
    String(overrides.fee ?? Number(imp.parsed_fee ?? 0)),
  );
  const [clientName, setClientName] = useState(
    overrides.client_name ?? imp.parsed_client_name ?? "",
  );
  const [platformName, setPlatformName] = useState(
    overrides.platform_name ?? imp.parsed_platform_name ?? "",
  );
  const [notes, setNotes] = useState(imp.parsed_notes ?? "");

  const handleSave = () => {
    let appointmentTime: string | undefined;
    if (date && time) {
      appointmentTime = new Date(`${date}T${time}:00`).toISOString();
    } else if (parsedTime) {
      appointmentTime = new Date(parsedTime).toISOString();
    }

    onSave({
      address: address || undefined,
      appointment_time: appointmentTime,
      signing_type: signingType,
      fee: fee ? Number(fee) : undefined,
      client_name: clientName || undefined,
      platform_name: platformName || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit imported job" size="lg">
      <div className="alert al-amber mb-3">
        <AlertTriangle className="w-3.5 h-3.5 text-amber flex-shrink-0" />
        <div className="text-[11px] leading-[1.3]">
          Edit the fields extracted by AI. The original import is kept — all
          changes are validated before adding to schedule.
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="field">
          <label className="lbl">Signing address *</label>
          <input
            className="inp"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="g2">
          <div className="field">
            <label className="lbl">Date *</label>
            <input
              className="inp"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="lbl">Time *</label>
            <input
              className="inp"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        <div className="g2">
          <div className="field">
            <label className="lbl">Signing type</label>
            <select
              className="sel"
              value={signingType}
              onChange={(e) => setSigningType(e.target.value as SigningType)}
            >
              {SIGNING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SIGNING_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="lbl">Offered fee</label>
            <input
              className="inp"
              type="number"
              min={0}
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="lbl">Client name</label>
          <input
            className="inp"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="lbl">Platform</label>
          <input
            className="inp"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="lbl">Notes</label>
          <textarea
            className="ta"
            placeholder="Add notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button className="btn-p h-10" onClick={handleSave}>
          <Check className="w-4 h-4" /> Save edits and run CITT again
        </button>
        <button className="btn-gh h-9" onClick={onBack}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to review
        </button>
      </div>
    </Modal>
  );
}
