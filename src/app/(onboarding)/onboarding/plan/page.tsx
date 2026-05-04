"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { billingApi } from "@/api/billing.api";
import { useUIStore } from "@/store/uiStore";
import { useOnboarding } from "@/hooks/useOnboarding";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

const FREE_FEATURES = [
  "Unlimited jobs",
  "CITT (unlimited)",
  "Mileage log",
  "Notarial journal",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Route optimisation",
  "Scanback blocking",
  "Gap Finder",
  "Booking page",
  "Email import",
  "Auto invoicing",
];

export default function OnboardingBookingPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { completeOnboarding } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartPro = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding.mutateAsync();
      const result = (await billingApi.subscribe({ plan: "pro_monthly" })) as {
        checkoutUrl?: string;
      };
      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        addToast({
          type: "error",
          title: "Could not start checkout",
          message: "Please try again.",
        });
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Billing unavailable",
        message:
          err?.message ?? "Please try again or skip to continue with Free.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFree = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding.mutateAsync();
      router.push(ROUTES.APP.TODAY);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 bg-white lg:bg-bg overflow-y-auto">
      <div className="w-full max-w-[640px]">
        {/* Header */}
        <div className="mb-6">
          <span className="inline-block bg-[#0F2C4E]/[0.07] border border-[#E2E8F0] text-[#0F2C4E] text-[11px] font-medium px-[10px] py-[4px] rounded-[5px] mb-3">
            Optional upgrade
          </span>
          <h1 className="font-sora font-bold text-[24px] text-primary-navy leading-[1.3] mb-2">
            Want your day planned automatically?
          </h1>
          <p className="font-inter text-[14px] text-slate-secondary leading-[1.6]">
            Pro unlocks route optimisation, Gap Finder, your booking page, and
            auto scanback blocking. Most notaries earn it back in one signing.
          </p>
        </div>

        {/* Plan cards */}
        <div className="flex flex-col md:flex-row gap-[14px] mb-[16px]">
          {/* Free card */}
          <div className="flex-1 border-[1.5px] border-[#E2E8F0] rounded-[12px] p-[22px_18px] bg-white">
            <span className="inline-flex items-center bg-[#E2E8F0] text-[#475569] text-[10px] font-bold uppercase tracking-[0.2px] px-2 py-0.5 rounded mb-2.5">
              Free
            </span>
            <div className="font-sora font-bold text-[28px] text-[#0F2C4E] leading-[1] mt-[10px] mb-[3px]">
              $0
            </div>
            <p className="text-[12px] text-[#94A3B8] mb-[14px]">
              No credit card. No expiry.
            </p>
            <div className="flex flex-col gap-1.5">
              {FREE_FEATURES.map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-[6px] text-[12px] text-[#475569] py-1"
                >
                  <span className="text-[#0E7B6C] font-bold text-[14px] shrink-0 leading-none mt-0.5">
                    ✓
                  </span>
                  <span className="text-[12px]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro card */}
          <div className="flex-1 border-2 border-[#0F2C4E] rounded-[12px] p-[22px_18px] bg-white relative">
            <span className="inline-flex items-center bg-[#F59E0B] text-[#0F2C4E] text-[10px] font-bold uppercase tracking-[0.2px] px-2 py-0.5 rounded mb-2.5">
              Pro
            </span>
            <div className="font-sora font-bold text-[28px] text-[#0F2C4E] leading-[1] mt-[10px] mb-[3px]">
              $19
              <span className="text-[14px] font-normal text-[#64748B]">
                /mo
              </span>
            </div>
            <p className="text-[12px] text-[#94A3B8] mb-[14px]">
              or $208/yr — save $20
            </p>
            <div className="flex flex-col gap-1.5">
              {PRO_FEATURES.map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-[6px] text-[12px] text-[#475569] py-1"
                >
                  <span className="text-[#0E7B6C] font-bold text-[14px] shrink-0 leading-none mt-0.5">
                    ✓
                  </span>
                  <span className="text-[12px]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value nudge */}
        <div className="bg-[#ECFDF5] border border-[#6EE7B7] rounded-[8px] p-[11px_14px] text-center mb-[18px]">
          <span className="font-inter text-[13px] font-medium text-[#0E7B6C]">
            Pro pays for itself in under 1 extra signing per month.
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-[10px]">
          <button
            onClick={handleStartPro}
            disabled={isLoading}
            className={cn(
              "w-full h-[48px] rounded-[8px] bg-[#F59E0B] text-[#0F2C4E] font-inter font-bold text-[14px] flex items-center justify-center gap-[7px] transition-opacity",
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90",
            )}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
            </svg>
            {isLoading ? "Loading…" : "Start Pro — $19/month"}
          </button>

          <p className="text-[11px] text-[#94A3B8] text-center mt-1">
            Cancel any time · No commitment
          </p>

          <button
            onClick={handleContinueFree}
            disabled={isLoading}
            className="w-full h-[48px] border-[1.5px] border-[#0F2C4E] rounded-[8px] font-inter font-bold text-[14px] text-[#0F2C4E] bg-white hover:bg-slate-50 transition-colors"
          >
            Continue with Free
          </button>
        </div>

        {/* Annual nudge */}
        <div className="bg-[#FFFBEB] border-l-[3px] border-[#D97706] rounded-r-[8px] p-[11px_14px] mt-[14px] flex items-center gap-[8px]">
          <span className="text-[#D97706] shrink-0">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
            </svg>
          </span>
          <span className="font-inter text-[13px] font-medium text-[#D97706]">
            Annual plan: $208/year — save $20 versus monthly
          </span>
        </div>
      </div>
    </div>
  );
}
