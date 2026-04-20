"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useUIStore } from "@/store/uiStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    loginMutation,
    isAuthenticated,
    isOnboardingComplete,
    isLoadingUser,
  } = useAuth();
  const { addToast } = useUIStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "sarah@", password: "wrong", rememberMe: false },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoadingUser && isAuthenticated) {
      if (isOnboardingComplete) {
        router.replace("/");
      } else {
        router.replace("/onboarding/home");
      }
    }
  }, [isLoadingUser, isAuthenticated, isOnboardingComplete, router]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
      addToast({ type: "success", title: "Welcome back!" });
      router.push(isOnboardingComplete ? "/" : "/onboarding/home");
    } catch (error) {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Sign in failed",
        message: err?.message ?? "Please check your credentials and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Mobile Nav */}
      <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-border bg-white">
        <span className="font-sora font-bold text-lg text-navy">
          Notary Day
        </span>
      </div>

      {/* Left Panel - Desktop */}
      <div className="hidden lg:flex w-[46%] bg-navy p-12 lg:p-20 flex-col justify-center relative overflow-hidden text-white/90">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="max-w-md relative z-10">
          <div className="font-sora font-extrabold text-[32px] lg:text-[40px] leading-[1.1] mb-6 tracking-tight">
            Good to see you <br /> again
          </div>
          <p className="font-inter text-lg text-white/60 leading-relaxed mb-12">
            Your schedule, earnings, and journal are waiting. Sessions last 30
            days — you probably won&apos;t need this form very often.
          </p>
          <div className="space-y-6">
            {[
              "Your jobs and schedule are exactly as you left them",
              "CITT checks run instantly on login",
              "All your data stays private — always",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                </div>
                <span className="font-inter text-base font-medium text-white/80">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="font-sora font-extrabold text-3xl text-navy mb-3 tracking-tight">
              Welcome back
            </h1>
            <p className="font-inter text-base text-slate-secondary">
              Sign in to your Notary Day account.
            </p>
          </div>

          {/* Error Alert */}
          {loginMutation.isError && (
            <div className="mb-6 bg-amber-bg border border-amber-border rounded-[10px] p-4 flex items-start gap-3">
              <span className="text-amber mt-0.5">⚠️</span>
              <div className="text-xs text-amber leading-relaxed">
                {(loginMutation.error as any)?.response?.status === 429 ? (
                  <>
                    Too many attempts. Try again in 15 minutes or{" "}
                    <span className="font-semibold underline cursor-pointer">
                      reset your password
                    </span>
                    .
                  </>
                ) : (
                  (loginMutation.error as any)?.message ||
                  "Please check your credentials and try again."
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="your@email.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <div>
              <PasswordInput
                label="Password"
                placeholder="Your password"
                error={errors.password?.message}
                {...register("password")}
              />
              <div className="text-right mt-1.5 -mb-2">
                <Link
                  href="/forgot-password"
                  title="Forgot password?"
                  className="text-[13px] font-medium text-blue hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loginMutation.isPending}
              className="h-11 shadow-sm mt-2"
            >
              Sign in
            </Button>
          </form>

          <div className="h-px bg-border my-6" />

          <p className="text-center font-inter text-sm text-slate-secondary">
            New to Notary Day?{" "}
            <Link href="/signup" className="font-semibold text-blue">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
