import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PricingTeaser() {
  return (
    <div className="bg-slate-50 px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto grid max-w-[860px] items-center gap-8 rounded-2xl bg-white p-8 shadow-card md:grid-cols-[1fr_auto] md:p-10">
        <div>
          <div className="mb-1.5 font-sora text-2xl font-bold leading-[1.2] tracking-[-0.5px] text-navy">
            Free forever. Pro from $19/month.
          </div>
          <p className="text-sm leading-[1.7] text-slate-500">
            Start with unlimited CITT checks and a legally compliant journal,
            no credit card. Upgrade when one extra signing per month pays for
            it.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-navy px-5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-active"
          >
            Start for free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] border border-navy px-5 text-[13px] font-semibold text-navy transition-colors hover:bg-background"
          >
            Compare plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
