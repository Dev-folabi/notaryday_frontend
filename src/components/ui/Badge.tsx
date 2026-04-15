import { cn } from "@/lib/utils";

type BadgeVariant =
  | "free"
  | "pro"
  | "loan"
  | "general"
  | "hybrid"
  | "platform"
  | "active"
  | "nav"
  | "teal"
  | "amber";

const variantClasses: Record<BadgeVariant, string> = {
  free: "bg-teal-bg text-teal-success border border-teal-b",
  pro: "bg-amber-bg text-amber-warning border border-amber-b",
  loan: "bg-blue-bg text-interactive-blue border border-blue-b",
  general: "bg-teal-bg text-teal-success border border-teal-b",
  hybrid: "bg-violet-bg text-violet border border-violet-b",
  platform: "bg-slate-100 text-slate-secondary border border-border",
  active: "bg-blue-bg text-interactive-blue border border-blue-b",
  nav: "bg-slate-100 border border-border text-primary-navy text-[11px] font-medium normal-case tracking-[0] p-1",
  teal: "bg-teal-bg text-teal-success border border-teal-b",
  amber: "bg-amber-bg text-amber-warning border border-amber-b",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "free", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[0.025em]",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
