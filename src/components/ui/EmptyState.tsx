import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 p-3 rounded-full bg-border/40">
          <Icon className="h-6 w-6 text-slate-secondary" />
        </div>
      )}

      <h3 className="font-sora font-semibold text-base text-primary-navy mb-1">
        {title}
      </h3>

      {description && (
        <p className="font-inter text-sm text-slate-secondary max-w-xs">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
