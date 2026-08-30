import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/landing/PageHeader";
import { CTABand } from "@/components/landing/CTABand";
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
      <div className="bg-white px-6 pb-12 md:px-12 md:pb-[72px]">
        <div className="mx-auto mb-12 max-w-[640px]">
          <a
            href={`mailto:${contact.email}`}
            className="flex flex-col items-center gap-3 rounded-[14px] border border-border bg-slate-50 p-8 text-center transition-colors duration-150 hover:border-blue-200 hover:bg-blue-bg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-navy text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="font-sora text-lg font-bold text-navy">
                {contact.email}
              </div>
              <div className="mt-1 text-[13px] text-slate-500">
                {contact.responseTime}
              </div>
            </div>
          </a>
        </div>
        <div className="mx-auto grid max-w-[860px] grid-cols-1 gap-6 md:grid-cols-3">
          {contact.channels.map((channel) => (
            <div
              key={channel.title}
              className="rounded-[14px] border border-border bg-white p-6"
            >
              <div className="mb-2 font-sora text-base font-bold text-navy">
                {channel.title}
              </div>
              <div className="text-[13px] leading-[1.6] text-slate-500">
                {channel.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
      <CTABand />
    </>
  );
}
