"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/store/uiStore";
import Link from "next/link";
import { Mail, CheckCircle2, ChevronLeft, ArrowRight } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { forgotPasswordMutation } = useAuth();
  const { addToast } = useUIStore();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotForm) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch {
      // Always show success to prevent email enumeration
      setSubmittedEmail(data.email);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Topbar */}
      <div className="h-16 bg-white border-b border-border px-6 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-slate-secondary hover:text-primary-navy transition-colors font-inter font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to sign in
        </Link>
        <span className="font-sora font-bold text-[18px] text-primary-navy">Notary Day</span>
        <div className="w-24" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px]">
          {!submitted ? (
            /* ── STATE A: Request ── */
            <div>
              <div className="w-14 h-14 bg-blue-bg rounded-[14px] flex items-center justify-center mb-5 text-interactive-blue">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="font-sora font-bold text-[26px] text-primary-navy mb-2 tracking-tight">
                Reset your password
              </h1>
              <p className="font-inter text-sm text-slate-secondary leading-[1.6] mb-6">
                Enter your account email and we&apos;ll send you a reset link. It expires in 1 hour.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="your@email.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Button
                  type="submit"
                  fullWidth
                  isLoading={forgotPasswordMutation.isPending}
                  className="h-11"
                >
                  Send reset link <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
              <div className="h-px bg-border my-6" />
              <p className="text-center font-inter text-sm text-slate-secondary">
                <Link href="/login" className="font-semibold text-interactive-blue">
                  Back to sign in
                </Link>
              </p>
            </div>
          ) : (
            /* ── STATE B: Sent ── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal-bg border border-teal-b flex items-center justify-center mx-auto mb-5 text-teal-success">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-sora font-bold text-[22px] text-primary-navy mb-2 tracking-tight">
                Check your email
              </h2>
              <p className="font-inter text-sm text-slate-secondary leading-[1.6] max-w-[320px] mx-auto mb-6">
                If an account exists for{" "}
                <strong className="text-primary-navy">{submittedEmail}</strong>, you&apos;ll receive a reset
                link within a few minutes.
              </p>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-inter text-sm font-semibold text-interactive-blue hover:underline"
                >
                  Resend email
                </button>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 font-inter text-sm text-slate-secondary hover:text-primary-navy transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
