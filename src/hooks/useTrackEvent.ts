"use client";

import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

/**
 * Convenience hook for tracking custom analytics events.
 * No-op when PostHog is not configured.
 */
export function useTrackEvent() {
  const posthog = usePostHog();

  return useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      posthog?.capture(event, properties);
    },
    [posthog],
  );
}
