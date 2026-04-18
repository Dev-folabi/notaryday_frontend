"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { billingApi } from "@/api/billing.api";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleStartPro = async () => {
    setIsLoading(true);
    try {
      // billingApi.subscribe expects a variantId from Lemon Squeezy
      // The monthly variant ID is configured in the backend env
      const result = (await billingApi.subscribe({ variantId: "monthly" })) as {
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

  const handleContinueFree = () => {
    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 bg-white lg:bg-bg overflow-y-auto">
      <div className="w-full max-w-[640px]">
        {/* Header */}
        <div className="mb-6">
          <span className="inline-block bg-gap-finder-bg text-violet-700 border border-violet-200 text-[11px] font-bold px-3 py-1 rounded-full mb-3">
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
        <div className="flex gap-3.5 mb-4">
          {/* Free card */}
          <div className="flex-1 border border-border rounded-[12px] p-5 bg-white">
            <span className="inline-block bg-border text-slate-body text-[10px] font-bold uppercase tracking-[0.2px] px-2 py-0.5 rounded mb-2.5">
              Free
            </span>
            <div className="font-sora font-bold text-[24px] text-primary-navy leading-none mb-0.5">
              $0
            </div>
            <p className="text-[12px] text-muted mb-3.5">
              No credit card. No expiry.
            </p>
            <div className="flex flex-col gap-1.5">
              {FREE_FEATURES.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-1.5 text-[12px] text-slate-secondary"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-success shrink-0" />{" "}
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Pro card */}
          <div className="flex-1 border-2 border-primary-navy rounded-[12px] p-5 bg-white relative">
            <div className="flex items-center justify-between mb-2.5">
              <span className="inline-block bg-pro-gold text-primary-navy text-[10px] font-bold uppercase tracking-[0.2px] px-2 py-0.5 rounded">
                Pro
              </span>
            </div>
            <div className="font-sora font-bold text-[24px] text-primary-navy leading-none mb-0.5">
              $19.99{" "}
              <span className="text-[13px] font-normal text-slate-secondary">
                /mo
              </span>
            </div>
            <p className="text-[12px] text-muted mb-3.5">
              or $199.99/yr — save $40
            </p>
            <div className="flex flex-col gap-1.5">
              {PRO_FEATURES.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-1.5 text-[12px] text-slate-secondary"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-success shrink-0" />{" "}
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value nudge */}
        <div className="bg-teal-bg border border-teal-b rounded-[8px] px-3.5 py-2.5 text-center mb-4">
          <span className="font-inter text-[13px] font-medium text-teal-success">
            Pro pays for itself in under 1 extra signing per month.
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleStartPro}
            disabled={isLoading}
            className={cn(
              "w-full h-11 rounded-button bg-pro-gold text-primary-navy font-inter font-semibold text-[15px] flex items-center justify-center gap-2 transition-opacity",
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90",
            )}
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? "Loading…" : "Start Pro — $19.99/month"}
          </button>

          <p className="text-[11px] text-muted text-center">
            Cancel any time · No commitment
          </p>

          <button
            onClick={handleContinueFree}
            className="w-full h-10 border border-border rounded-button font-inter font-medium text-sm text-slate-secondary hover:text-primary-navy hover:border-primary-navy transition-colors"
          >
            Continue with Free
          </button>
        </div>

        {/* Annual nudge */}
        <div className="bg-amber-bg border-l-[3px] border-amber-warning rounded-r-[8px] px-3.5 py-2.5 mt-3.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-warning shrink-0" />
          <span className="font-inter text-[13px] font-medium text-amber-warning">
            Annual plan: $199.99/year — save $40 versus monthly
          </span>
        </div>
      </div>
    </div>
  );
}
