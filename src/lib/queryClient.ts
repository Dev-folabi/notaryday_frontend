import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Stable query key factories
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },

  user: {
    profile: ["user", "profile"] as const,
    settings: ["user", "settings"] as const,
    signingDefaults: ["user", "signing-defaults"] as const,
  },

  jobs: {
    all: (filters?: {
      date?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) =>
      [
        "jobs",
        {
          date: filters?.date ?? null,
          status: filters?.status ?? null,
          page: filters?.page ?? null,
          limit: filters?.limit ?? null,
        },
      ] as const,

    detail: (id: string) => ["jobs", id] as const,
  },

  citt: {
    check: (payload: {
      address: string;
      appointment_time: string;
      signing_type: string;
    }) =>
      [
        "citt",
        payload.address,
        payload.appointment_time,
        payload.signing_type,
      ] as const,
  },

  planner: {
    today: (date: string) => ["planner", "today", date] as const,
    gaps: (date: string) => ["planner", "gaps", date] as const,
  },

  bookings: {
    all: (status?: string) =>
      ["bookings", status ?? null] as const,
    detail: (id: string) => ["bookings", id] as const,
  },

  bookingPage: {
    slots: (username: string, date: string) =>
      ["booking-page", username, date] as const,
  },

  invoices: {
    all: (status?: string) =>
      ["invoices", status ?? null] as const,
    detail: (id: string) => ["invoices", id] as const,
  },

  reports: {
    earnings: (params: {
      from?: string;
      to?: string;
      groupBy?: string;
    }) =>
      [
        "reports",
        "earnings",
        {
          from: params.from ?? null,
          to: params.to ?? null,
          groupBy: params.groupBy ?? null,
        },
      ] as const,

    mileage: (year: number) => ["reports", "mileage", year] as const,

    journal: (params: {
      from?: string;
      to?: string;
    }) =>
      [
        "reports",
        "journal",
        {
          from: params.from ?? null,
          to: params.to ?? null,
        },
      ] as const,
  },

  notifications: {
    all: ["notifications"] as const,
  },
};