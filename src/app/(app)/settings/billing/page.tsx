"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { billingApi } from "@/api/billing.api";
import { Sparkles, ExternalLink, CreditCard } from "lucide-react";

export default function BillingPage() {
  const { user } = useAuth();
  const isPro = user?.plan === "PRO" || user?.plan === "PRO_ANNUAL";

  const { data: status } = useQuery({
    queryKey: ["billing-status"],
    queryFn: async () => {
      const res = await billingApi.getStatus();
      const p = (res as any).data ?? res;
      return (p.data ?? p) as any;
    },
  });

  const handleUpgrade = async (plan: "pro_monthly" | "pro_annual") => {
    try {
      const res = await billingApi.subscribe({ plan });
      const url = (res as any)?.checkoutUrl ?? (res as any)?.data?.checkoutUrl;
      if (url) window.location.href = url;
    } catch {}
  };

  const handlePortal = async () => {
    try {
      const res = await billingApi.getPortalUrl();
      const url = (res as any)?.portalUrl ?? (res as any)?.data?.portalUrl;
      if (url) window.open(url, "_blank");
    } catch {}
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="font-sora font-bold text-xl text-primary-navy mb-6">
        Plan & Billing
      </h1>

      {/* Current plan */}
      <div className="bg-white border border-border rounded-12px p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-inter text-sm font-semibold text-primary-navy">
              Current plan
            </div>
            <div className="font-sora text-2xl font-bold text-primary-navy mt-1">
              {isPro ? "Pro" : "Free"}
            </div>
          </div>
          {isPro && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-pro-gold/20 text-amber-warning rounded-full text-xs font-bold">
              <Sparkles className="w-3 h-3" /> Active
            </span>
          )}
        </div>
        {status?.planExpiresAt && (
          <p className="font-inter text-xs text-slate-secondary">
            Renews: {new Date(status.planExpiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Upgrade or manage */}
      {isPro ? (
        <div className="bg-white border border-border rounded-12px p-5 mb-4">
          <div className="font-inter text-sm font-semibold text-primary-navy mb-3">
            Manage subscription
          </div>
          <button
            onClick={handlePortal}
            className="inline-flex items-center gap-2 h-10 px-4 border border-primary-navy text-primary-navy rounded-8px font-inter text-sm font-semibold"
          >
            <ExternalLink className="w-4 h-4" /> Open billing portal
          </button>
        </div>
      ) : (
        <div className="bg-white border-2 border-primary-navy rounded-12px p-5 mb-4">
          <div className="font-inter text-sm font-semibold text-primary-navy mb-1">
            Upgrade to Pro
          </div>
          <p className="font-inter text-xs text-slate-secondary mb-4">
            Route optimisation, booking page, auto invoicing, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleUpgrade("pro_monthly")}
              className="flex-1 h-11 bg-pro-gold text-primary-navy rounded-8px font-inter font-bold text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> $19/month
            </button>
            <button
              onClick={() => handleUpgrade("pro_annual")}
              className="flex-1 h-11 border-2 border-primary-navy text-primary-navy rounded-8px font-inter font-bold text-sm flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" /> $208/year — save $20
            </button>
          </div>
        </div>
      )}

      {/* Features comparison */}
      <div className="bg-white border border-border rounded-12px p-5">
        <div className="font-inter text-xs font-semibold text-slate-secondary uppercase tracking-wide mb-3">
          What&apos;s included in Pro
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            "Route optimisation",
            "Scanback blocking",
            "Gap Finder",
            "Booking page",
            "Email import",
            "Auto invoicing",
            "Tax reports",
            "Calendar sync",
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-2 font-inter text-sm text-slate-body"
            >
              <span className="text-teal-success font-bold">✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
