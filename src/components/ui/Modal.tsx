"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showClose?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full bg-white rounded-card shadow-xl flex flex-col max-h-[90vh]",
          sizeClasses[size],
        )}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            {title && (
              <h2 className="font-sora font-semibold text-base text-primary-navy">
                {title}
              </h2>
            )}

            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1 text-slate-secondary hover:text-slate-body"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
