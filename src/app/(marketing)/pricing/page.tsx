import type { Metadata } from "next";
import { PageHeader } from "@/components/landing/PageHeader";
import { Pricing } from "@/components/landing/Pricing";
import { PricingFAQ } from "@/components/landing/PricingFAQ";
import { CTABand } from "@/components/landing/CTABand";
import { pricing } from "@/config/marketing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free forever. Pro from $19/month. Pricing for mobile notaries.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow={pricing.eyebrow}
        title={pricing.title}
        subtitle={pricing.subtitle}
      />
      <Pricing showHeader={false} />
      <PricingFAQ />
      <CTABand />
    </>
  );
}
