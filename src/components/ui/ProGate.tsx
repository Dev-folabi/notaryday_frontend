"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function ProGate({ children, feature }: ProGateProps) {
  const { user } = useAuth();
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-14px">
        <div className="w-12 h-12 rounded-full bg-amber-bg border border-amber-b flex items-center justify-center mb-3">
          <Lock className="w-5 h-5 text-amber-warning" />
        </div>
        <p className="font-inter text-sm font-semibold text-primary-navy mb-1">
          {feature ?? "Pro feature"}
        </p>
        <p className="font-inter text-xs text-slate-secondary mb-3">
          Upgrade to unlock
        </p>
        <Link
          href="/settings?tab=billing"
          className="inline-flex items-center gap-1.5 bg-pro-gold text-primary-navy font-inter font-bold text-xs rounded-button h-9 px-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
