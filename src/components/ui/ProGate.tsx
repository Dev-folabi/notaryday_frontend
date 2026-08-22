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
        <div className="flex items-center justify-between gap-3 bg-white border border-border rounded-[14px] px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-amber-bg border border-amber-b flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-amber-warning" />
            </div>
            <div className="min-w-0">
              <p className="font-inter text-sm font-semibold text-primary-navy truncate">
                {feature ?? "This feature"} is a Pro feature
              </p>
              <p className="font-inter text-xs text-slate-secondary">
                Upgrade to Pro to get access to premium features
              </p>
            </div>
          </div>
          <Link
            href="/settings?tab=billing"
            className="inline-flex items-center gap-1.5 bg-pro-gold text-primary-navy font-inter font-bold text-xs rounded-button h-9 px-4 flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade to Pro
          </Link>
        </div>
        {children}
      </div>
    </ProGateContext.Provider>
  );
}
