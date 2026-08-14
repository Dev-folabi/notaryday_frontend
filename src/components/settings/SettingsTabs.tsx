"use client";

import { cn } from "@/lib/utils";
import {
  User,
  Bell,
  CreditCard,
  Link2,
  Mail,
  MapPin,
  Navigation,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export type TabKey =
  | "profile"
  | "operational"
  | "navigation"
  | "password"
  | "notifications"
  | "billing"
  | "booking"
  | "emails";

export const TAB_KEYS: TabKey[] = [
  "profile",
  "operational",
  "navigation",
  "password",
  "notifications",
  "billing",
  "booking",
  "emails",
];

const TABS: { key: TabKey; label: string; Icon: LucideIcon }[] = [
  { key: "profile", label: "Profile", Icon: User },
  { key: "operational", label: "Operational", Icon: MapPin },
  { key: "navigation", label: "Navigation", Icon: Navigation },
  { key: "password", label: "Password", Icon: KeyRound },
  { key: "notifications", label: "Notifications", Icon: Bell },
  { key: "billing", label: "Billing", Icon: CreditCard },
  { key: "booking", label: "Booking", Icon: Link2 },
  { key: "emails", label: "Emails", Icon: Mail },
];

export default function SettingsTabs({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <div className="tabs">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={cn("tab", tab === key && "on")}
          onClick={() => onChange(key)}
        >
          <Icon className="w-3.5 h-3.5" /> {label}
        </button>
      ))}
    </div>
  );
}
