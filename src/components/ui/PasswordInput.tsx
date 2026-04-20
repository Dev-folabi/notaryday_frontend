"use client";

import { forwardRef, useState } from "react";
import { Input } from "./Input";
import { Eye, EyeOff } from "lucide-react";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      ref={ref}
      type={showPassword ? "text" : "password"}
      rightElement={
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          onClick={(e) => {
            e.preventDefault();
            setShowPassword(!showPassword);
          }}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      }
    />
  );
});
PasswordInput.displayName = "PasswordInput";
