import type { Metadata } from "next";
import { PageHeader } from "@/components/landing/PageHeader";
import { Stats } from "@/components/landing/Stats";
import { CTABand } from "@/components/landing/CTABand";
import { about } from "@/config/marketing";

export const metadata: Metadata = {
  title: "About",
  description: "Why Notary Day exists and the problems it was built to solve.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={about.eyebrow}
        title={about.title}
        subtitle={about.subtitle}
      />
      <div className="bg-white px-6 pb-12 md:px-12 md:pb-[72px]">
        <div className="mx-auto max-w-[640px] space-y-5">
          {about.story.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-[15px] leading-[1.8] text-slate-600"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-12 md:px-12 md:py-[72px]">
        <div className="mx-auto grid max-w-[860px] grid-cols-1 gap-6 md:grid-cols-3">
          {about.values.map((value) => (
            <div
              key={value.title}
              className="rounded-[14px] border border-border bg-white p-6"
            >
              <div className="mb-2 font-sora text-base font-bold text-navy">
                {value.title}
              </div>
              <div className="text-[13px] leading-[1.6] text-slate-500">
                {value.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Stats />
      <CTABand />
    </>
  );
}
