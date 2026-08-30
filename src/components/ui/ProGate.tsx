"use client";

import { createContext, useContext } from "react";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

const ProGateContext = createContext(false);

/**
 * True when the surrounding ProGate is locking this feature (non-Pro user).
 * Use it to disable action buttons inside gated pages, e.g.
 * `disabled={useProGate() || saving}`.
 */
export function useProGate() {
  return useContext(ProGateContext);
}

export default function ProGate({ children, feature }: ProGateProps) {
  const { user } = useAuth();
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  if (isPro) {
    return (
      <ProGateContext.Provider value={false}>
        {children}
      </ProGateContext.Provider>
    );
  }

  return (
    <ProGateContext.Provider value={true}>
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center gap-3.5 bg-gradient-to-r from-[#fffdf5] to-[#fffbeb] border border-amber-border border-l-[3px] border-l-pro-gold rounded-xl px-4 py-3.5 shadow-sm">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-pro-gold/15 flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-inter text-[13px] font-semibold text-primary-navy">
              {feature ?? "This feature"} is a Pro feature
            </p>
            <p className="font-inter text-[12px] text-slate-secondary mt-0.5">
              Upgrade to unlock premium features
            </p>
          </div>
          <Link
            href="/settings?tab=billing"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pro-gold to-[#f59e0b] text-primary-navy font-inter font-bold text-[12px] rounded-lg h-9 px-4 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade
          </Link>
        </div>
        {children}
      </div>
    </ProGateContext.Provider>
  );
}
