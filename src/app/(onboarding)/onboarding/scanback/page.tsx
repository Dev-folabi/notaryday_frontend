"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Scan, ArrowRight, ArrowLeft, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const SCANBACK_OPTIONS = [20, 25, 30, 35, 40];
const DEFAULT_SCANBACK = 30;

export default function OnboardingScanbackPage() {
  const router = useRouter();
  const { saveScanback } = useOnboarding();
  const { setOnboardingStep } = useUIStore();

  const [scanbackDuration, setScanbackDuration] = useState(DEFAULT_SCANBACK);

  // Set step on mount
  useState(() => {
    setOnboardingStep(2);
  });

  const handleSubmit = async () => {
    saveScanback.mutate({ 
      scanback_duration_mins: scanbackDuration,
      irs_rate_per_mile: 0.67 
    }, {
      onSuccess: () => {
        router.push("/onboarding/signing-types");
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-white lg:bg-bg">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm lg:shadow-none">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-bg flex items-center justify-center mb-6 text-amber-warning shadow-sm shadow-amber-500/5">
          <Scan className="w-8 h-8" />
        </div>

        <h1 className="font-sora font-extrabold text-[32px] text-primary-navy mb-4 leading-tight tracking-tight">
          How long is your <br /> scanback?
        </h1>
        <p className="font-inter text-base text-slate-secondary leading-relaxed mb-10">
          Notary Day blocks this time in your calendar automatically after every loan signing. <strong className="text-primary-navy">No other tool does this.</strong>
        </p>

        <div className="flex flex-col gap-8">
          <div>
            <label className="font-inter font-bold text-xs text-primary-navy uppercase tracking-widest block mb-4">
              Choose your typical duration
            </label>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {SCANBACK_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setScanbackDuration(mins)}
                  className={cn(
                    "h-12 rounded-12px border-2 text-sm font-inter font-bold transition-all",
                    scanbackDuration === mins
                      ? "bg-blue-bg border-interactive-blue text-interactive-blue shadow-sm shadow-blue-500/10"
                      : "bg-white border-border text-slate-secondary hover:border-slate-300"
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-bg border border-border rounded-16px group focus-within:border-interactive-blue transition-colors">
              <span className="font-inter text-sm font-bold text-primary-navy">Custom duration</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={scanbackDuration}
                  onChange={(e) => setScanbackDuration(parseInt(e.target.value) || DEFAULT_SCANBACK)}
                  className="w-16 bg-transparent text-right font-inter font-extrabold text-interactive-blue focus:outline-none"
                />
                <span className="font-inter text-xs font-bold text-muted uppercase tracking-wider">min</span>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-4">
            <label className="font-inter font-bold text-xs text-primary-navy uppercase tracking-widest block">
              How this looks in your schedule
            </label>
            <div className="border-2 border-border rounded-20px overflow-hidden shadow-sm bg-white">
              <div className="border-l-4 border-l-primary-navy px-5 py-4 border-b border-border">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-inter text-sm font-bold text-primary-navy">Loan Refi (Buyer)</div>
                  <span className="text-[10px] font-bold text-muted">9:00 AM</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-secondary">
                  <MapPin className="w-3 h-3" />
                  3847 Wilshire Blvd, LA
                </div>
              </div>
              <div className="bg-amber-bg/40 border-l-4 border-l-amber-warning px-5 py-3 flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Scan className="w-3 h-3 text-amber-warning" />
                  </div>
                  <span className="font-inter text-xs font-bold text-amber-warning italic uppercase tracking-wider">
                    Scanback window
                  </span>
                </div>
                <span className="font-inter text-[11px] font-extrabold text-amber-warning/70">
                  {scanbackDuration} MIN
                </span>
              </div>
              <div className="border-l-4 border-l-slate-200 px-5 py-4 border-t border-border bg-slate-50/50 opacity-60">
                <div className="font-inter text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Next slot available</div>
                <div className="font-inter text-xs font-medium text-slate-400">
                  Starts at {(9 + Math.floor((45 + scanbackDuration) / 60)).toString().padStart(2, "0")}:{(45 + scanbackDuration) % 60} AM
                </div>
              </div>
            </div>
            <p className="font-inter text-[11px] text-muted font-medium text-center px-4 leading-relaxed">
              We precisely block the time you need to scan between signings so you never overpromise.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleSubmit} 
              isLoading={saveScanback.isPending}
              className="h-14 text-base font-extrabold rounded-16px bg-interactive-blue hover:bg-blue-hover shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              Continue to last step
              <ArrowRight className="w-5 h-5" />
            </Button>

            <button
              onClick={() => router.push("/onboarding/home")}
              className="flex items-center justify-center gap-2 font-inter text-sm font-bold text-slate-secondary hover:text-primary-navy transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
