import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost" | "pro";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-navy text-white hover:bg-navy-active active:bg-navy-active disabled:bg-slate-secondary/40",
  secondary:
    "bg-white border border-primary-navy text-primary-navy hover:bg-bg active:bg-bg disabled:opacity-50",
  destructive:
    "bg-red-danger text-white hover:bg-red-danger/90 active:bg-red-danger/80 disabled:opacity-50",
  ghost:
    "bg-transparent text-interactive-blue hover:text-blue-hover active:text-blue-hover disabled:opacity-50",
  pro:
    "bg-pro-gold text-primary-navy hover:bg-pro-gold/90 active:bg-pro-gold/80 disabled:opacity-50",
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
      ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2 font-inter font-semibold text-sm rounded-button transition-colors duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-blue focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Width
          fullWidth && "w-full",
          // Height - primary/pro/destructive are 48px, secondary/ghost are 44px
          (variant === "primary" || variant === "pro" || variant === "destructive") && "h-12 px-5",
          (variant === "secondary" || variant === "ghost") && "h-11 px-4",
          // Variant
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
