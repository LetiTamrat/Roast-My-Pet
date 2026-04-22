import { NextResponse } from "next/server";
import { z } from "zod";
import {
  supabaseService,
  supabaseRoute,
  UPLOAD_BUCKET,
  MEMES_BUCKET,
  storagePublicUrl,
} from "@/lib/supabase/server";
import { limit } from "@/lib/ratelimit";
import { cacheGet, cacheSet, incrementDailyCounter, todayKey } from "@/lib/redis";
import { getClientIp, hashIp, sha256Hex, absoluteUrl } from "@/lib/utils";
import { shortId, ownerToken } from "@/lib/short-id";
import { moderateImage, ModerationError } from "@/lib/gemini/moderate";
import { generateRoast, GenerationError } from "@/lib/gemini/roast";
import { renderMeme, FORMAT_DIMENSIONS } from "@/lib/meme/render";
import type { MemeFormat } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  image_url: z.string().url(),
  image_path: z.string().optional(),
  pet_name: z.string().trim().min(1).max(30),
  pet_type: z
    .enum(["dog", "cat", "bird", "rabbit", "reptile", "exotic", "other"])
    .nullable()
    .optional(),
  traits: z.array(z.string().min(1).max(30)).max(5).default([]),
  roast_level: z.enum(["cute", "medium", "savage"]),
  roast_style: z.enum([
    "default",
    "standup",
    "shakespearean",
    "genz",
    "corporate",
    "pirate",
    "rap",
  ]),
});

