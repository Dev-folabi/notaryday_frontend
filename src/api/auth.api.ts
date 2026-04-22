import api from "@/lib/api";

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    username: string;
    fullName?: string;
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post("/auth/reset-password", data),

  me: () => api.get("/auth/me"),
};
