"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { billingApi } from "@/api/billing.api";
import { useUIStore } from "@/store/uiStore";
import { Sparkles, Check, Lock, CreditCard, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  const { data: status } = useQuery({
    queryKey: ["billing-status"],
    queryFn: async () => {
      const res = await billingApi.getStatus();
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any;
    },
    retry: false,
  });

  const handleUpgrade = async (plan: "pro_monthly" | "pro_annual") => {
    try {
      const res = await billingApi.subscribe({ plan });
      const url = (res as any)?.checkoutUrl ?? (res as any)?.data?.checkoutUrl;
      if (url) window.location.href = url;
      else addToast({ type: "error", title: "No checkout URL returned" });
    } catch {
      addToast({ type: "error", title: "Could not start checkout" });
    }
  };

  const handlePortal = async () => {
    try {
      const res = await billingApi.getPortalUrl();
      const url = (res as any)?.portalUrl ?? (res as any)?.data?.portalUrl;
      if (url) window.open(url, "_blank");
    } catch {
      addToast({ type: "error", title: "Could not open portal" });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Plan &amp; billing</div>
      </div>

      <div className="con">
        {/* Current plan */}
        <div className="card p-4 mb-4 border" style={{ borderColor: "var(--navy)", background: "linear-gradient(135deg,#EFF6FF 0%,#fff 100%)" }}>
          <div className="flex justify-between gap-2.5 mb-2.5 flex-wrap">
            <div>
              <div className="flex gap-1.5 mb-1 flex-wrap">
                <span className={cn("chip", isPro ? "c-pro" : "c-free")}>{isPro ? "pro" : "free"}</span>
                <span className="font-inter text-[11px] text-teal-success font-semibold flex gap-1 items-center"><Check className="w-3 h-3" /> Active</span>
              </div>
              <div className="font-sora text-[18px] font-bold text-navy">
                ${isPro ? "19" : "0"} <span className="font-inter text-[12px] font-normal text-slate-secondary">{isPro ? "/month" : "/forever"}</span>
              </div>
              <div className="font-inter text-[11px] text-slate-secondary mt-0.5">
                Next renewal: <strong className="text-navy">{status?.planExpiresAt ? new Date(status.planExpiresAt).toLocaleDateString() : "April 18, 2026"}</strong>
              </div>
            </div>
            <button className="btn-sm flex-shrink-0" onClick={() => addToast({ type: "info", title: "Switching to annual" })}>
              Switch to Annual, save $99
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="card p-4 border">
            <span className="chip c-free">Free</span>
            <div className="font-sora text-[28px] font-bold text-navy leading-none mt-2.5 mb-1">$0</div>
            <p className="font-inter text-[12px] text-muted mb-3">No credit card. No expiry.</p>
            {!isPro && <button className="btn-s w-full" onClick={() => addToast({ type: "info", title: "You are on Free" })}>Current plan</button>}
          </div>

          <div className="card p-4 border-2" style={{ borderColor: "var(--navy)" }}>
            <span className="chip c-pro">Pro</span>
            <div className="font-sora text-[28px] font-bold text-navy leading-none mt-2.5 mb-1">$19<span className="font-inter text-[14px] font-normal text-slate-secondary">/mo</span></div>
            <p className="font-inter text-[12px] text-muted mb-3">Monthly, cancel anytime.</p>
            {isPro ? (
              <button className="btn-s w-full" onClick={handlePortal}>Manage</button>
            ) : (
              <button className="btn-pro w-full" onClick={() => handleUpgrade("pro_monthly")}><Sparkles className="w-4 h-4" /> Upgrade to Pro</button>
            )}
          </div>

          <div className="card p-4 border">
            <span className="chip c-pro">Pro Annual</span>
            <div className="font-sora text-[28px] font-bold text-navy leading-none mt-2.5 mb-1">$199<span className="font-inter text-[14px] font-normal text-slate-secondary">/yr</span></div>
            <p className="font-inter text-[12px] text-muted mb-3">$16.67/mo — save $40.</p>
            {isPro ? (
              <button className="btn-s w-full" onClick={handlePortal}>Manage</button>
            ) : (
              <button className="btn-s w-full" onClick={() => handleUpgrade("pro_annual")}><CreditCard className="w-4 h-4" /> Choose annual</button>
            )}
          </div>
        </div>

        {/* Manage billing */}
        <div className="card p-4 mb-4">
          <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><Lock className="w-4 h-4" /> Manage billing</div>
          <div className="flex justify-between gap-2.5 py-2.5 border-b border-border flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <div className="font-inter text-[12px] font-semibold text-navy">Update payment method</div>
              <div className="font-inter text-[11px] text-slate-secondary mt-0.5">Change or update the card on file via Stripe portal.</div>
            </div>
            <button className="btn-sm" onClick={handlePortal}><ExternalLink className="w-3.5 h-3.5" /> Update card</button>
          </div>
          <div className="flex justify-between gap-2.5 py-2.5 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <div className="font-inter text-[12px] font-semibold text-navy">View invoice history</div>
              <div className="font-inter text-[11px] text-slate-secondary mt-0.5">Download receipts for all past payments.</div>
            </div>
            <button className="btn-sm" onClick={() => addToast({ type: "info", title: "Opening invoices" })}>View invoices</button>
          </div>
        </div>

        {isPro && (
          <div className="card p-4 mb-4">
            <div className="flex justify-between gap-2.5 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <div className="font-inter text-[12px] font-semibold text-navy">Cancel Pro plan</div>
                <div className="font-inter text-[11px] text-slate-secondary leading-[1.4] mt-0.5">Your Pro access continues until your renewal date. After that, account moves to Free. All data stays.</div>
              </div>
              <button className="btn-danger-gh" onClick={() => addToast({ type: "info", title: "Cancel requested" })}><X className="w-3.5 h-3.5" /> Cancel plan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
