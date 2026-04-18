import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost" | "pro";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-navy text-white hover:bg-navy-active active:bg-navy-active",
  secondary:
    "bg-white border border-navy text-navy hover:bg-background",
  destructive:
    "bg-red text-white hover:bg-red/90",
  ghost:
    "bg-transparent text-blue hover:text-blue-hover",
  pro:
    "bg-pro text-navy hover:bg-pro/90",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      isLoading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-inter font-semibold text-sm rounded-md transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "h-12 px-5",
          fullWidth && "w-full",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";