import Link from "next/link";
import { getInitials } from "@/lib/utils";
import type { SessionUser } from "@/types/user";
import { Bell } from "lucide-react";
import { ROUTES } from "@/config/routes";

interface TopNavProps {
  user?: SessionUser | null;
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function TopNav({
  user,
  title,
  showBack,
  backHref = ROUTES.APP.TODAY,
}: TopNavProps) {
  const displayName = user?.full_name ?? user?.username ?? "";

  return (
    <header className="h-[56px] bg-white border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
      {showBack ? (
        <Link
          href={backHref}
          className="text-sm text-slate-secondary font-inter"
        >
          ← Back
        </Link>
      ) : (
        <Link
          href={ROUTES.APP.TODAY}
          className="font-sora font-bold text-lg text-primary-navy"
        >
          Notary Day
        </Link>
      )}

      {title && (
        <span className="font-sora font-semibold text-base text-primary-navy hidden sm:block">
          {title}
        </span>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.APP.NOTIFICATIONS}
          className="p-2 text-slate-secondary hover:text-slate-body"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Link>

        {user && displayName && (
          <Link href={ROUTES.APP.ACCOUNT}>
            <div className="w-8 h-8 rounded-full bg-primary-navy text-white text-[11px] font-semibold flex items-center justify-center">
              {getInitials(displayName)}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
