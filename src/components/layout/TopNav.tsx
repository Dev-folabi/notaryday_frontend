"use client";

import { Menu } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

interface TopNavProps {
  isPro?: boolean;
  initials?: string;
}

export function TopNav({ isPro = false, initials }: TopNavProps) {
  const setOpen = useUIStore((s) => s.setMobileMenuOpen);

  return (
    <header className="topbar lg:hidden">
      <div className="tb-left">
        <button className="tb-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="w-[18px] h-[18px]" />
        </button>
        <span className="tb-logo">Notary Day</span>
      </div>
      <div className="tb-right">
        <span className={cn("chip", isPro ? "c-pro" : "c-free")}>
          {isPro ? "Pro" : "Free"}
        </span>
        <div className="av" style={{ width: 28, height: 28, fontSize: 11 }}>
          {initials}
        </div>
      </div>
    </header>
  );
}
