"use client";

import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import type { Toast as ToastType } from "@/store/uiStore";

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: {
    bg: "bg-teal-success",
    icon: "text-white",
  },
  error: {
    bg: "bg-red-danger",
    icon: "text-white",
  },
  info: {
    bg: "bg-interactive-blue",
    icon: "text-white",
  },
  warning: {
    bg: "bg-amber-warning",
    icon: "text-white",
  },
};

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: () => void }) {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-card text-white shadow-card",
        colors.bg
      )}
      role="alert"
    >
      <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", colors.icon)} />
      <div className="flex-1 min-w-0">
        <p className="font-inter font-semibold text-sm">{toast.title}</p>
        {toast.message && (
          <p className="font-inter text-xs opacity-90 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        aria-label="Dismiss"
        className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
