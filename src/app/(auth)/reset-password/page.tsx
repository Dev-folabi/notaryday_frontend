"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPasswordMutation } = useAuth();
  const { addToast } = useUIStore();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) });

  const watchedPw = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      addToast({
        type: "error",
        title: "Invalid link",
        message: "Please request a new password reset link.",
      });
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: data.newPassword,
      });
      addToast({
        type: "success",
        title: "Password updated!",
        message: "You can now sign in.",
      });
      router.push("/login");
    } catch (error) {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Reset failed",
        message:
          err?.message ??
          "This link may have expired. Please request a new one.",
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-[14px] bg-red-50 flex items-center justify-center mb-5 text-red mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-sora font-bold text-[22px] text-navy mb-2">
            Invalid reset link
          </h1>
          <p className="font-inter text-sm text-slate-secondary mb-6 leading-relaxed">
            This link is invalid or has expired. Reset links are valid for 1
            hour.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 bg-navy text-white font-inter font-semibold text-sm rounded-button h-10 px-5 hover:bg-navy-active transition-colors"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="w-14 h-14 rounded-[14px] bg-teal-bg flex items-center justify-center mb-5 text-teal">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-sora font-bold text-[24px] text-navy mb-1.5 tracking-tight">
          Set a new password
        </h1>
        <p className="font-inter text-sm text-slate-secondary leading-relaxed mb-7">
          Your new password must be at least 8 characters.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <PasswordInput
              label="New password"
              placeholder="New password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <PasswordStrength password={watchedPw} />
          </div>
          <PasswordInput
            label="Confirm new password"
            placeholder="Confirm password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button
            type="submit"
            fullWidth
            isLoading={resetPasswordMutation.isPending}
            className="h-11"
          >
            Set new password <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
