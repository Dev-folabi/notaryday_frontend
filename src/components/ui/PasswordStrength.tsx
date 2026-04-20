"use client";

import { cn } from "@/lib/utils";

export function PasswordStrength({ password }: { password?: string }) {
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const strength = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  const colors = [
    "text-slate-400",
    "text-red-500", // Weak
    "text-amber-500", // Fair
    "text-teal-600", // Good
    "text-teal-600", // Strong
  ];

  const barColors = [
    "bg-slate-200",
    "bg-red-500",
    "bg-amber-500",
    "bg-teal-600",
    "bg-teal-600",
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1.5 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < strength ? barColors[strength] : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <span className={cn("text-[11px] font-medium block", colors[strength])}>
        {labels[strength] || " "}
      </span>
    </div>
  );
}
