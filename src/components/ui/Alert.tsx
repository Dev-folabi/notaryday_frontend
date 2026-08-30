"use client";

import {
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "warning" | "success" | "error" | "pro";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  {
    bg: string;
    border: string;
    text: string;
    iconColor: string;
    defaultIcon: React.ElementType;
  }
> = {
  info: {
    bg: "bg-[#f0f7ff]",
    border: "border-l-[#2563eb]",
    text: "text-[#1e40af]",
    iconColor: "text-[#2563eb]",
    defaultIcon: Info,
  },
  warning: {
    bg: "bg-[#fffbeb]",
    border: "border-l-[#d97706]",
    text: "text-[#92400e]",
    iconColor: "text-[#d97706]",
    defaultIcon: AlertTriangle,
  },
  success: {
    bg: "bg-[#f0fdf4]",
    border: "border-l-[#16a34a]",
    text: "text-[#166534]",
    iconColor: "text-[#16a34a]",
    defaultIcon: CheckCircle2,
  },
  error: {
    bg: "bg-[#fef2f2]",
    border: "border-l-[#dc2626]",
    text: "text-[#991b1b]",
    iconColor: "text-[#dc2626]",
    defaultIcon: XCircle,
  },
  pro: {
    bg: "bg-[#fffdf5]",
    border: "border-l-[#f59e0b]",
    text: "text-[#78350f]",
    iconColor: "text-[#d97706]",
    defaultIcon: Sparkles,
  },
};

export default function Alert({
  variant = "info",
  children,
  className,
  icon,
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.defaultIcon;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-xl border-l-[3px] px-4 py-3 font-inter text-[13px] leading-relaxed shadow-sm",
        config.bg,
        config.border,
        config.text,
        className,
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        {icon ?? (
          <IconComponent className={cn("h-4 w-4", config.iconColor)} />
        )}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            "flex-shrink-0 p-0.5 -m-1 rounded-md transition-colors hover:bg-black/5",
            config.text,
          )}
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
