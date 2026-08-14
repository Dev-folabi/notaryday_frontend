import api from "@/lib/api";

export type SettingsPayload = {
  home_base_address?: string;
  scanback_duration_mins?: number;
  signing_defaults?: {
    signing_type: string;
    signing_duration_mins: number;
    scanback_duration_mins: number;
  }[];
  preferredNavApp?: string;
  paymentInfo?: Record<string, unknown>;
  state?: string;
  notificationPrefs?: Record<string, boolean>;
  [key: string]: unknown;
};

export const usersApi = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (data: {
    fullName?: string;
    phone?: string;
    bio?: string;
    nnaCertified?: boolean;
    credentials?: string[];
    state?: string;
  }) => api.patch("/users/profile", data),

  getSettings: () => api.get("/users/settings"),

  updateSettings: (data: SettingsPayload) =>
    api.patch("/users/settings", data),

  getSigningDefaults: () => api.get("/users/signing-defaults"),

  checkUsername: (username: string) =>
    api.get(`/auth/username-check/${username}`),

  completeOnboarding: () => api.patch("/users/onboarding/complete"),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.post("/users/change-password", data),

  deleteAccount: (confirmation = "DELETE") =>
    api.delete("/users/me", { data: { confirmation } }),
};
