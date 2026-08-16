"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface TopNavProps {
  isPro?: boolean;
  initials?: string;
}

export function TopNav({ isPro = false, initials }: TopNavProps) {
  return (
    <header
      className="topbar lg:hidden"
      style={{
        height: "calc(56px + env(safe-area-inset-top))",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="tb-left">
        <Image
          src="/icons/notaryday-icon-badge.svg"
          alt="Notary Day"
          width={28}
          height={28}
          className="flex-shrink-0"
        />
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
