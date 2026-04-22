import { NextResponse } from "next/server";
import { supabaseService, UPLOAD_BUCKET, MEMES_BUCKET } from "@/lib/supabase/server";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";
import { REACTION_EMOJIS } from "@/lib/reactions";
import { resolveRoastAccess, AccessError } from "@/lib/auth/roast-access";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await ctx.params;
  const cacheKey = `roast:${shortId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  const sb = supabaseService();
  const { data: roast } = await sb
    .from("roasts")
    .select("*")
    .eq("short_id", shortId)
    .maybeSingle();

  if (!roast) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Roast not found" }, { status: 404 });
  }
  if (roast.is_flagged) {
    return NextResponse.json({ error: "REMOVED", message: "This roast was removed." }, { status: 410 });
  }

  const { data: memes } = await sb
    .from("meme_assets")
    .select("format, url, width, height")
    .eq("roast_id", roast.id);
  const meme_urls: Record<string, string> = {};
  for (const m of memes || []) meme_urls[m.format] = m.url;

  const { data: reactions } = await sb.from("reactions").select("emoji").eq("roast_id", roast.id);
  const counts: Record<string, number> = {};
  for (const e of REACTION_EMOJIS) counts[e] = 0;
  for (const r of reactions || []) counts[r.emoji] = (counts[r.emoji] || 0) + 1;

  const payload = {
    id: roast.id,
    short_id: roast.short_id,
    pet_name: roast.pet_name,
    roast: roast.roast_text,
    archetype: roast.archetype,
    archetype_emoji: roast.archetype_emoji,
    vibe_tags: roast.vibe_tags,
    follow_up: roast.follow_up,
    level: roast.roast_level,
    is_public: roast.is_public,
    meme_urls,
    reactions: counts,
    created_at: roast.created_at,
  };
  await cacheSet(cacheKey, payload, 60);
  return NextResponse.json(payload, {
    headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}

function memePathFromUrl(url: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${MEMES_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx < 0) return null;
    return url.slice(idx + marker.length);
  } catch {
    return null;
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await ctx.params;
  let body: { owner_token?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  try {
    const { roast } = await resolveRoastAccess(shortId, body.owner_token);

    const sb = supabaseService();

    // Storage: remove source image + all meme variants.
    if (roast.source_image_path) {
      await sb.storage.from(UPLOAD_BUCKET).remove([roast.source_image_path]);
    }
    const { data: memes } = await sb
      .from("meme_assets")
      .select("url")
      .eq("roast_id", roast.id);
    const memePaths =
      memes?.map((m) => memePathFromUrl(m.url)).filter((p): p is string => !!p) || [];
    if (memePaths.length) {
      await sb.storage.from(MEMES_BUCKET).remove(memePaths);
    }

    // Delete the row — FK cascades take care of meme_assets, reactions, flags, shares.
    const { error } = await sb.from("roasts").delete().eq("id", roast.id);
    if (error) throw new Error(error.message);

    await cacheDel(`roast:${shortId}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AccessError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
