"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/uiStore";
import type { Toast as ToastType } from "@/store/uiStore";

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

// Tinted toast skins matching the notaryday_complete_app.html prototype:
// {bg}-{type}-bg, 1px {type}-border border, {type} text on all copies.
const skinMap = {
  success: "bg-teal-bg border-teal-border text-teal",
  error: "bg-red-bg border-red-border text-red",
  info: "bg-blue-bg border-blue-border text-blue",
  warning: "bg-amber-bg border-amber-border text-amber",
};

const EXIT_ANIM_MS = 200;

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastType;
  onRemove: () => void;
}) {
  const Icon = iconMap[toast.type];
  const skin = skinMap[toast.type];
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setClosing(true), toast.duration);
    const removeTimer = setTimeout(onRemove, toast.duration + EXIT_ANIM_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-[11px] rounded-[10px] border font-inter text-[13px] font-medium",
        "shadow-[0_8px_24px_rgba(0,0,0,0.16)] w-full break-words",
        "transition-[opacity,transform] duration-200 ease-out",
        skin,
        closing
          ? "opacity-0 translate-y-2"
          : "animate-[toast-in_0.22s_ease]",
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1">
        {toast.title}
        {toast.message && (
          <span className="block text-[12px] opacity-75 leading-[1.4] mt-0.5">
            {toast.message}
          </span>
        )}
      </div>
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
    <div className="fixed bottom-[76px] md:bottom-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center w-[92%] max-w-[380px] pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="w-full pointer-events-auto">
          <ToastItem toast={toast} onRemove={() => onRemove(toast.id)} />
        </div>
      ))}
    </div>
  );
}

export function GlobalToast() {
  const { toasts, removeToast } = useUIStore();
  if (toasts.length === 0) return null;
  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}
