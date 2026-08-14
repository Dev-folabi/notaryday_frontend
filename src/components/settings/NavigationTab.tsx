"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { usersApi } from "@/api/users.api";
import { queryKeys } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Navigation } from "lucide-react";
import type { NavApp } from "@/types/user";

const NAV_APPS = ["Google Maps", "Apple Maps", "Waze"];

export default function NavigationTab() {
  const { user } = useAuth();
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const [navPref, setNavPrefState] = useState<NavApp>(
    user?.settings?.preferred_nav_app ?? "GOOGLE_MAPS",
  );

  const setNavPref = async (val: NavApp) => {
    setNavPrefState(val);
    try {
      await usersApi.updateSettings({ preferredNavApp: val });
      await qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      addToast({ type: "success", title: `Navigation set to ${val.replace("_", " ")}` });
    } catch {
      addToast({ type: "error", title: "Could not save navigation preference" });
    }
  };

  return (
    <div className="card p-4 mb-4">
      <div className="font-inter text-[12px] font-semibold text-navy mb-2.5 flex gap-1.5 items-center"><Navigation className="w-4 h-4" /> Navigation app preference</div>
      <p className="font-inter text-[11px] text-slate-secondary mb-2.5 leading-[1.4]">When you tap Navigate on a job card, which app should open?</p>
      <div className="grid grid-cols-3 gap-2">
        {NAV_APPS.map((n) => {
          const val = n.toUpperCase().replace(" ", "_") as NavApp;
          return (
            <div
              key={n}
              onClick={() => setNavPref(val)}
              className="p-2 rounded-[8px] font-inter text-[12px] text-center cursor-pointer border"
              style={{
                borderColor: navPref === val ? "var(--navy)" : "var(--border)",
                background: navPref === val ? "var(--blue-bg)" : "#fff",
                color: navPref === val ? "var(--navy)" : "var(--slate)",
                fontWeight: navPref === val ? 600 : 500,
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
    </div>
  );
}