import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featureHighlights, site } from "@/config/marketing";
import { iconMap } from "@/components/landing/icons";

export function FeatureHighlights() {
  return (
    <div className="bg-white px-6 py-12 md:px-12 md:py-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <span className="mb-[14px] inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.3px] text-blue-600">
          Everything in one place
        </span>
        <h2 className="mb-3 font-sora text-3xl font-bold leading-[1.2] tracking-[-0.5px] text-navy md:text-4xl">
          Built for how you actually work
        </h2>
        <p className="text-base leading-[1.7] text-slate-500">
          Five core features. Each one solves a real daily pain. None of them
          exist in any other notary tool.
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-[860px] grid-cols-1 gap-6 md:grid-cols-3">
        {featureHighlights.map((feature) => {
          const Icon = iconMap[feature.icon];
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-[14px] border border-border bg-slate-50 p-6 transition-colors duration-150 hover:border-blue-200 hover:bg-blue-bg"
            >
              <div className="mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-blue-50 text-blue-600">
                {Icon && <Icon className="h-5 w-5" />}
              </div>
              <div className="mb-2 font-sora text-base font-bold text-navy">
                {feature.title}
              </div>
              <div className="text-[13px] leading-[1.6] text-slate-500">
                {feature.desc}
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600">
                Learn more
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/features"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-hover"
        >
          Explore all of {site.name}&apos;s features
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
