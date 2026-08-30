import type { Metadata } from "next";
import { PageHeader } from "@/components/landing/PageHeader";
import { Features } from "@/components/landing/Features";
import { ScanbackCallout } from "@/components/landing/ScanbackCallout";
import { CITTSection } from "@/components/landing/CITTSection";
import { BookingPageSection } from "@/components/landing/BookingPageSection";
import { CTABand } from "@/components/landing/CTABand";
import { featuresPage, site } from "@/config/marketing";

export const metadata: Metadata = {
  title: "Features",
  description: site.description,
};

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow={featuresPage.eyebrow}
        title={featuresPage.title}
        subtitle={featuresPage.subtitle}
      />
      <Features showHeader={false} />
      <ScanbackCallout />
      <CITTSection />
      <BookingPageSection />
      <CTABand />
    </>
  );
}
