"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { initPostHog } from "@/lib/analytics";
import { ClaimOnLogin } from "@/components/auth/claim-on-login";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const t = setTimeout(() => initPostHog(), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      {children}
      <ClaimOnLogin />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
