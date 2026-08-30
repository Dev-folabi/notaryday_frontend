import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/LegalPage";
import { legal } from "@/config/marketing";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Notary Day collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={legal.privacy.title}
      updated={legal.privacy.updated}
      intro={legal.privacy.intro}
      sections={legal.privacy.sections}
    />
  );
}
