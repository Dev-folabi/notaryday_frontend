"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/store/uiStore";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof schema>;

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const strength = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "text-red-danger",
    "text-amber-warning",
    "text-teal-success",
    "text-teal-success",
  ];
  const barColors = [
    "bg-border",
    "bg-red-danger",
    "bg-amber-warning",
    "bg-teal-success",
    "bg-teal-success",
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? barColors[strength] : "bg-border"}`} />
        ))}
      </div>
      <span className={`text-[11px] font-medium ${colors[strength]}`}>{labels[strength]}</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPasswordMutation } = useAuth();
  const { addToast } = useUIStore();
  const [watchPw, setWatchPw] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      addToast({ type: "error", title: "Invalid link", message: "Please request a new password reset link." });
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword: data.newPassword });
      addToast({ type: "success", title: "Password updated!", message: "You can now sign in." });
      router.push("/login");
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Reset failed",
        message: err?.message ?? "This link may have expired. Please request a new one.",
      });
    }
  };

  const watchedPw = watch("newPassword", "");

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-[14px] bg-red-50 flex items-center justify-center mb-5 text-red-danger mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-sora font-bold text-[22px] text-primary-navy mb-2">Invalid reset link</h1>
          <p className="font-inter text-sm text-slate-secondary mb-6 leading-relaxed">
            This link is invalid or has expired. Reset links are valid for 1 hour.
          </p>
          <Link href="/forgot-password" className="inline-flex items-center justify-center gap-2 bg-primary-navy text-white font-inter font-semibold text-sm rounded-button h-10 px-5 hover:bg-navy-active transition-colors">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="w-14 h-14 rounded-[14px] bg-teal-bg flex items-center justify-center mb-5 text-teal-success">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-sora font-bold text-[24px] text-primary-navy mb-1.5 tracking-tight">
          Set a new password
        </h1>
        <p className="font-inter text-sm text-slate-secondary leading-relaxed mb-7">
          Your new password must be at least 8 characters.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <Input
              label="New password"
              type="password"
              placeholder="New password"
              error={errors.newPassword?.message}
              {...register("newPassword", { onChange: (e) => setWatchPw(e.target.value) })}
            />
            <PasswordStrength password={watchedPw} />
          </div>
          <Input
            label="Confirm new password"
            type="password"
            placeholder="Confirm password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" fullWidth isLoading={resetPasswordMutation.isPending} className="h-11">
            Set new password <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
