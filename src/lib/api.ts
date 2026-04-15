import axios, { type AxiosInstance, type AxiosError } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
  };
}

function getCsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
}

const api: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach CSRF token
api.interceptors.request.use((config) => {
  const token = getCsrfToken();
  if (token && !["get", "head", "options"].includes(config.method?.toLowerCase() ?? "")) {
    config.headers["X-XSRF-TOKEN"] = token;
  }
  return config;
});

// Response interceptor: unwrap envelope, handle 401
api.interceptors.response.use(
  (response) => {
    // If the response already has the envelope shape, return data directly
    if (response.data && typeof response.data === "object" && "success" in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // Handle 401: redirect to login only for non-public routes
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't redirect if we're on a public page
      if (typeof window !== "undefined") {
        const isPublicRoute =
          window.location.pathname === "/login" ||
          window.location.pathname === "/signup" ||
          window.location.pathname === "/forgot-password" ||
          window.location.pathname.startsWith("/reset-password") ||
          window.location.pathname.startsWith("/book/");

        if (!isPublicRoute) {
          window.location.href = "/login";
        }
      }
    }

    // Normalize error shape
    const errorData = error.response?.data?.error ?? {
      code: "UNKNOWN_ERROR",
      message: error.message ?? "An unexpected error occurred",
      statusCode: error.response?.status ?? 500,
    };

    return Promise.reject(errorData);
  }
);

export default api;

// ─── Auth API

export const authApi = {
  register: (data: { email: string; password: string; username: string; fullName?: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post("/auth/reset-password", data),

  me: () => api.get("/auth/me"),
};

// ─── Users API

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

// ─── Jobs API ──────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: (params?: { date?: string; status?: string; page?: number; limit?: number }) =>
    api.get("/jobs", { params }),

  create: (data: Record<string, unknown>) => api.post("/jobs", data),

  get: (id: string) => api.get(`/jobs/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/jobs/${id}`, data),

  delete: (id: string) => api.delete(`/jobs/${id}`),

  updateStatus: (id: string, data: { status: string }) =>
    api.patch(`/jobs/${id}/status`, data),
};

// ─── CITT API ──────────────────────────────────────────────────────────────────

export const cittApi = {
  check: (data: {
    address: string;
    appointment_time: string;
    signing_type: string;
    fee: number;
    platform_fee?: number;
    signing_duration_mins?: number;
    scanback_duration_mins?: number;
  }) => api.post("/citt/check", data),
};

// ─── Planner API ───────────────────────────────────────────────────────────────

export const plannerApi = {
  getToday: (date?: string) =>
    api.get("/planner/today", { params: { date } }),

  optimise: (data: { date: string }) =>
    api.post("/planner/optimise", data),

  getGaps: (date?: string) =>
    api.get("/planner/gaps", { params: { date } }),
};

// ─── Bookings API ──────────────────────────────────────────────────────────────

export const bookingsApi = {
  list: (params?: { status?: string }) =>
    api.get("/bookings", { params }),

  get: (id: string) => api.get(`/bookings/${id}`),

  approve: (id: string) =>
    api.patch(`/bookings/${id}/approve`),

  decline: (id: string, data?: { reason?: string }) =>
    api.patch(`/bookings/${id}/decline`, data),
};

// ─── Public Booking API ────────────────────────────────────────────────────────

export const bookingPageApi = {
  getSlots: (username: string, date: string) =>
    api.get(`/book/${username}/slots`, { params: { date } }),

  requestBooking: (
    username: string,
    data: {
      client_name: string;
      client_email: string;
      client_phone?: string;
      address: string;
      service_type: string;
      requested_time: string;
      document_type?: string;
      notes?: string;
    }
  ) => api.post(`/book/${username}/request`, data),
};

// ─── Invoice API ──────────────────────────────────────────────────────────────

export const invoicesApi = {
  list: (params?: { status?: string }) =>
    api.get("/invoices", { params }),

  get: (id: string) => api.get(`/invoices/${id}`),

  markPaid: (id: string) =>
    api.patch(`/invoices/${id}/mark-paid`),
};

// ─── Reports API ──────────────────────────────────────────────────────────────

export const reportsApi = {
  getEarnings: (params?: { from?: string; to?: string; groupBy?: string }) =>
    api.get("/reports/earnings", { params }),

  getMileage: (year: number) =>
    api.get("/reports/mileage", { params: { year } }),

  getJournal: (params?: { from?: string; to?: string }) =>
    api.get("/reports/journal", { params }),

  createJournalEntry: (data: {
    entry_date: string;
    act_type: string;
    signer_name: string;
    signer_id_type?: string;
    signer_id_number?: string;
    document_type?: string;
    address?: string;
    fee_charged?: number;
    notes?: string;
    job_id?: string;
  }) => api.post("/reports/journal", data),
};

// ─── Billing API ───────────────────────────────────────────────────────────────

export const billingApi = {
  subscribe: (data: { variantId: string }) =>
    api.post("/billing/subscribe", data),

  cancel: () => api.post("/billing/cancel"),

  getPortalUrl: () => api.get("/billing/portal"),
};

// ─── Notifications API ────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => api.get("/notifications"),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
};