function extractPath(url: string): string | null {
  try {
    const u = new URL(url);
    const marker = `/storage/v1/object/public/${UPLOAD_BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx >= 0) return u.pathname.slice(idx + marker.length);
    const signedMarker = `/storage/v1/object/sign/${UPLOAD_BUCKET}/`;
    const sIdx = u.pathname.indexOf(signedMarker);
    if (sIdx >= 0) return u.pathname.slice(sIdx + signedMarker.length);
    return null;
  } catch {
    return null;
  }
}

async function downloadBytes(path: string): Promise<{ bytes: Buffer; mime: string }> {
  const sb = supabaseService();
  const { data, error } = await sb.storage.from(UPLOAD_BUCKET).download(path);
  if (error || !data) throw new Error(`Download failed: ${error?.message || "unknown"}`);
  const ab = await data.arrayBuffer();
  return { bytes: Buffer.from(ab), mime: data.type || "image/jpeg" };
}

async function makeSignedSourceUrl(path: string): Promise<string> {
  const sb = supabaseService();
  const { data, error } = await sb.storage
    .from(UPLOAD_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error || !data) throw new Error(`sign source url: ${error?.message || "unknown"}`);
  return data.signedUrl;
}

export async function POST(req: Request) {
  const started = Date.now();
  const raw = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const ip = getClientIp(req);
  const ipHash = await hashIp(ip);

  // If user is signed in, we'll attribute the roast to their account.
  const route = await supabaseRoute();
  const { data: auth } = await route.auth.getUser();
  const currentUserId: string | null = auth?.user?.id ?? null;

  const rl = await limit("roast", ipHash);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "You've hit the hourly roast limit. Come back in a bit.",
        retry_after: rl.retryAfter,
      },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } }
    );
  }

  const cap = Number(process.env.DAILY_GENERATION_CAP || 10000);
  if (cap > 0) {
    const count = await incrementDailyCounter(`roasts:count:${todayKey()}`);
    if (count > cap) {
      return NextResponse.json(
        {
          error: "DAILY_CAP_REACHED",
          message: "We've generated a lot of roasts today. Please try again tomorrow.",
        },
        { status: 503 }
      );
    }
  }

  const storagePath = body.image_path || extractPath(body.image_url);
  if (!storagePath) {
    return NextResponse.json(
      {
        error: "BAD_REQUEST",
        message: "Could not resolve image path. Upload the photo again.",
      },
      { status: 400 }
    );
  }

  let imageBytes: Buffer;
  let imageMime: string;
  try {
    const dl = await downloadBytes(storagePath);
    imageBytes = dl.bytes;
    imageMime = dl.mime;
  } catch {
    return NextResponse.json(
      {
        error: "IMAGE_FETCH_FAILED",
        message:
          "We couldn't read the uploaded photo. Try again with a different image.",
      },
      { status: 400 }
    );
  }

  const imageHash = await sha256Hex(
    imageBytes.toString("base64").slice(0, 4096) + imageBytes.length
  );
  const dedupeKey = `dedupe:${imageHash}|${body.pet_name}|${body.traits
    .slice()
    .sort()
    .join(",")}|${body.roast_level}|${body.roast_style}`;
  const cachedShortId = await cacheGet<string>(dedupeKey);
  if (cachedShortId) {
    const sb = supabaseService();
    const { data: existing } = await sb
      .from("roasts")
      .select("*")
      .eq("short_id", cachedShortId)
      .maybeSingle();
    if (existing) {
      const { data: memes } = await sb
        .from("meme_assets")
        .select("format, url")
        .eq("roast_id", existing.id);
      const meme_urls: Record<string, string> = {};
      for (const m of memes || []) meme_urls[m.format] = m.url;
      return NextResponse.json({
        id: existing.id,
        short_id: existing.short_id,
        roast: existing.roast_text,
        archetype: existing.archetype,
        archetype_emoji: existing.archetype_emoji,
        vibe_tags: existing.vibe_tags,
        follow_up: existing.follow_up,
        meme_urls,
        share_url: absoluteUrl(`/r/${existing.short_id}`),
        owner_token: null,
        cached: true,
      });
    }
  }

  try {
    const imageBase64 = imageBytes.toString("base64");

    await moderateImage({ imageBase64, mimeType: imageMime });

    const roastResult = await generateRoast({
      imageBase64,
      mimeType: imageMime,
      petName: body.pet_name,
      petType: body.pet_type ?? null,
      traits: body.traits,
      level: body.roast_level,
      style: body.roast_style,
    });

    const sId = shortId();
    const oToken = ownerToken();

    const signedUrl = await makeSignedSourceUrl(storagePath);

    const formats: Array<{ fmt: MemeFormat; template: "classic" }> = [
      { fmt: "square", template: "classic" },
      { fmt: "story", template: "classic" },
      { fmt: "landscape", template: "classic" },
    ];

    const renderedMemes = await Promise.all(
      formats.map(async ({ fmt, template }) => {
        const png = await renderMeme({
          format: fmt,
          template,
          petImageUrl: signedUrl,
          roast: roastResult.roast,
          petName: body.pet_name,
          archetype: roastResult.archetype,
          archetypeEmoji: roastResult.archetype_emoji,
          level: body.roast_level,
        });
        return { fmt, template, png };
      })
    );

    const sb = supabaseService();

    const uploaded = await Promise.all(
      renderedMemes.map(async ({ fmt, template, png }) => {
        const memePath = `${sId}_${fmt}.png`;
        const { error: upErr } = await sb.storage
          .from(MEMES_BUCKET)
          .upload(memePath, png, {
            contentType: "image/png",
            cacheControl: "31536000",
            upsert: true,
          });
        if (upErr) throw new Error(`Meme upload (${fmt}): ${upErr.message}`);
        return {
          format: fmt,
          template,
          url: storagePublicUrl(MEMES_BUCKET, memePath),
          width: FORMAT_DIMENSIONS[fmt].width,
          height: FORMAT_DIMENSIONS[fmt].height,
          bytes: png.length,
        };
      })
    );

    const generation_ms = Date.now() - started;

    const { data: inserted, error: insertErr } = await sb
      .from("roasts")
      .insert({
        short_id: sId,
        pet_name: body.pet_name,
        pet_type: body.pet_type ?? null,
        traits: body.traits,
        roast_level: body.roast_level,
        roast_style: body.roast_style,
        source_image_url: storagePublicUrl(UPLOAD_BUCKET, storagePath),
        source_image_path: storagePath,
        image_hash: imageHash,
        roast_text: roastResult.roast,
        archetype: roastResult.archetype,
        archetype_emoji: roastResult.archetype_emoji,
        vibe_tags: roastResult.vibe_tags,
        follow_up: roastResult.follow_up_zinger,
        visual_observation: roastResult.visual_observation,
        model_used: roastResult.model_used,
        generation_ms,
        owner_token: oToken,
        ip_hash: ipHash,
        user_id: currentUserId,
      })
      .select("*")
      .single();

    if (insertErr || !inserted) {
      throw new Error(insertErr?.message || "Insert failed");
    }

    const assetRows = uploaded.map((u) => ({
      roast_id: inserted.id,
      format: u.format,
      template: u.template,
      url: u.url,
      width: u.width,
      height: u.height,
      bytes: u.bytes,
    }));
    await sb.from("meme_assets").insert(assetRows);

    const meme_urls: Record<string, string> = {};
    for (const u of uploaded) meme_urls[u.format] = u.url;

    await cacheSet(dedupeKey, sId, 60 * 60 * 24);

    return NextResponse.json({
      id: inserted.id,
      short_id: sId,
      roast: roastResult.roast,
      archetype: roastResult.archetype,
      archetype_emoji: roastResult.archetype_emoji,
      vibe_tags: roastResult.vibe_tags,
      follow_up: roastResult.follow_up_zinger,
      meme_urls,
      share_url: absoluteUrl(`/r/${sId}`),
      owner_token: oToken,
    });
  } catch (err) {
    if (err instanceof ModerationError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: 400 }
      );
    }
    if (err instanceof GenerationError) {
      return NextResponse.json(
        { error: "GENERATION_FAILED", message: "We couldn't write a roast. Try again." },
        { status: 500 }
      );
    }
    console.error("[/api/roast] error:", err);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
