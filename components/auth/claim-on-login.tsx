"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/browser";

const PREFIX = "roast:owner:";

function readLocalTokens(): Array<{ short_id: string; owner_token: string }> {
  if (typeof window === "undefined") return [];
  const tokens: Array<{ short_id: string; owner_token: string }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    const short_id = key.slice(PREFIX.length);
    const owner_token = localStorage.getItem(key);
    if (!short_id || !owner_token) continue;
    tokens.push({ short_id, owner_token });
  }
  return tokens;
}

async function claimAll(): Promise<void> {
  const tokens = readLocalTokens();
  if (!tokens.length) return;
  try {
    const res = await fetch("/api/auth/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tokens }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { claimed?: string[]; failed?: string[] };
    const claimed = data.claimed || [];
    const failed = data.failed || [];
    for (const short_id of claimed) {
      localStorage.removeItem(`${PREFIX}${short_id}`);
    }
    // Failed == doesn't exist here or token didn't match: strip local entry.
    for (const short_id of failed) {
      localStorage.removeItem(`${PREFIX}${short_id}`);
    }
    if (claimed.length) {
      toast.success(
        `Added ${claimed.length} roast${claimed.length === 1 ? "" : "s"} to your account.`
      );
    }
  } catch {
    // Silent — next login will retry.
  }
}

export function ClaimOnLogin() {
  useEffect(() => {
    const supabase = supabaseBrowser();
    // Run once on mount in case a session already exists server-side.
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) claimAll();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        claimAll();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}
