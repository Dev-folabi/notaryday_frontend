import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { Stats } from "@/components/landing/Stats";
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { CTABand } from "@/components/landing/CTABand";
import { site } from "@/config/marketing";

export const metadata: Metadata = {
  title: "Smart scheduling for mobile notaries",
  description: site.description,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductPreview />
      <Stats />
      <FeatureHighlights />
      <Testimonials />
      <PricingTeaser />
      <CTABand />
    </>
  );
}
