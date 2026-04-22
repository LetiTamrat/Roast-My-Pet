import { supabaseRoute, supabaseService } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  username: string | null;
  displayName: string | null;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const route = await supabaseRoute();
  const { data: auth } = await route.auth.getUser();
  if (!auth?.user) return null;
  const sb = supabaseService();
  const { data: profile } = await sb
    .from("profiles")
    .select("role, username, display_name")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin") return null;
  return {
    userId: auth.user.id,
    username: profile.username ?? null,
    displayName: profile.display_name ?? null,
  };
}
