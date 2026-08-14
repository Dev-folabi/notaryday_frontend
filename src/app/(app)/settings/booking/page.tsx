import { redirect } from "next/navigation";

export default function BookingSettingsPage() {
  redirect("/settings?tab=booking");
}