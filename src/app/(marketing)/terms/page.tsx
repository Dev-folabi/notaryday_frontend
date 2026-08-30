import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/LegalPage";
import { legal } from "@/config/marketing";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Notary Day.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title={legal.terms.title}
      updated={legal.terms.updated}
      intro={legal.terms.intro}
      sections={legal.terms.sections}
    />
  );
}
