"use client";

import { ReactNode, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PostHogProvider } from "posthog-js/react";
import { getPostHog } from "@/lib/posthog";

export function Providers({ children }: { children: ReactNode }) {
  // Ensure a single QueryClient instance per app lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 mins
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // Initialize PostHog once on mount (client-side only)
  const [posthogClient] = useState(() => getPostHog());

  return (
    <PostHogProvider client={posthogClient}>
      <QueryClientProvider client={queryClient}>
        {children}

        {/* Devtools (only in development) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PostHogProvider>
  );
}