"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { billingApi } from "@/api/billing.api";
import { cn } from "@/lib/utils";
import { ApiResponse } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, Sparkles, X } from "lucide-react";
import Link from "next/link";

// Billing-management actions are hidden during the trial rollout.
// Restore them by flipping this to true — code stays in place.
const SHOW_BILLING_MANAGEMENT = false;

export default function BillingTab() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  const { data: billingStatus } = useQuery({
    queryKey: ["billing-status"],
    queryFn: async () => {
      const res = (await billingApi.getStatus()) as unknown as ApiResponse<{
        plan?: string;
        planExpiresAt?: string | null;
        isTrial?: boolean;
      }>;
      return res.data;
    },
    retry: false,
  });

  const isTrial = billingStatus?.isTrial ?? false;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);

  const renewalDate = billingStatus?.planExpiresAt
    ? new Date(billingStatus.planExpiresAt).toLocaleDateString()
    : "—";

  const handleSwitchAnnual = async () => {
    try {
      const res = (await billingApi.subscribe({
        plan: "pro_annual",
      })) as unknown as ApiResponse<{ checkoutUrl?: string }>;
      const url = res.data?.checkoutUrl;
      if (url) window.location.href = url;
      else addToast({ type: "info", title: "Switching to annual" });
    } catch {
      addToast({ type: "error", title: "Could not start annual checkout" });
    }
  };

  const handlePortal = async () => {
    try {
      const res = (await billingApi.getPortalUrl()) as unknown as ApiResponse<{
        portalUrl?: string;
      }>;
      const url = res.data?.portalUrl;
      if (url) window.open(url, "_blank");
    } catch {
      addToast({ type: "error", title: "Could not open portal" });
    }
  };

  const confirmCancelPlan = async () => {
    setCancelBusy(true);
    try {
      await billingApi.cancel();
      await qc.invalidateQueries({ queryKey: ["billing-status"] });
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      setShowCancelModal(false);
      addToast({ type: "success", title: "Pro cancelled from next renewal" });
    } catch {
      addToast({ type: "error", title: "Could not cancel plan" });
    } finally {
      setCancelBusy(false);
    }
  };

  return (
    <>
      <div className="card p-4 mb-4 border" style={{ borderColor: "var(--navy)", background: "linear-gradient(135deg,#EFF6FF 0%,#fff 100%)" }}>
        <div className="flex justify-between gap-2.5 mb-2.5 flex-wrap">
          <div>
            <div className="flex gap-1.5 mb-1 flex-wrap">
              <span className={cn("chip", isPro ? "c-pro" : "c-free")}>{isTrial ? "pro trial" : isPro ? "pro" : "free"}</span>
              <span className="font-inter text-[11px] text-teal-success font-semibold flex gap-1 items-center"><Check className="w-3 h-3" /> Active</span>
            </div>
            <div className="font-sora text-[18px] font-bold text-navy">
              {isTrial ? "Free" : isPro ? "$19" : "$0"} <span className="font-inter text-[12px] font-normal text-slate-secondary">{isTrial ? "for 30 days" : isPro ? "/month" : "/forever"}</span>
            </div>
            <div className="font-inter text-[11px] text-slate-secondary mt-0.5">
              {isTrial ? (
                <>Trial ends: <strong className="text-navy">{renewalDate}</strong></>
              ) : (
                <>Next renewal: <strong className="text-navy">{isPro ? renewalDate : "—"}</strong></>
              )}
            </div>
          </div>
          {isPro && SHOW_BILLING_MANAGEMENT && (
            <button className="btn-sm flex-shrink-0" onClick={handleSwitchAnnual}>
              Switch to Annual, save $99
            </button>
          )}
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between py-2.5 border-b border-border gap-2"><span className="font-inter text-[11px] text-slate-secondary">Plan</span><span className="font-inter text-[11px] font-semibold text-navy">{isTrial ? "Pro Trial (Monthly)" : isPro ? "Pro Monthly" : "Free"}</span></div>
        <div className="flex justify-between py-2.5 border-b border-border gap-2"><span className="font-inter text-[11px] text-slate-secondary">Billing cycle</span><span className="font-inter text-[11px] font-semibold text-navy">{isTrial ? "Trial" : isPro ? "Monthly" : "—"}</span></div>
      </div>

      {SHOW_BILLING_MANAGEMENT && (
        <div className="card p-4 mb-4">
          <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><CreditCard className="w-4 h-4" /> Manage billing</div>
          <div className="flex justify-between gap-2.5 py-2.5 border-b border-border flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <div className="font-inter text-[12px] font-semibold text-navy">Update payment method</div>
              <div className="font-inter text-[11px] text-slate-secondary mt-0.5">Change or update the card on file via Stripe portal.</div>
            </div>
            <button className="btn-sm" onClick={handlePortal}>Update card</button>
          </div>
          <div className="flex justify-between gap-2.5 py-2.5 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <div className="font-inter text-[12px] font-semibold text-navy">View invoice history</div>
              <div className="font-inter text-[11px] text-slate-secondary mt-0.5">Download receipts for all past payments.</div>
            </div>
            <button className="btn-sm" onClick={handlePortal}>View invoices</button>
          </div>
        </div>
      )}

      {!isPro && (
        <div className="card p-4 mb-4">
          <div className="font-inter text-[12px] font-semibold text-navy mb-2">Upgrade to Pro</div>
          <p className="font-inter text-[12px] text-slate-secondary mb-3">Unlock route optimisation, booking page, email import, auto invoicing and more.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={handleSwitchAnnual} className="btn-pro flex-1"><Sparkles className="w-4 h-4" /> Upgrade to Pro</button>
            <Link href="/settings?tab=billing" className="btn-s flex-1">Compare plans</Link>
          </div>
        </div>
      )}

      {isPro && SHOW_BILLING_MANAGEMENT && (
        <div className="card p-4 mb-4">
          <div className="flex justify-between gap-2.5 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <div className="font-inter text-[12px] font-semibold text-navy">Cancel Pro plan</div>
              <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mt-0.5">Your Pro access continues until {renewalDate || "your renewal date"}. After that, account moves to Free. All data stays.</div>
            </div>
            <button className="btn-danger-gh" onClick={() => setShowCancelModal(true)}><X className="w-3.5 h-3.5" /> Cancel plan</button>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(9,18,30,.45)" }}>
          <div className="bg-white rounded-[16px] w-full max-w-[440px] overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2"><X className="w-5 h-5 text-red" /><span className="font-sora font-bold text-[16px]">Cancel Pro plan</span></div>
              <div className="alert al-amber mb-4">
                <span className="text-amber flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></span>
                <div className="font-inter text-[11px] leading-[1.4]">Your Pro access continues until {renewalDate || "your renewal date"}. After that your account moves to Free — route optimisation, booking page, email import and auto invoicing are locked. All data stays.</div>
              </div>
              <div className="flex flex-col gap-2.5">
                <button onClick={confirmCancelPlan} disabled={cancelBusy} className="btn-danger" style={{ width: "100%" }}><X className="w-3.5 h-3.5" /> {cancelBusy ? "Cancelling…" : "Yes, cancel Pro"}</button>
                <button onClick={() => setShowCancelModal(false)} className="btn-gh" style={{ width: "100%" }}><Check className="w-3.5 h-3.5" /> Keep Pro — don&apos;t cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}