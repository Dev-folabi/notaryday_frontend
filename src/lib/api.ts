import axios, { type AxiosInstance, type AxiosError } from "axios";
import { deleteAuthCookie } from "./utils";

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

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const isPublicRoute =
          ["/login", "/signup", "/forgot-password"].some((route) =>
            window.location.pathname.startsWith(route),
          ) ||
          window.location.pathname.startsWith("/reset-password") ||
          window.location.pathname.startsWith("/book/");

        if (!isPublicRoute) {
          localStorage.removeItem("auth_token");
          deleteAuthCookie();
          window.location.href = "/login";
        }
      }
    }

    const errorData = error.response?.data?.error ?? {
      code: "UNKNOWN_ERROR",
      message: error.message ?? "An unexpected error occurred",
      statusCode: status ?? 500,
    };

    return Promise.reject(errorData);
  },
);

export default api;
