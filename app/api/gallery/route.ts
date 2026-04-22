import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { cacheGet, cacheSet } from "@/lib/redis";

export const runtime = "nodejs";

interface GalleryItem {
  short_id: string;
  pet_name: string;
  archetype: string;
  archetype_emoji: string;
  thumb_url: string;
  reaction_count: number;
}

export async function GET(req: Request) {
  if (process.env.ENABLE_PUBLIC_GALLERY === "false") {
    return NextResponse.json({ items: [], nextCursor: null });
  }
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 24), 24);
  const cursor = searchParams.get("cursor");
  const archetype = searchParams.get("archetype");
  const level = searchParams.get("level");

  const cacheKey = `gallery:${limit}:${cursor || ""}:${archetype || ""}:${level || ""}`;
  const cached = await cacheGet<{ items: GalleryItem[]; nextCursor: string | null }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  const sb = supabaseService();
  let query = sb
    .from("roasts")
    .select("id, short_id, pet_name, archetype, archetype_emoji, created_at")
    .eq("is_public", true)
    .eq("is_flagged", false)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (archetype) query = query.eq("archetype", archetype);
  if (level) query = query.eq("roast_level", level);
  if (cursor) query = query.lt("created_at", cursor);

  const { data: rows, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "DB_ERROR", message: error.message },
      { status: 500 }
    );
  }

  const slice = (rows || []).slice(0, limit);
  const ids = slice.map((r) => r.id);
  const [{ data: assets }, { data: reactions }] = await Promise.all([
    sb.from("meme_assets").select("roast_id, url").in("roast_id", ids).eq("format", "square"),
    sb.from("reactions").select("roast_id").in("roast_id", ids),
  ]);
  const thumbByRoast = new Map<string, string>();
  for (const a of assets || []) thumbByRoast.set(a.roast_id, a.url);
  const reactionCounts = new Map<string, number>();
  for (const r of reactions || []) {
    reactionCounts.set(r.roast_id, (reactionCounts.get(r.roast_id) || 0) + 1);
  }

  const items: GalleryItem[] = slice
    .filter((r) => thumbByRoast.get(r.id))
    .map((r) => ({
      short_id: r.short_id,
      pet_name: r.pet_name,
      archetype: r.archetype,
      archetype_emoji: r.archetype_emoji,
      thumb_url: thumbByRoast.get(r.id)!,
      reaction_count: reactionCounts.get(r.id) || 0,
    }));

  const nextCursor =
    (rows || []).length > limit ? slice[slice.length - 1]?.created_at || null : null;

  const payload = { items, nextCursor };
  await cacheSet(cacheKey, payload, 60);

  return NextResponse.json(payload, {
    headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
