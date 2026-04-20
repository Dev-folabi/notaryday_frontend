"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { authApi } from "@/api/auth.api";
import { usersApi } from "@/api/users.api";
import { queryKeys } from "@/lib/queryClient";
import type { User, SessionUser, UserSettings } from "@/types/user";
import { useRouter } from "next/navigation";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch current user from session
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        return (await authApi.me()) as unknown as User;
      } catch {
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });

  const sessionUser: SessionUser | null = user
    ? {
        id: user.id,
        email: user.email,
        username: user.username,
        plan: user.plan,
      }
    : null;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      rememberMe?: boolean;
    }) => authApi.login(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      username: string;
      fullName?: string;
    }) => authApi.register(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data),
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.resetPassword(data),
  });

  // Check username availability
  const checkUsername = useCallback(
    async (username: string): Promise<boolean> => {
      try {
        const res = await usersApi.checkUsername(username);
        return (res as unknown as { data: { available: boolean } }).data.available;
      } catch {
        return false;
      }
    },
    [],
  );

  // Complete onboarding step
  const completeOnboardingStep = useMutation({
    mutationFn: async ({
      step: _step,
      data,
    }: {
      step: number;
      data?: Record<string, unknown>;
    }) => {
      // Update settings if provided
      if (data && Object.keys(data).length > 0) {
        await usersApi.updateSettings(data);
      }
      // Update onboarding step (handled via settings or a dedicated endpoint)
      // For now settings update handles this via backend
    },
  });

  return {
    user,
    sessionUser,
    isLoadingUser,
    isAuthenticated: !!user,
    isOnboardingComplete: user?.onboarding_completed ?? false,
    loginMutation,
    logoutMutation,
    registerMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    checkUsername,
    completeOnboardingStep,
  };
}
