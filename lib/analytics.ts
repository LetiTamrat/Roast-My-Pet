"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (initialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: true,
    person_profiles: "identified_only",
    loaded: () => {
      initialized = true;
    },
  });
  initialized = true;
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!initialized) initPostHog();
  try {
    posthog.capture(event, props);
  } catch {
    // swallow
  }
}

export function usePageView(name: string, props?: Record<string, unknown>) {
  useEffect(() => {
    track("page_viewed", { page: name, ...props });
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps
}
