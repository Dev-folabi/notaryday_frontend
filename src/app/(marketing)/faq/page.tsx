import type { Metadata } from "next";
import { PageHeader } from "@/components/landing/PageHeader";
import { CTABand } from "@/components/landing/CTABand";
import { faq } from "@/config/marketing";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the questions notaries ask us about CITT, scanbacks, the booking page, and data safety.",
};

export default function FAQPage() {
  return (
    <>
      <PageHeader eyebrow={faq.eyebrow} title={faq.title} />
      <div className="bg-white px-6 pb-16 md:px-12 md:pb-[72px]">
        <div className="mx-auto grid max-w-[860px] grid-cols-1 gap-5 md:grid-cols-2">
          {faq.items.map((item) => (
            <div
              key={item.q}
              className="rounded-[12px] border border-border bg-slate-50 p-5"
            >
              <div className="mb-2 text-sm font-semibold text-navy">
                {item.q}
              </div>
              <div className="text-[13px] leading-[1.6] text-slate-500">
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>
      <CTABand />
    </>
  );
}
