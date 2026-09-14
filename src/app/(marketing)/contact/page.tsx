import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/landing/PageHeader";
import { CTABand } from "@/components/landing/CTABand";
import { AnimateIn } from "@/components/landing/animations/AnimateIn";
import { DotGrid } from "@/components/landing/backgrounds/DotGrid";
import { contact } from "@/config/marketing";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Notary Day team for support, feedback, partnerships, and press.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow={contact.eyebrow}
        title={contact.title}
        subtitle={contact.subtitle}
      />
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/20 to-white px-6 pb-12 md:px-12 md:pb-[72px]">
        <DotGrid className="opacity-20" dotSpacing={32} />

        <div className="relative z-10">
          <AnimateIn variant="scale" delay={100}>
            <div className="mx-auto mb-12 max-w-[640px]">
              <a
                href={`mailto:${contact.email}`}
                className="group relative flex flex-col items-center gap-3 rounded-[14px] border border-border bg-white/80 backdrop-blur-sm p-8 text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex h-12 w-12 items-center justify-center rounded-[12px] bg-gradient-to-br from-navy to-navy-active text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="relative">
                  <div className="font-sora text-lg font-bold text-navy">
                    {contact.email}
                  </div>
                  <div className="mt-1 text-[13px] text-slate-500">
                    {contact.responseTime}
                  </div>
                </div>
              </a>
            </div>
          </AnimateIn>

          <div className="mx-auto grid max-w-[860px] grid-cols-1 gap-6 md:grid-cols-3">
            {contact.channels.map((channel, index) => (
              <AnimateIn key={channel.title} variant="slide-up" delay={200 + index * 100}>
                <div className="group rounded-[14px] border border-border bg-white/60 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200">
                  <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="relative">
                    <div className="mb-2 font-sora text-base font-bold text-navy">
                      {channel.title}
                    </div>
                    <div className="text-[13px] leading-[1.6] text-slate-500">
                      {channel.desc}
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
      <CTABand />
    </>
  );
}
