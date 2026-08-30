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

const skinMap = {
  success: {
    bg: "bg-[#f0fdf4]",
    border: "border-l-[#16a34a]",
    text: "text-[#166534]",
    icon: "text-[#16a34a]",
  },
  error: {
    bg: "bg-[#fef2f2]",
    border: "border-l-[#dc2626]",
    text: "text-[#991b1b]",
    icon: "text-[#dc2626]",
  },
  info: {
    bg: "bg-[#f0f7ff]",
    border: "border-l-[#2563eb]",
    text: "text-[#1e40af]",
    icon: "text-[#2563eb]",
  },
  warning: {
    bg: "bg-[#fffbeb]",
    border: "border-l-[#d97706]",
    text: "text-[#92400e]",
    icon: "text-[#d97706]",
  },
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
    const duration = toast.duration ?? 3600;
    const exitTimer = setTimeout(() => setClosing(true), duration);
    const removeTimer = setTimeout(onRemove, duration + EXIT_ANIM_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border-l-[3px] font-inter text-[13px] font-medium shadow-lg w-full break-words",
        "transition-[opacity,transform] duration-200 ease-out",
        skin.bg,
        skin.border,
        skin.text,
        closing
          ? "opacity-0 translate-y-2"
          : "animate-[toast-in_0.22s_ease]",
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", skin.icon)} />
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
