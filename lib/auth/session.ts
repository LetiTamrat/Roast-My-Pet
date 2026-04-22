import { supabaseRoute, supabaseService } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: "user" | "admin";
}

export interface AppSession {
  userId: string;
  email: string | null;
  profile: Profile | null;
}

export async function getSession(): Promise<AppSession | null> {
  const route = await supabaseRoute();
  const { data: auth } = await route.auth.getUser();
  if (!auth?.user) return null;

  const sb = supabaseService();
  const { data: profile } = await sb
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, role")
    .eq("id", auth.user.id)
    .maybeSingle();

  return {
    userId: auth.user.id,
    email: auth.user.email ?? null,
    profile: profile as Profile | null,
  };
}

export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
