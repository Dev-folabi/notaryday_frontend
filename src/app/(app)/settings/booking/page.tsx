"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { Globe, Copy, Check } from "lucide-react";
import api from "@/lib/api";

export default function BookingSettingsPage() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/users/settings").then((res: any) => {
      setSettings((res as any).data?.data ?? (res as any).data ?? res);
      setLoading(false);
    });
  }, []);

  const handleSave = async (field: string, value: any) => {
    setSaving(true);
    try {
      await api.patch("/users/settings", { [field]: value });
      setSettings((s: any) => ({ ...s, [field]: value }));
      addToast({ type: "success", title: "Saved" });
    } catch {
      addToast({ type: "error", title: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${user?.username}`;

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-interactive-blue rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="font-sora font-bold text-xl text-primary-navy mb-1">
        Booking Page
      </h1>
      <p className="font-inter text-sm text-slate-secondary mb-6">
        Let clients book you directly.
      </p>

      {/* Enable toggle */}
      <div className="bg-white border border-border rounded-12px p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="font-inter text-sm font-semibold text-primary-navy">
            Enable booking page
          </div>
          <div className="font-inter text-xs text-slate-secondary">
            Clients can book at your public URL
          </div>
        </div>
        <button
          onClick={() =>
            handleSave("booking_page_enabled", !settings?.booking_page_enabled)
          }
          className={`w-11 h-6 rounded-full transition-colors relative ${settings?.booking_page_enabled ? "bg-teal-success" : "bg-border"}`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${settings?.booking_page_enabled ? "right-0.5" : "left-0.5"}`}
          />
        </button>
      </div>

      {/* URL */}
      <div className="bg-white border border-border rounded-12px p-4 mb-4">
        <div className="font-inter text-xs font-semibold text-slate-secondary uppercase tracking-wide mb-2">
          Your booking URL
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-bg border border-border rounded-8px px-3 py-2 font-inter text-sm text-primary-navy truncate flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-secondary flex-shrink-0" />
            {bookingUrl}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(bookingUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="h-9 px-3 border border-border rounded-8px text-xs font-medium flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-teal-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white border border-border rounded-12px p-4 mb-4">
        <label className="font-inter text-xs font-semibold text-slate-secondary uppercase tracking-wide block mb-2">
          Bio
        </label>
        <textarea
          defaultValue={settings?.booking_page_bio ?? ""}
          onBlur={(e) => handleSave("booking_page_bio", e.target.value)}
          className="w-full min-h-[80px] border border-border rounded-8px p-3 font-inter text-sm resize-none focus:border-interactive-blue focus:ring-2 focus:ring-blue-100 outline-none"
          placeholder="NNA Certified Signing Agent serving..."
        />
      </div>

      {/* Service area */}
      <div className="bg-white border border-border rounded-12px p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="font-inter text-sm font-semibold text-primary-navy">
            Service area
          </div>
          <div className="font-inter text-xs text-slate-secondary">
            Max radius from home base
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            defaultValue={settings?.service_area_miles ?? 25}
            onBlur={(e) =>
              handleSave("service_area_miles", Number(e.target.value))
            }
            className="w-16 h-9 border border-border rounded-8px px-2 text-center font-inter text-sm"
          />
          <span className="font-inter text-xs text-slate-secondary">miles</span>
        </div>
      </div>

      {/* Buffer */}
      <div className="bg-white border border-border rounded-12px p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="font-inter text-sm font-semibold text-primary-navy">
            Booking buffer
          </div>
          <div className="font-inter text-xs text-slate-secondary">
            Minimum gap before accepting
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            defaultValue={settings?.booking_buffer_mins ?? 15}
            onBlur={(e) =>
              handleSave("booking_buffer_mins", Number(e.target.value))
            }
            className="w-16 h-9 border border-border rounded-8px px-2 text-center font-inter text-sm"
          />
          <span className="font-inter text-xs text-slate-secondary">min</span>
        </div>
      </div>
    </div>
  );
}
