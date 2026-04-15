"use client";

import { useUIStore } from "@/store/uiStore";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
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
        // 50px circle per prototype
        "fixed z-40 w-[50px] h-[50px] rounded-full",
        // Gradient navy to blue
        "bg-gradient-to-br from-primary-navy to-interactive-blue",
        "flex items-center justify-center",
        // Shadow and border
        "shadow-fab border-2 border-white",
        // Hover/active states
        "hover:scale-105 active:scale-95 transition-transform duration-150",
        // Positioned above bottom nav: bottom nav is 60px, FAB is 50px, positioned at -18px overlap
        // So bottom = 60px - 18px = 42px from bottom of viewport to top of FAB
        // Actually: bottom of FAB at 60px - 18px = 42px, but FAB is 50px tall, so bottom = 60px + (50px/2) - 18px = 67px
        "sm:bottom-[67px] bottom-[67px] left-1/2 -translate-x-1/2",
        className
      )}
    >
      <span className="sr-only">CITT</span>
      <Zap className="h-5 w-5 text-white" fill="white" strokeWidth={0} />
    </button>
  );
}
