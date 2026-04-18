import api from "@/lib/api";

export const usersApi = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (data: {
    fullName?: string;
    phone?: string;
    bio?: string;
    nnaCertified?: boolean;
    credentials?: string[];
  }) => api.patch("/users/profile", data),

  getSettings: () => api.get("/users/settings"),

  updateSettings: (data: Record<string, unknown>) =>
    api.patch("/users/settings", data),

  getSigningDefaults: () => api.get("/users/signing-defaults"),

  checkUsername: (username: string) =>
    api.get(`/auth/username-check/${username}`),
};
