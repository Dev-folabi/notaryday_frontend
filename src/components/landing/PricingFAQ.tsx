import { Info } from "lucide-react";
import { pricing } from "@/config/marketing";

export function PricingFAQ() {
  return (
    <div className="bg-slate-50 px-6 pb-16 md:px-12 md:pb-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <h2 className="font-sora text-2xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-3xl">
          Pricing questions
        </h2>
      </div>
      <div className="mx-auto mt-8 grid max-w-[760px] grid-cols-1 gap-5 md:grid-cols-2">
        {pricing.faq.map((item) => (
          <div
            key={item.q}
            className="rounded-[12px] border border-border bg-white p-5"
          >
            <div className="mb-2 flex items-start gap-2 text-sm font-semibold text-navy">
              <Info
                className="mt-0.5 h-[13px] w-[13px] shrink-0"
                strokeWidth={2}
              />
              <span>{item.q}</span>
            </div>
            <div className="text-[13px] leading-[1.6] text-slate-500">
              {item.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
