"use client";

import { cn } from "@/lib/utils";

export type TabKey =
  | "profile"
  | "operational"
  | "navigation"
  | "password"
  | "notifications"
  | "billing"
  | "booking"
  | "emails";
// | "calendar"; // Hidden for now (calendar sync)

export const TAB_KEYS: TabKey[] = [
  "profile",
  "operational",
  "navigation",
  "password",
  "notifications",
  "billing",
  "booking",
  "emails",
  // "calendar", // Hidden for now (calendar sync)
];

const TAB_LABELS: Record<TabKey, string> = {
  profile: "Profile",
  operational: "Operational",
  navigation: "Navigation",
  password: "Password",
  notifications: "Notifications",
  billing: "Billing",
  booking: "Booking",
  emails: "Emails",
  // calendar: "Calendar", // Hidden for now (calendar sync)
};

export default function SettingsTabs({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <div className="tabs">
      {TAB_KEYS.map((key) => (
        <button
          key={key}
          className={cn("tab", tab === key && "on")}
          onClick={() => onChange(key)}
        >
          {TAB_LABELS[key]}
        </button>
      ))}
    </div>
  );
}
