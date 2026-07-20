"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, DollarSign, User, Phone, Mail, Check, X } from "lucide-react";
import { useCreateJob, useUpdateJob, useJob } from "@/hooks/useJobs";
import { useUIStore } from "@/store/uiStore";
import type { SigningType } from "@/types/user";
import { toDateInputValue, toTimeInputValue, errMsg } from "@/lib/utils";

const SERVICES: { label: string; value: SigningType }[] = [
  { label: "General", value: "GENERAL" },
  { label: "Loan Refi", value: "LOAN_REFI" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Purchase Closing", value: "PURCHASE_CLOSING" },
  { label: "Field Inspection", value: "FIELD_INSPECTION" },
  { label: "Apostille", value: "APOSTILLE" },
];

const STATUSES = ["Pending", "Confirmed", "In Progress", "Complete", "Cancelled"];

function statusToEnum(s: string): string {
  return s.toUpperCase().replace(/\s+/g, "_");
}
function statusFromEnum(s: string): string {
  const map: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    COMPLETE: "Complete",
    CANCELLED: "Cancelled",
  };
  return map[s] ?? "Confirmed";
}

interface FormState {
  address: string;
  date: string;
  time: string;
  signing_type: SigningType;
  fee: string;
  status: string;
  platform_name: string;
  signing_duration_mins: string;
  scanback_duration_mins: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  notes: string;
}

const EMPTY: FormState = {
  address: "",
  date: new Date().toISOString().split("T")[0],
  time: "14:00",
  signing_type: "GENERAL",
  fee: "125",
  status: "Confirmed",
  platform_name: "",
  signing_duration_mins: "45",
  scanback_duration_mins: "30",
  client_name: "",
  client_phone: "",
  client_email: "",
  notes: "",
};

