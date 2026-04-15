import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds default
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query key factories
export const queryKeys = {
  // Auth
  me: ["me"] as const,

  // User
  profile: ["profile"] as const,
  settings: ["settings"] as const,
  signingDefaults: ["signingDefaults"] as const,

  // Jobs
  jobs: (params?: { date?: string; status?: string; page?: number; limit?: number }) =>
    ["jobs", params] as const,
  job: (id: string) => ["job", id] as const,

  // CITT
  citt: (params: { address: string; appointment_time: string; signing_type: string }) =>
    ["citt", params] as const,

  // Planner
  plannerToday: (date: string) => ["planner", "today", date] as const,
  plannerGaps: (date: string) => ["planner", "gaps", date] as const,

  // Bookings (notary review)
  bookings: (params?: { status?: string }) => ["bookings", params] as const,
  booking: (id: string) => ["booking", id] as const,

  // Public booking page
  bookingSlots: (username: string, date: string) =>
    ["bookingPage", username, date] as const,

  // Invoices
  invoices: (params?: { status?: string }) => ["invoices", params] as const,
  invoice: (id: string) => ["invoice", id] as const,

  // Reports
  earnings: (params: { from?: string; to?: string; groupBy?: string }) =>
    ["reports", "earnings", params] as const,
  mileage: (year: number) => ["reports", "mileage", year] as const,
  journal: (params: { from?: string; to?: string }) =>
    ["reports", "journal", params] as const,

  // Notifications
  notifications: ["notifications"] as const,
};
