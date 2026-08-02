"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  Check,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Search,
} from "lucide-react";
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
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Parse a 12-hour time like "2:00 PM" into hours/minutes, or null. */
function parseTime12h(value: string): { hours: number; minutes: number } | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes > 59) return null;
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

interface AddressSuggestion {
  properties: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
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

  // Address autocomplete (Photon — same as Job form / CITT)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const addrWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        addrWrapRef.current &&
        !addrWrapRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = address.trim();
    if (!q || q.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en&countrycode=us`,
        );
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        setSuggestions(json.features || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [address]);

  const handleSelectAddress = (feature: AddressSuggestion) => {
    const { name, street, city, state, postcode } = feature.properties;
    const label = [name || street, city, state, postcode]
      .filter(Boolean)
      .join(", ");
    setAddress(label);
    setShowSuggestions(false);
  };

  const handleSave = () => {
    let appointmentTime: string | undefined;
    if (date && time) {
      const parsed = parseTime12h(time);
      if (parsed) {
        const d = new Date(`${date}T00:00:00`);
        d.setHours(parsed.hours, parsed.minutes, 0, 0);
        appointmentTime = d.toISOString();
      }
    }
    if (!appointmentTime && parsedTime) {
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
          <div className="icw" ref={addrWrapRef} style={{ position: "relative" }}>
            <span className="ico">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <input
              className="inp has-icon"
              placeholder="Enter address"
              autoComplete="off"
              value={address}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setAddress(e.target.value);
                setShowSuggestions(true);
              }}
            />
            {showSuggestions && (suggestions.length > 0 || isSearching) && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                  maxHeight: 240,
                  overflowY: "auto",
                  marginTop: 4,
                }}
              >
                {isSearching && suggestions.length === 0 && (
                  <li
                    style={{
                      padding: "10px 12px",
                      fontSize: 11,
                      color: "#64748B",
                      textAlign: "center",
                    }}
                  >
                    Searching addresses…
                  </li>
                )}
                {suggestions.map((s, i) => {
                  const { name, street, city, state, postcode } =
                    s.properties;
                  const label = [name || street, city, state, postcode]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <li
                      key={i}
                      onClick={() => handleSelectAddress(s)}
                      style={{
                        padding: "8px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                        borderBottom: "1px solid #F1F5F9",
                        color: "#475569",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      <Search className="w-3 h-3 text-muted shrink-0" />
                      {label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
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
              type="text"
              placeholder="2:00 PM"
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
