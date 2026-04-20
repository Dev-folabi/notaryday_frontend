"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/store/uiStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrength } from "@/components/ui/PasswordStrength";

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be under 32 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only"),
  state: z.string().min(1, "Please select your state"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { registerMutation, isAuthenticated, isLoadingUser, checkUsername } =
    useAuth();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      state: "",
      password: "",
    },
  });

  const watchedUsername = useWatch({ control, name: "username" });
  const watchedPw = useWatch({ control, name: "password", defaultValue: "" });

  useEffect(() => {
    if (!isLoadingUser && isAuthenticated) {
      router.replace("/onboarding/home");
    }
  }, [isLoadingUser, isAuthenticated, router]);

  useEffect(() => {
    if (!watchedUsername || watchedUsername.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(watchedUsername)) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const available = await checkUsername(watchedUsername);
      setUsernameStatus(available ? "available" : "taken");
    }, 500);
    return () => clearTimeout(timer);
  }, [watchedUsername, checkUsername]);

  const onSubmit = async (data: SignupForm) => {
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        username: data.username,
        fullName: data.fullName,
      });
      addToast({
        type: "success",
        title: "Account created!",
        message: "Let's set up your profile.",
      });
      router.push("/onboarding/home");
    } catch (error) {
      const err = error as { message?: string };
      addToast({
        type: "error",
        title: "Sign up failed",
        message: err?.message ?? "Please check your details and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-border bg-white">
        <Link
          href="/"
          className="font-sora font-bold text-lg text-navy"
        >
          Notary Day
        </Link>
      </div>

      {/* Left Panel — Desktop Only */}
      <div className="hidden lg:flex w-[44%] bg-navy p-12 xl:p-20 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pro-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
        <Link
          href="/"
          className="font-sora font-extrabold text-[20px] text-white block mb-12 relative z-10"
        >
          Notary Day
        </Link>
        <div className="max-w-md relative z-10">
          <div className="font-sora font-bold text-[28px] leading-[1.2] text-white mb-4">
            Join 500+ notaries already using Notary Day
          </div>
          <p className="text-[14px] text-white/60 leading-[1.7] mb-8">
            Free plan. No credit card. Unlimited Can I Take This? checks from
            day one.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "Unlimited jobs & journal entries",
              "Can I Take This? — free, unlimited",
              "Real earnings per signing (IRS rate)",
              "Pro from $19/month — cancel any time",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-[14px] text-white/80"
              >
                <Check
                  className="w-4 h-4 text-teal flex-shrink-0"
                  strokeWidth={3}
                />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-6 py-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <div className="mb-7">
            <h1 className="font-sora font-bold text-[24px] text-navy mb-1.5">
              Create your account
            </h1>
            <p className="font-inter text-[14px] text-slate-secondary">
              Takes under 2 minutes. Free forever.
            </p>
          </div>

          {registerMutation.isSuccess && (
            <div className="mb-5 bg-blue-50 border border-blue-200 rounded-[10px] p-4 flex items-start gap-3">
              <Mail className="h-4 w-4 text-blue mt-0.5" />
              <div className="text-[12px] text-blue leading-[1.5]">
                Check your email to verify your account. You can still explore
                while you wait.{" "}
                <span className="font-semibold cursor-pointer underline">
                  Resend
                </span>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-[18px]"
          >
            <Input
              label="Full name"
              placeholder="Sarah Mitchell"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="your@email.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <div>
              <Input
                label="Username"
                placeholder="sarahnotary"
                error={errors.username?.message}
                {...register("username")}
              />
              {usernameStatus === "checking" && (
                <p className="text-[12px] text-muted mt-1">
                  Checking availability…
                </p>
              )}
              {usernameStatus === "available" && (
                <p className="text-[12px] text-teal mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> notaryday.app/book/
                  {watchedUsername} is available
                </p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-[12px] text-red mt-1">
                  This username is taken
                </p>
              )}
              {usernameStatus === "idle" && !errors.username && (
                <p className="text-[12px] text-muted mt-1">
                  Your public booking URL: notaryday.app/book/you
                </p>
              )}
            </div>

            <div>
              <label className="block font-inter text-xs font-semibold text-navy mb-1.5 uppercase tracking-[0.5px]">
                State
              </label>
              <select
                {...register("state")}
                className="w-full h-11 border border-border rounded-input px-3 font-inter text-sm text-navy bg-white focus:outline-none focus:border-blue transition-colors appearance-none"
              >
                <option value="">Select your state…</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-[12px] text-red mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <PasswordInput
                label="Password"
                placeholder="Minimum 8 characters"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordStrength password={watchedPw} />
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={registerMutation.isPending}
              className="h-11 mt-1"
            >
              Create free account <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center font-inter text-xs text-muted mt-4 leading-[1.6]">
            By creating an account you agree to our{" "}
            <span className="underline cursor-pointer text-slate-secondary">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline cursor-pointer text-slate-secondary">
              Privacy Policy
            </span>
            .
          </p>

          <div className="h-px bg-border my-6" />

          <p className="text-center font-inter text-sm text-slate-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
