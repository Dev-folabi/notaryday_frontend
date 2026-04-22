"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { usersApi } from "@/api/users.api";
import { useMutation } from "@tanstack/react-query";
import type { UserSettings } from "@/types/user";

export function useOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast, setOnboardingStep } = useUIStore();

  // Save home base + username
  const saveHomeBase = useMutation({
    mutationFn: async (data: {
      home_base_address: string;
      home_base_lat: number;
      home_base_lng: number;
    }) => {
      // Update onboarding step to 2 first
      await usersApi.updateSettings({ onboarding_step: 2 } as Record<string, unknown>);
      // Then save home base settings
      return usersApi.updateSettings(data as Record<string, unknown>);
    },
    onSuccess: () => {
      setOnboardingStep(2);
      router.push("/onboarding/scanback");
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: "error",
        title: "Failed to save",
        message: err?.message ?? "Please try again.",
      });
    },
  });

  // Save scanback duration (and optional IRS rate)
  const saveScanback = useMutation({
    mutationFn: async (data: {
      scanback_duration_mins: number;
      irs_rate_per_mile?: number;
      onboarding_step?: number;
    }) => {
      // Update onboarding step first if provided
      if (data.onboarding_step) {
        await usersApi.updateSettings({ onboarding_step: data.onboarding_step } as Record<string, unknown>);
      }
      // Then save scanback settings
      return usersApi.updateSettings({
        scanback_duration_mins: data.scanback_duration_mins,
        irs_rate_per_mile: data.irs_rate_per_mile,
      } as Record<string, unknown>);
    },
    onSuccess: () => {
      setOnboardingStep(3);
      router.push("/onboarding/signing-types");
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: "error",
        title: "Failed to save",
        message: err?.message ?? "Please try again.",
      });
    },
  });

  // Save signing type defaults & Complete onboarding
  const saveSigningTypes = useMutation({
    mutationFn: async (data: {
      signing_defaults: Array<{
        signing_type: string;
        signing_duration_mins: number;
        scanback_duration_mins: number;
      }>;
    }) => {
      // Save signing defaults to settings
      await usersApi.updateSettings(data as Record<string, unknown>);
      // Complete onboarding via dedicated endpoint
      return usersApi.completeOnboarding();
    },
    onSuccess: () => {
      setOnboardingStep(4);
      addToast({ type: "success", title: "You're all set!" });
      router.push("/");
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: "error",
        title: "Failed to save",
        message: err?.message ?? "Please try again.",
      });
    },
  });

  // Skip onboarding step
  const skipStep = (currentStep: number) => {
    const nextStep = currentStep + 1;
    setOnboardingStep(nextStep);
    if (nextStep === 2) router.push("/onboarding/scanback");
    else if (nextStep === 3) router.push("/onboarding/signing-types");
    else {
      router.push("/");
    }
  };

  return {
    saveHomeBase,
    saveScanback,
    saveSigningTypes,
    skipStep,
  };
}
