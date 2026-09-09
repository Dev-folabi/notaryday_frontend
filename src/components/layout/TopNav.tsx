"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LOGO_URL } from "@/lib/logo";
import { ROUTES } from "@/config/routes";

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
          src={LOGO_URL}
          alt="Notary Day"
          width={28}
          height={28}
          unoptimized
          className="flex-shrink-0"
        />
        <span className="tb-logo">Notary Day</span>
      </div>
      <div className="tb-right">
        <Link
          href={ROUTES.APP.BILLING}
          aria-label="View plan and billing"
          title="View plan and billing"
        >
          <span className={cn("chip", isPro ? "c-pro" : "c-free")}>
            {isPro ? "Pro" : "Free"}
          </span>
        </Link>
        <Link
          href={ROUTES.APP.PROFILE}
          aria-label="View profile"
          title="View profile"
        >
          <div className="av" style={{ width: 28, height: 28, fontSize: 11 }}>
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}
