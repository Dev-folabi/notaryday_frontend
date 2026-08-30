import type { Metadata } from "next";
import { PageHeader } from "@/components/landing/PageHeader";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTABand } from "@/components/landing/CTABand";
import { howItWorks } from "@/config/marketing";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Get set up in under 3 minutes. Set your home base, scanback duration, and signing types, then let Notary Day plan your day.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow={howItWorks.eyebrow}
        title={howItWorks.title}
        subtitle={howItWorks.subtitle}
      />
      <HowItWorks showHeader={false} />
      <CTABand />
    </>
  );
}
