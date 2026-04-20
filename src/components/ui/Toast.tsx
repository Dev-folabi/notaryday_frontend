"use client";

import { cn } from "@/lib/utils";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import type { Toast as ToastType } from "@/store/uiStore";

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: "text-teal",
  error: "text-red",
  info: "text-blue",
  warning: "text-amber",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastType;
  onRemove: () => void;
}) {
  const Icon = iconMap[toast.type];
  const color = colorMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-card shadow-card bg-white border border-border",
      )}
    >
      <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", color)} />
      <div className="flex-1">
        <p className="font-inter font-semibold text-sm text-slate">
          {toast.title}
        </p>
        {toast.message && (
          <p className="font-inter text-xs text-slate-secondary mt-0.5">
            {toast.message}
          </p>
        )}
      </div>
      <button onClick={onRemove}>
        <X className="h-4 w-4 text-slate-secondary" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
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

export function GlobalToast() {
  const { toasts, removeToast } = useUIStore();
  if (toasts.length === 0) return null;
  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}
