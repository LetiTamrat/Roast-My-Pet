import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseRoute, supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Schema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores.")
    .optional(),
  display_name: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(280).optional(),
  avatar_url: z.string().url().max(500).nullable().optional(),
});

// Must match every top-level static route, every reserved utility path, and
// any Next metadata file that lives at the site root.
const RESERVED = new Set([
  "about", "admin", "api", "apple_icon", "auth", "favicon", "gallery", "icon",
  "login", "logo", "manifest", "me", "my_roasts", "myroasts", "null",
  "og_default", "opengraph_image", "privacy", "profile", "public", "r",
  "robots", "root", "settings", "signup", "sitemap", "supabase", "system",
  "terms", "u", "undefined", "upload",
]);

export async function PATCH(req: Request) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 }
    );
  }
  const route = await supabaseRoute();
  const { data: auth } = await route.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.username !== undefined) {
    if (RESERVED.has(parsed.data.username)) {
      return NextResponse.json(
        { error: "RESERVED_USERNAME", message: "That username is reserved." },
        { status: 400 }
      );
    }
    updates.username = parsed.data.username;
  }
  if (parsed.data.display_name !== undefined) updates.display_name = parsed.data.display_name || null;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio || null;
  if (parsed.data.avatar_url !== undefined) updates.avatar_url = parsed.data.avatar_url;
  updates.updated_at = new Date().toISOString();

  const sb = supabaseService();
  const { data, error } = await sb
    .from("profiles")
    .update(updates)
    .eq("id", auth.user.id)
    .select("id, username, display_name, avatar_url, bio, role")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "USERNAME_TAKEN", message: "That username is already taken." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "DB_ERROR", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data });
}
