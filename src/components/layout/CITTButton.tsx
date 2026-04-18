"use client";

import { useUIStore } from "@/store/uiStore";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CITTButtonProps {
  className?: string;
}

export function CITTButton({ className }: CITTButtonProps) {
  const openCITT = useUIStore((s) => s.openCITT);

  return (
    <button
      type="button"
      onClick={() => openCITT()}
      aria-label="Open CITT check"
      className={cn(
        "fixed z-40 w-[50px] h-[50px] rounded-full",
        "bg-gradient-to-br from-primary-navy to-interactive-blue",
        "flex items-center justify-center shadow-fab border-2 border-white",
        "hover:scale-105 active:scale-95 transition-transform duration-150",
        "bottom-[72px] left-1/2 -translate-x-1/2",
        className
      )}
    >
      <Zap className="h-5 w-5 text-white" fill="white" strokeWidth={0} />
    </button>
  );
}