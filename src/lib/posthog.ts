import posthog from "posthog-js";

let initialized = false;

function getPostHog() {
  if (!initialized && typeof window !== "undefined") {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    const isProduction = process.env.NODE_ENV === "production";

    if (key) {
      posthog.init(key, {
        // In production, route through /ingest proxy to bypass ad blockers.
        // In development, hit PostHog directly.
        api_host: isProduction ? "/ingest" : host,
        ui_host: host,
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        session_recording: {
          maskTextSelector: ".ph-no-capture",
        },
        persistence: "localStorage",
      });
    }
    initialized = true;
  }
  return posthog;
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>,
) {
  getPostHog()?.identify(userId, properties);
}

export function resetUser() {
  getPostHog()?.reset();
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  getPostHog()?.capture(event, properties);
}

export { getPostHog };
