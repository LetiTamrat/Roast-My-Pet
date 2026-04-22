import { timingSafeEqual } from "node:crypto";
import { supabaseRoute, supabaseService } from "@/lib/supabase/server";
import type { RoastRow } from "@/lib/supabase/types";

export type AccessVia = "session" | "token" | "admin";

export class AccessError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function constantEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export async function resolveRoastAccess(
  shortId: string,
  providedToken?: string | null
): Promise<{ roast: RoastRow; via: AccessVia; userId: string | null }> {
  const sb = supabaseService();
  const { data: roast, error } = await sb
    .from("roasts")
    .select("*")
    .eq("short_id", shortId)
    .maybeSingle();

  if (error) throw new AccessError(500, "DB_ERROR", error.message);
  if (!roast) throw new AccessError(404, "NOT_FOUND", "Roast not found");

  const route = await supabaseRoute();
  const { data: auth } = await route.auth.getUser();
  const userId = auth?.user?.id ?? null;

  if (userId && roast.user_id === userId) {
    return { roast: roast as RoastRow, via: "session", userId };
  }

  if (providedToken && constantEq(providedToken, roast.owner_token)) {
    return { roast: roast as RoastRow, via: "token", userId };
  }

  if (userId) {
    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.role === "admin") {
      return { roast: roast as RoastRow, via: "admin", userId };
    }
  }

  throw new AccessError(403, "FORBIDDEN", "You don't own this roast.");
}
