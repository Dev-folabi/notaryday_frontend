"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/store/uiStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Zap, ArrowRight, Scan, Sparkles } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
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
  const { registerMutation, isAuthenticated, isLoadingUser, checkUsername } = useAuth();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", username: "", state: "", password: "" },
  });

  const watchedUsername = watch("username");

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
      addToast({ type: "success", title: "Account created!", message: "Let's set up your profile." });
      router.push("/onboarding/home");
    } catch (err: any) {
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
        <Link href="/" className="font-sora font-bold text-lg text-primary-navy">
          Notary Day
        </Link>
      </div>

      {/* Left Panel — Desktop Only */}
      <div className="hidden lg:flex w-[44%] bg-primary-navy p-12 xl:p-20 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-interactive-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pro-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
        <Link href="/" className="font-sora font-extrabold text-[20px] text-white block mb-12 relative z-10">
          Notary Day
        </Link>
        <div className="max-w-md relative z-10">
          <div className="font-sora font-extrabold text-[34px] xl:text-[40px] leading-[1.1] text-white mb-5 tracking-tight">
            Run your signing<br />day like a business.
          </div>
          <p className="font-inter text-base text-white/60 leading-[1.7] mb-10">
            Scheduling, real earnings, scanback blocking, and your notarial journal — all in one tool built for how you actually work.
          </p>
          <div className="flex flex-col gap-5 mb-10">
            {[
              { icon: <Zap className="w-4 h-4 text-interactive-blue" />, bg: "bg-interactive-blue/15", t: "Know before you drive", d: "CITT gives you the real net after mileage and confirms the job fits your schedule." },
              { icon: <Scan className="w-4 h-4 text-amber-warning" />, bg: "bg-amber-warning/15", t: "Scanback included", d: "The only tool that auto-blocks scanback time between loan signings." },
              { icon: <Sparkles className="w-4 h-4 text-teal-success" />, bg: "bg-teal-success/15", t: "Gap Finder (Pro)", d: "Surface available jobs that fit between your already-booked signings." },
            ].map((b) => (
              <div key={b.t} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-[8px] ${b.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{b.icon}</div>
                <div>
                  <div className="font-inter text-sm font-semibold text-white mb-0.5">{b.t}</div>
                  <div className="font-inter text-xs text-white/55 leading-[1.6]">{b.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6">
            <div className="text-xs text-white/40 mb-3 font-semibold uppercase tracking-[0.5px]">What you get free, forever</div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {["Unlimited jobs", "CITT (accurate & unlimited)", "Mileage log", "Notarial journal"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-[12px] text-white/65">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-success" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-6 py-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1 className="font-sora font-extrabold text-[28px] text-primary-navy mb-2 tracking-tight">
              Create your free account
            </h1>
            <p className="font-inter text-sm text-slate-secondary">
              No credit card. Set up in 3 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">
            <Input
              label="Full name"
              placeholder="Sarah Martinez"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="your@email.com"
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
                <p className="text-[12px] text-muted mt-1">Checking availability…</p>
              )}
              {usernameStatus === "available" && (
                <p className="text-[12px] text-teal-success mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> notaryday.app/book/{watchedUsername} is available
                </p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-[12px] text-red-danger mt-1">This username is taken</p>
              )}
              {usernameStatus === "idle" && !errors.username && (
                <p className="text-[12px] text-muted mt-1">Your public booking URL: notaryday.app/book/you</p>
              )}
            </div>

            <div>
              <label className="block font-inter text-xs font-semibold text-primary-navy mb-1.5 uppercase tracking-[0.5px]">
                State
              </label>
              <select
                {...register("state")}
                className="w-full h-11 border border-border rounded-input px-3 font-inter text-sm text-primary-navy bg-white focus:outline-none focus:border-interactive-blue transition-colors appearance-none"
              >
                <option value="">Select your state…</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && (
                <p className="text-[12px] text-red-danger mt-1">{errors.state.message}</p>
              )}
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register("password")}
            />

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
            <span className="underline cursor-pointer text-slate-secondary">Terms of Service</span> and{" "}
            <span className="underline cursor-pointer text-slate-secondary">Privacy Policy</span>.
          </p>

          <div className="h-px bg-border my-6" />

          <p className="text-center font-inter text-sm text-slate-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-interactive-blue">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
