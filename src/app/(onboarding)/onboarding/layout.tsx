"use client";

import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MapPin, Scan, Briefcase, Sparkles } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { onboardingStep } = useUIStore();

  const steps = [
    { id: 1, label: "Home base", icon: MapPin },
    { id: 2, label: "Scanback", icon: Scan },
    { id: 3, label: "Signing types", icon: Briefcase },
    { id: 4, label: "Plan", icon: Sparkles },
  ];

  const currentStep = onboardingStep || 1;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-border h-14 flex items-center justify-between px-4 safe-area-top">
        <button
          onClick={() => router.push("/")}
          className="font-inter text-sm text-slate-secondary"
        >
          Skip for now
        </button>
        <div className="flex items-center gap-1.5">
          {steps.map((s) => (
            <div
              key={s.id}
              className={cn(
                "w-7 h-1 rounded-full transition-colors",
                s.id <= currentStep ? "bg-primary-navy" : "bg-border"
              )}
            />
          ))}
        </div>
        <span className="font-inter text-xs text-muted">{currentStep} of {steps.length}</span>
      </div>

      {/* Mobile content padding */}
      <div className="h-14 lg:hidden" />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-60 bg-white border-r border-border flex-col flex-shrink-0">
          <div className="h-14 flex items-center px-5 border-b border-border">
            <span className="font-sora font-semibold text-base text-primary-navy tracking-tight">
              Notary Day
            </span>
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 transition-opacity",
                    s.id > currentStep ? "opacity-40" : "opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    s.id === currentStep ? "bg-blue-bg text-interactive-blue" :
                    s.id < currentStep ? "bg-teal-bg text-teal-success" : "bg-bg text-slate-secondary"
                  )}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">Step {s.id}</div>
                    <div className="font-inter text-sm font-semibold text-primary-navy">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
