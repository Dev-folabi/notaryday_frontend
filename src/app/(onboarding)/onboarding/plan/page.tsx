"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/api/users.api";
import { useUIStore } from "@/store/uiStore";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Copy, Check, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { buildBookingPageServices, BOOKING_SERVICE_LIST } from "@/lib/booking";

export default function OnboardingBookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const { completeOnboarding } = useOnboarding();
  const [services, setServices] = useState<string[]>([
    "General Notary",
    "Loan Refi",
    "Hybrid Signing",
  ]);
  const [minNotice, setMinNotice] = useState(2);
  const [advanceLimit, setAdvanceLimit] = useState(30);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${user?.username ?? ""}`;

  const finish = async () => {
    setSaving(true);
    try {
      await usersApi.updateSettings({
        booking_page_services: buildBookingPageServices(services),
        booking_min_notice_hours: minNotice,
        booking_advance_limit_days: advanceLimit,
      } as Record<string, unknown>);
      await completeOnboarding.mutateAsync();
      addToast({ type: "success", title: "Welcome! Your booking page is set up." });
      router.push(ROUTES.APP.TODAY);
    } catch {
      addToast({ type: "error", title: "Could not finish setup" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 bg-white lg:bg-bg overflow-y-auto">
      <div className="w-full max-w-[640px]">
        <div className="mb-6">
          <span className="inline-block bg-[#0F2C4E]/[0.07] border border-[#E2E8F0] text-[#0F2C4E] text-[11px] font-medium px-[10px] py-[4px] rounded-[5px] mb-3">
            Optional · Step 4 of 4
          </span>
          <h1 className="font-sora font-bold text-[24px] text-primary-navy leading-[1.3] mb-2">
            Set up your booking page
          </h1>
          <p className="font-inter text-[14px] text-slate-secondary leading-[1.6]">
            Let clients book you directly. You can change these any time in
            Settings. Skip for now and set it up later.
          </p>
        </div>

        <div className="card p-4 mb-4">
          <div className="flex justify-between gap-2 flex-wrap items-center mb-3">
            <div className="flex-1 min-w-[180px]">
              <div className="font-inter text-[11px] font-semibold text-teal-success mb-1.5 flex gap-1.5 items-center">
                <Check className="w-3.5 h-3.5" /> Your booking page
              </div>
              <div className="font-mono text-[12px] text-navy break-words">{bookingUrl}</div>
            </div>
            <button
              className="btn-sm"
              style={{ borderColor: "var(--teal-b)", color: "var(--teal)" }}
              onClick={() => {
                navigator.clipboard.writeText(bookingUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{" "}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <span className="slbl">Services you accept</span>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {BOOKING_SERVICE_LIST.map((s) => (
              <div
                key={s.signing_type}
                className={cn("tpill", services.includes(s.name) && "on")}
                onClick={() =>
                  setServices((prev) =>
                    prev.includes(s.name) ? prev.filter((x) => x !== s.name) : [...prev, s.name],
                  )
                }
              >
                {s.name}
              </div>
            ))}
          </div>

          <span className="slbl">Booking rules</span>
          <div className="g2 mb-2">
            <div className="field">
              <label className="lbl">Minimum notice</label>
              <div className="flex gap-1.5 items-center">
                <input
                  className="inp"
                  style={{ width: 56, textAlign: "center" }}
                  value={minNotice}
                  onChange={(e) => setMinNotice(Number(e.target.value))}
                />
                <span className="font-inter text-[11px] text-slate-secondary">hours</span>
              </div>
              <span className="hint">Clients cannot book same day within this window</span>
            </div>
            <div className="field">
              <label className="lbl">Advance limit</label>
              <div className="flex gap-1.5 items-center">
                <input
                  className="inp"
                  style={{ width: 56, textAlign: "center" }}
                  value={advanceLimit}
                  onChange={(e) => setAdvanceLimit(Number(e.target.value))}
                />
                <span className="font-inter text-[11px] text-slate-secondary">days</span>
              </div>
              <span className="hint">Clients can book up to this many days ahead</span>
            </div>
          </div>
        </div>

        <div className="bg-[#ECFDF5] border border-[#6EE7B7] rounded-[8px] p-[11px_14px] text-center mb-[18px]">
          <span className="font-inter text-[13px] font-medium text-[#0E7B6C]">
            Your booking page is how most notaries fill their gaps. Set it up in
            under a minute.
          </span>
        </div>

        <div className="flex flex-col gap-[10px]">
          <button
            onClick={finish}
            disabled={saving}
            className={cn(
              "w-full h-[48px] rounded-[8px] bg-[#0F2C4E] text-white font-inter font-bold text-[14px] flex items-center justify-center gap-[7px] transition-opacity",
              saving ? "opacity-60 cursor-not-allowed" : "hover:opacity-90",
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {saving ? "Finishing…" : "Finish setup"}
          </button>
        </div>

        <div className="bg-[#FFFBEB] border-l-[3px] border-[#D97706] rounded-r-[8px] p-[11px_14px] mt-[14px] flex items-center gap-[8px]">
          <Sparkles className="w-[13px] h-[13px] text-[#D97706] shrink-0" />
          <span className="font-inter text-[13px] font-medium text-[#D97706]">
            Want your day planned automatically? Upgrade to Pro any time from
            Settings.
          </span>
        </div>
      </div>
    </div>
  );
}
