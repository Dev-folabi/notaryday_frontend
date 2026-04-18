import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      className,
      id,
      leftIcon,
      rightElement,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || label ? `input-${label?.toLowerCase().replace(/\s+/g, "-")}` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-inter font-medium text-xs text-slate"
          >
            {label}
          </label>
        )}

        <div className={cn("relative", (leftIcon || rightElement) && "flex items-center")}>
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full bg-white border rounded-md text-sm text-slate",
              "placeholder:text-muted",
              "focus:border-blue focus:ring-2 focus:ring-blue/20 focus:outline-none",
              "transition-colors duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightElement && "pr-10",
              error ? "border-red" : "border-border",
              className
            )}
            {...props}
          />

          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <span className="text-xs text-red font-inter flex items-center gap-1">
            <span>⚠</span>
            {error}
          </span>
        )}

        {hint && !error && (
          <span className="font-inter text-[11px] text-muted">{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";