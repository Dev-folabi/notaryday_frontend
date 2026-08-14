"use client";

import { useSyncExternalStore, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import SettingsTabs, { TAB_KEYS, type TabKey } from "@/components/settings/SettingsTabs";
import ProfileTab from "@/components/settings/ProfileTab";
import OperationalTab from "@/components/settings/OperationalTab";
import NavigationTab from "@/components/settings/NavigationTab";
import PasswordTab from "@/components/settings/PasswordTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import BillingTab from "@/components/settings/BillingTab";
import BookingSetupForm from "@/components/booking/BookingSetupForm";
import EmailTemplatesManager from "@/components/settings/EmailTemplatesManager";
import { FileText } from "lucide-react";

const subscribeTabStore = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};

const getTabSnapshot = (): TabKey | null => {
  const p = new URLSearchParams(window.location.search).get("tab");
  return p && TAB_KEYS.includes(p as TabKey) ? (p as TabKey) : null;
};

const getTabServerSnapshot = (): TabKey | null => null;

export default function SettingsPage() {
  const { user } = useAuth();
  const urlTab = useSyncExternalStore(
    subscribeTabStore,
    getTabSnapshot,
    getTabServerSnapshot,
  );
  const [tab, setTab] = useState<TabKey>("profile");
  const activeTab = urlTab ?? tab;
  const userKey = user?.email ?? "anonymous";

  const handleTabChange = (key: TabKey) => {
    setTab(key);
    window.history.replaceState(null, "", `?tab=${key}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="ph">
        <div className="ph-title">Account settings</div>
      </div>

      <SettingsTabs tab={activeTab} onChange={handleTabChange} />

      <div className="con">
        {activeTab === "profile" && <ProfileTab key={userKey} />}
        {activeTab === "operational" && <OperationalTab key={userKey} />}
        {activeTab === "navigation" && <NavigationTab key={userKey} />}
        {activeTab === "password" && <PasswordTab />}
        {activeTab === "notifications" && <NotificationsTab key={userKey} />}
        {activeTab === "billing" && <BillingTab />}
        {activeTab === "booking" && <BookingSetupForm />}
        {activeTab === "emails" && (
          <div className="card p-4 mb-4">
            <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><FileText className="w-4 h-4" /> Email templates</div>
            <p className="font-inter text-[11px] text-slate-secondary mb-2.5 leading-[1.4]">These are the emails your clients receive automatically. Content like name, address, fee is populated from your job data.</p>
            <EmailTemplatesManager embedded />
          </div>
        )}
      </div>
    </div>
  );
}