"use client";

import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PlanTier } from "@/types/user";

interface ProGateProps {
  children: React.ReactNode;
  isPro: boolean;
  benefitText?: string;
  className?: string;
}

export function ProGate({
  children,
  isPro,
  benefitText = "This feature is available on the Pro plan.",
  className,
}: ProGateProps) {
  const router = useRouter();

  return (
    <div className={cn("relative", className)}>
      {children}
      {!isPro && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-card z-10 flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-slate-100">
            <Lock className="h-5 w-5 text-slate-secondary" />
          </div>
          <p className="font-inter font-medium text-sm text-slate-body text-center px-6 max-w-xs">
            {benefitText}
          </p>
          <button
            onClick={() => router.push("/settings/billing")}
            className="bg-pro-gold text-primary-navy font-inter font-semibold text-sm rounded-button h-9 px-4 hover:bg-pro-gold/90 transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}
