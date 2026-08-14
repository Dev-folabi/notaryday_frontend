"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { usersApi } from "@/api/users.api";
import { queryKeys } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { BOOKING_SERVICE_DEFAULTS, signingTypeFromName } from "@/lib/booking";
import type { SigningType } from "@/types/user";
import { Check, MapPin } from "lucide-react";

const SERVICES = [
  "General",
  "Loan Refi",
  "Hybrid",
  "Purchase Closing",
  "Field Inspection",
  "Apostille",
];

const TYPE_ENUM_TO_LABEL: Record<string, string> = {
  GENERAL: "General",
  LOAN_REFI: "Loan Refi",
  HYBRID: "Hybrid",
  PURCHASE_CLOSING: "Purchase Closing",
  FIELD_INSPECTION: "Field Inspection",
  APOSTILLE: "Apostille",
};

interface AddressFeature {
  properties: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
  geometry: { coordinates: [number, number] };
}

export default function OperationalTab() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const [homeBase, setHomeBase] = useState(
    user?.settings?.home_base_address ?? "",
  );
  const [homeBaseLat, setHomeBaseLat] = useState<number | null>(
    user?.settings?.home_base_lat ?? null,
  );
  const [homeBaseLng, setHomeBaseLng] = useState<number | null>(
    user?.settings?.home_base_lng ?? null,
  );
  const [scanback, setScanback] = useState(
    (user?.settings as { scanback_duration_mins?: number } | null)
      ?.scanback_duration_mins ?? 30,
  );
  const [types, setTypes] = useState<string[]>(() =>
    user?.signing_defaults && user.signing_defaults.length > 0
      ? user.signing_defaults.map(
          (s) => TYPE_ENUM_TO_LABEL[s.signing_type] ?? s.signing_type,
        )
      : SERVICES,
  );

  const [suggestions, setSuggestions] = useState<AddressFeature[]>([]);
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
    const q = homeBase;
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
  }, [homeBase]);

  const handleSelectAddress = (feature: AddressFeature) => {
    const { name, street, city, state, postcode } = feature.properties;
    const label = [name || street, city, state, postcode]
      .filter(Boolean)
      .join(", ");
    setHomeBase(label);
    const [lng, lat] = feature.geometry.coordinates;
    setHomeBaseLat(lat);
    setHomeBaseLng(lng);
    setShowSuggestions(false);
  };

  const toggleType = (t: string) =>
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const saveOperational = async () => {
    try {
      const existing = new Map(
        (user?.signing_defaults ?? []).map((s) => [s.signing_type, s]),
      );
      const signingDefaults = types.map((label) => {
        const key = signingTypeFromName(label) ?? (label as SigningType);
        const def = BOOKING_SERVICE_DEFAULTS[key];
        const cur = existing.get(key);
        return {
          signing_type: key,
          signing_duration_mins:
            cur?.signing_duration_mins ?? def?.duration_mins ?? 60,
          scanback_duration_mins:
            cur?.scanback_duration_mins ?? def?.scanback_mins ?? 0,
        };
      });

      await usersApi.updateSettings({
        home_base_address: homeBase,
        home_base_lat: homeBaseLat ?? undefined,
        home_base_lng: homeBaseLng ?? undefined,
        scanback_duration_mins: Number(scanback),
        signing_defaults: signingDefaults,
      });
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      addToast({ type: "success", title: "Operational settings saved" });
    } catch {
      addToast({ type: "error", title: "Could not save operational settings" });
    }
  };

  return (
    <div className="card p-4 mb-4">
      <div className="font-inter text-[12px] font-semibold text-navy mb-3 flex gap-1.5 items-center">
        <MapPin className="w-4 h-4" /> Operational settings
      </div>
      <div className="field">
        <label className="lbl">Home base address</label>
        <div className="icw" ref={addrWrapRef}>
          <span className="ico">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <input
            className="inp has-icon"
            value={homeBase}
            onChange={(e) => {
              setHomeBase(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Start typing your address…"
          />
          {isSearching && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-border rounded-[8px] shadow-lg overflow-hidden">
              {suggestions.map((f, i) => {
                const { name, street, city, state, postcode } = f.properties;
                const label = [name || street, city, state, postcode]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <button
                    key={i}
                    type="button"
                    className="block w-full text-left px-3 py-2 font-inter text-xs text-navy hover:bg-background border-b border-border last:border-b-0"
                    onClick={() => handleSelectAddress(f)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <span className="hint">
          Used to calculate drive time to your first signing. Never shown to
          clients.
        </span>
      </div>
      <div className="dvdr" />
      <div className="field">
        <label className="lbl">Default scanback duration</label>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            className="inp"
            style={{ width: 64, textAlign: "center" }}
            value={scanback}
            onChange={(e) => setScanback(Number(e.target.value))}
          />
          <span className="font-inter text-[11px] text-slate-secondary">
            minutes after each Loan Refi, Hybrid, Purchase Closing
          </span>
        </div>
        <span className="hint">
          Overridable per job. Changes recalculate all future scheduled days.
        </span>
      </div>
      <div className="dvdr" />
      <label className="lbl mb-2">Signing types you accept</label>
      <div className="flex gap-1.5 flex-wrap">
        {SERVICES.map((t) => (
          <div
            key={t}
            className={cn("tpill", types.includes(t) && "on")}
            onClick={() => toggleType(t)}
          >
            {t}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-3.5">
        <button
          onClick={saveOperational}
          className="btn-p"
          style={{ width: "auto", height: 36, fontSize: 12, padding: "0 16px" }}
        >
          <Check className="w-4 h-4" /> Save operational
        </button>
      </div>
    </div>
  );
}
