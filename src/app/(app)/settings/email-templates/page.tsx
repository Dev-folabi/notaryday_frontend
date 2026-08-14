import { redirect } from "next/navigation";

export default function EmailTemplatesSettingsPage() {
  redirect("/settings?tab=emails");
}