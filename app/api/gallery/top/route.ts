import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { cacheGet, cacheSet } from "@/lib/redis";

export const runtime = "nodejs";

interface TopItem {
  short_id: string;
  pet_name: string;
  archetype: string;
  archetype_emoji: string;
  roast_text: string;
  thumb_url: string;
  reaction_count: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") || "all") as "today" | "week" | "all";
  const cacheKey = `gallery:top:${period}`;
  const cached = await cacheGet<{ items: TopItem[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  const sinceDate = (() => {
    const d = new Date();
    if (period === "today") {
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    if (period === "week") {
      d.setDate(d.getDate() - 7);
      return d.toISOString();
    }
    return null;
  })();

  const sb = supabaseService();
  let roastsQuery = sb
    .from("roasts")
    .select("id, short_id, pet_name, archetype, archetype_emoji, roast_text, created_at")
    .eq("is_public", true)
    .eq("is_flagged", false)
    .order("created_at", { ascending: false })
    .limit(300);
  if (sinceDate) roastsQuery = roastsQuery.gte("created_at", sinceDate);

  const { data: roasts } = await roastsQuery;
  if (!roasts?.length) {
    const empty = { items: [] };
    await cacheSet(cacheKey, empty, 300);
    return NextResponse.json(empty);
  }

  const ids = roasts.map((r) => r.id);
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

  const items: TopItem[] = roasts
    .map((r) => ({
      short_id: r.short_id,
      pet_name: r.pet_name,
      archetype: r.archetype,
      archetype_emoji: r.archetype_emoji,
      roast_text: r.roast_text,
      thumb_url: thumbByRoast.get(r.id) || "",
      reaction_count: reactionCounts.get(r.id) || 0,
    }))
    .filter((r) => r.thumb_url)
    .sort((a, b) => b.reaction_count - a.reaction_count)
    .slice(0, 10);

  const payload = { items };
  await cacheSet(cacheKey, payload, 300);
  return NextResponse.json(payload, {
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
