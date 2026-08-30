import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, Check } from "lucide-react";
import { pricing } from "@/config/marketing";

const buttonVariant = (variant: string) =>
  variant === "pro" ? ("pro" as const) : ("secondary" as const);

export function Pricing({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div id="pricing" className="bg-slate-50 px-6 py-12 md:px-12 md:py-[72px]">
      {showHeader && (
        <div className="mx-auto max-w-[600px] text-center">
          <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
            {pricing.eyebrow}
          </span>
          <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
            {pricing.title}
          </h2>
          <p className="text-base leading-[1.7] text-slate-500">
            {pricing.subtitle}
          </p>
        </div>
      )}
      <div className={`${showHeader ? "mt-10" : ""} mx-auto grid max-w-[760px] grid-cols-1 gap-6 md:grid-cols-2`}>
        {pricing.plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-1 flex-col rounded-[12px] p-[18px] md:p-[22px] ${
              plan.popular
                ? "border-2 border-navy bg-white"
                : "border-[1.5px] border-border bg-white"
            }`}
          >
            <div
              className={`flex items-center justify-between ${
                plan.popular ? "mb-3" : "mb-3"
              }`}
            >
              <span
                className={`inline-flex items-center gap-[3px] rounded px-2 py-[3px] text-[10px] font-semibold uppercase ${
                  plan.popular
                    ? "bg-amber-500 font-bold text-navy"
                    : "bg-border text-slate-500"
                }`}
              >
                {plan.name}
              </span>
              {plan.popular && (
                <span className="text-[11px] font-medium text-teal-600">
                  Most popular
                </span>
              )}
            </div>
            <div className="my-2.5 font-sora text-[28px] font-bold leading-none text-navy">
              {plan.price}{" "}
              <span className="font-inter text-sm font-normal text-slate-500">
                {plan.cadence}
              </span>
            </div>
            <p className="mb-1 text-xs text-slate-400">{plan.tagline}</p>
            {plan.note && (
              <p className="mb-3.5 text-xs font-medium text-teal-600">
                {plan.note}
              </p>
            )}
            <div className="mb-3.5 h-px bg-border"></div>
            <div className="flex-1">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-1.5 py-1 text-xs text-slate-600"
                >
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600"
                    strokeWidth={3}
                  />
                  {feature}
                </div>
              ))}
            </div>
            <Link href={plan.cta.href} className="mt-5 block w-full">
              <Button
                variant={buttonVariant(plan.cta.variant)}
                className={`w-full ${
                  plan.popular ? "h-[48px] text-[14px] font-bold" : "h-11 text-[13px]"
                }`}
                fullWidth
              >
                {plan.popular && <Sparkles className="h-[13px] w-[13px]" />}
                {plan.cta.label}
              </Button>
            </Link>
            {plan.footnote && (
              <p className="mt-2 text-center text-[11px] text-slate-400">
                {plan.footnote}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
