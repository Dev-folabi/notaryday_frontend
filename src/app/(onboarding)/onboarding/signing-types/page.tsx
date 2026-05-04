"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUIStore } from "@/store/uiStore";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/Button";
import { Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SIGNING_TYPES = [
  {
    key: "LOAN_REFI",
    label: "Loan Signings (Refi)",
    desc: "Refinance and purchase loan documents. Includes scanback.",
    badge: "Most common",
    icon: "📝",
    defaultSigning: 60,
    defaultScanback: 30,
  },
  {
    key: "HYBRID",
    label: "Hybrid Signings",
    desc: "Mix of wet and e-signatures. Also requires scanback.",
    icon: "🔀",
    defaultSigning: 75,
    defaultScanback: 30,
  },
  {
    key: "GENERAL",
    label: "General Notary Work",
    desc: "Wills, POA, affidavits, acknowledgements. No scanback.",
    icon: "📄",
    defaultSigning: 30,
    defaultScanback: 0,
  },
  {
    key: "PURCHASE_CLOSING",
    label: "Purchase Closing",
    desc: "Real estate purchase transaction signings.",
    icon: "🏠",
    defaultSigning: 60,
    defaultScanback: 30,
  },
  {
    key: "FIELD_INSPECTION",
    label: "Field Inspections",
    desc: "Property, vehicle, or business site inspections.",
    icon: "🔍",
    defaultSigning: 30,
    defaultScanback: 0,
  },
  {
    key: "APOSTILLE",
    label: "Apostille Services",
    desc: "Authentication of documents for international use.",
    icon: "🌐",
    defaultSigning: 45,
    defaultScanback: 0,
  },
];

export default function OnboardingSigningTypesPage() {
  const router = useRouter();
  const { saveSigningTypes } = useOnboarding();
  const { setOnboardingStep } = useUIStore();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "LOAN_REFI",
    "HYBRID",
    "GENERAL",
  ]);

  // Set step on mount
  useEffect(() => {
    setOnboardingStep(3);
  }, [setOnboardingStep]);

  const toggleType = (key: string) => {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) return;

    saveSigningTypes.mutate({
      signing_defaults: selectedTypes
        .filter((key) => SIGNING_TYPES.some((t) => t.key === key))
        .map((key) => {
          const type = SIGNING_TYPES.find((t) => t.key === key)!;
          return {
            signing_type: key,
            signing_duration_mins: type.defaultSigning,
            scanback_duration_mins: type.defaultScanback,
          };
        }),
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-white lg:bg-bg">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm lg:shadow-none">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-bg flex items-center justify-center mb-6 text-interactive-blue shadow-sm shadow-blue-500/5">
          <Sparkles className="w-8 h-8" />
        </div>

        <h1 className="font-sora font-extrabold text-[32px] text-primary-navy mb-4 leading-tight tracking-tight">
          What signings <br /> do you do?
        </h1>
        <p className="font-inter text-base text-slate-secondary leading-relaxed mb-10">
          Your booking page and Gap Finder will only show relevant job types.
          Select all that apply.
        </p>

        <div className="flex flex-col gap-4 mb-10">
          {SIGNING_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type.key);
            return (
              <div
                key={type.key}
                onClick={() => toggleType(type.key)}
                className={cn(
                  "group relative bg-white border-2 rounded-20px p-5 cursor-pointer transition-all duration-200",
                  isSelected
                    ? "border-primary-navy bg-white shadow-md shadow-navy/5"
                    : "border-border hover:border-slate-300",
                )}
              >
                <div
                  className={cn(
                    "absolute top-5 right-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    isSelected
                      ? "bg-primary-navy border-primary-navy"
                      : "bg-white border-border group-hover:border-slate-300",
                  )}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>

                <div className="flex items-start gap-4 pr-8">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-14px flex items-center justify-center text-2xl flex-shrink-0 transition-colors",
                      isSelected ? "bg-blue-bg" : "bg-bg",
                    )}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-inter text-base font-bold text-primary-navy leading-none">
                        {type.label}
                      </span>
                      {type.badge && (
                        <span className="font-inter text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-bg text-teal-success border border-teal-b uppercase tracking-wider">
                          {type.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-inter text-xs text-slate-secondary font-medium leading-relaxed">
                      {type.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleSubmit}
            isLoading={saveSigningTypes.isPending}
            disabled={selectedTypes.length === 0 || saveSigningTypes.isPending}
            className={cn(
              "h-14 text-base font-extrabold rounded-16px transition-all shadow-lg",
              selectedTypes.length === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-interactive-blue text-white hover:bg-blue-hover shadow-blue-500/25 active:scale-[0.98]",
            )}
          >
            Complete setup
            <Check className="w-5 h-5" />
          </Button>

          <button
            onClick={() => router.push(ROUTES.ONBOARDING.SCANBACK)}
            className="flex items-center justify-center gap-2 font-inter text-sm font-bold text-slate-secondary hover:text-primary-navy transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
