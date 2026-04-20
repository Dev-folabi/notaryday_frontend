import { cn } from "@/lib/utils";

type BadgeVariant =
  | "free"
  | "pro"
  | "loan"
  | "general"
  | "hybrid"
  | "platform"
  | "active"
  | "teal"
  | "amber";

const variantClasses: Record<BadgeVariant, string> = {
  free: "bg-teal-bg text-teal border border-teal-border",
  pro: "bg-amber-bg text-amber border border-amber-border",
  loan: "bg-blue-bg text-blue border border-blue-b",
  general: "bg-teal-bg text-teal border border-teal-border",
  hybrid: "bg-violet-bg text-violet border border-violet-b",
  platform: "bg-slate-100 text-slate-secondary border border-border",
  active: "bg-blue-bg text-blue border border-blue-b",
  teal: "bg-teal-bg text-teal border border-teal-border",
  amber: "bg-amber-bg text-amber border border-amber-border",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "free",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-[0.02em]",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}