export default function JobForm({
  mode,
  jobId,
}: {
  mode: "new" | "edit";
  jobId?: string;
}) {
  const router = useRouter();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const { addToast } = useUIStore();
  const { data: job, isLoading } = useJob(jobId ?? "");

  const [form, setForm] = useState<FormState>(EMPTY);
  const [selectedType, setSelectedType] = useState<SigningType>("GENERAL");
  const [addrError, setAddrError] = useState(false);

  // Address autocomplete (Photon)
  const [suggestions, setSuggestions] = useState<any[]>([]);
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
    const q = form.address;
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
  }, [form.address]);

  const handleSelectAddress = (feature: any) => {
    const { name, street, city, state, postcode } = feature.properties;
    const label = [name || street, city, state, postcode]
      .filter(Boolean)
      .join(", ");
    set("address", label);
    setAddrError(false);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (mode === "edit" && job) {
      setForm({
        address: job.address,
        date: toDateInputValue(job.appointment_time),
        time: toTimeInputValue(job.appointment_time),
        signing_type: job.signing_type,
        fee: job.fee,
        status: statusFromEnum(job.status),
        platform_name: job.platform_name ?? "",
        signing_duration_mins: String(job.signing_duration_mins),
        scanback_duration_mins: String(job.scanback_duration_mins),
        client_name: job.client_name ?? "",
        client_phone: job.client_phone ?? "",
        client_email: job.client_email ?? "",
        notes: job.notes ?? "",
      });
      setSelectedType(job.signing_type);
    }
  }, [mode, job]);

  const set = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.address.trim()) {
      setAddrError(true);
      addToast({ type: "error", title: "Address is required" });
      return;
    }
    const appointment_time = new Date(
      `${form.date}T${form.time}`,
    ).toISOString();
    const payload = {
      address: form.address.trim(),
      appointment_time,
      signing_type: form.signing_type,
      signing_duration_mins: parseInt(form.signing_duration_mins) || 45,
      scanback_duration_mins: parseInt(form.scanback_duration_mins) || 0,
      fee: parseFloat(form.fee) || 0,
      platform_name: form.platform_name.trim() || undefined,
      client_name: form.client_name.trim() || undefined,
      client_phone: form.client_phone.trim() || undefined,
      client_email: form.client_email.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    if (mode === "new") {
      createJob.mutate(payload as any, {
        onSuccess: () => {
          addToast({ type: "success", title: "Job saved, route recalculated" });
          router.push("/jobs");
        },
        onError: (err) =>
          addToast({
            type: "error",
            title: "Couldn't save job",
            message: errMsg(err),
          }),
      });
    } else {
      updateJob.mutate(
        { id: jobId!, data: { ...payload, status: statusToEnum(form.status) } as any },
        {
          onSuccess: () => {
            addToast({ type: "success", title: "Job updated, route recalculated" });
            router.push(`/jobs/${jobId}`);
          },
          onError: (err) =>
            addToast({
              type: "error",
              title: "Couldn't update job",
              message: errMsg(err),
            }),
        },
      );
    }
  };

  if (mode === "edit" && isLoading) {
    return (
      <div className="con" style={{ padding: 24, textAlign: "center", color: "#64748B", fontSize: 12 }}>
        Loading job…
      </div>
    );
  }

  const isPending = createJob.isPending || updateJob.isPending;

  return (
    <>
      <div className="ph" style={{ alignItems: "center" }}>
        <button className="ph-back" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="ph-title">{mode === "new" ? "Add job" : "Edit job"}</div>
        <div style={{ minWidth: 44 }} />
      </div>

      <div className="con">
        <span className="slbl">Required fields</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="field">
            <label className="lbl">Signing address <span className="req">*</span></label>
            <div className="icw" ref={addrWrapRef} style={{ position: "relative" }}>
              <span className="ico">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <input
                className={`inp has-icon ${addrError ? "border-red-danger" : ""}`}
                placeholder="Enter address"
                autoComplete="off"
                value={form.address}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  set("address", e.target.value);
                  setAddrError(false);
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
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#F8FAFC")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#fff")
                        }
                      >
                        {label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {addrError && (
              <span className="err-msg" style={{ display: "flex" }}>
                <X className="w-3 h-3" /> Address is required
              </span>
            )}
          </div>

          <div className="g2">
            <div className="field">
              <label className="lbl">Date <span className="req">*</span></label>
              <input
                type="date"
                className="inp"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Start time <span className="req">*</span></label>
              <input
                type="time"
                className="inp"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="lbl">Signing type <span className="req">*</span></label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SERVICES.map((t) => (
                <div
                  key={t.value}
                  className={`tpill ${selectedType === t.value ? "on" : ""}`}
                  onClick={() => {
                    setSelectedType(t.value);
                    set("signing_type", t.value);
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="lbl">Offered fee <span className="req">*</span></label>
            <div className="icw">
              <span className="ico">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <input
                type="number"
                className="inp has-icon"
                placeholder="0"
                value={form.fee}
                onChange={(e) => set("fee", e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="lbl">Status</label>
            <select
              className="sel"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: ".5px",
              marginBottom: 10,
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            Optional details
            <span
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 4,
                padding: "1px 5px",
                fontSize: 9,
                color: "#64748B",
              }}
            >
              Optional
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="g2">
              <div className="field">
                <label className="lbl">Duration</label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    className="inp"
                    value={form.signing_duration_mins}
                    style={{ width: 56, textAlign: "center" }}
                    onChange={(e) => set("signing_duration_mins", e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: "#64748B" }}>min</span>
                </div>
              </div>
              <div className="field">
                <label className="lbl">Scanback override</label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    className="inp"
                    value={form.scanback_duration_mins}
                    style={{ width: 56, textAlign: "center" }}
                    onChange={(e) => set("scanback_duration_mins", e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: "#64748B" }}>min</span>
                </div>
              </div>
            </div>
            <div className="g2">
              <div className="field">
                <label className="lbl">Client name</label>
                <div className="icw">
                  <span className="ico">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    className="inp has-icon"
                    placeholder="Client name"
                    value={form.client_name}
                    onChange={(e) => set("client_name", e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="lbl">Client phone</label>
                <div className="icw">
                  <span className="ico">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    className="inp has-icon"
                    placeholder="(555) 555-5555"
                    value={form.client_phone}
                    onChange={(e) => set("client_phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="lbl">Client email</label>
                <div className="icw">
                  <span className="ico">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    className="inp has-icon"
                    placeholder="client@example.com"
                    value={form.client_email}
                    onChange={(e) => set("client_email", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="field">
              <label className="lbl">Platform</label>
              <input
                className="inp"
                placeholder="e.g. Snapdocs"
                value={form.platform_name}
                onChange={(e) => set("platform_name", e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Notes</label>
              <textarea
                className="ta"
                placeholder="Gate codes, instructions"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <button className="btn-p" onClick={submit} disabled={isPending}>
            <Check className="w-4 h-4" /> {isPending ? "Saving…" : "Save job"}
          </button>
          <button className="btn-gh" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
