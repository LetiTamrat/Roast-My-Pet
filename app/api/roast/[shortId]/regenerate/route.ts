import { NextResponse } from "next/server";
import { z } from "zod";
import {
  supabaseService,
  UPLOAD_BUCKET,
  MEMES_BUCKET,
  storagePublicUrl,
} from "@/lib/supabase/server";
import { limit } from "@/lib/ratelimit";
import { getClientIp, hashIp } from "@/lib/utils";
import { cacheDel } from "@/lib/redis";
import { moderateImage, ModerationError } from "@/lib/gemini/moderate";
import { generateRoast, GenerationError } from "@/lib/gemini/roast";
import { renderMeme, FORMAT_DIMENSIONS } from "@/lib/meme/render";
import type { MemeFormat } from "@/lib/supabase/types";
import { resolveRoastAccess, AccessError } from "@/lib/auth/roast-access";

export const runtime = "nodejs";
export const maxDuration = 60;

const Schema = z.object({ owner_token: z.string().min(10).max(64).optional() });
const MAX_REGENERATIONS = 3;

async function downloadBytes(path: string): Promise<{ bytes: Buffer; mime: string }> {
  const sb = supabaseService();
  const { data, error } = await sb.storage.from(UPLOAD_BUCKET).download(path);
  if (error || !data) throw new Error(`Download failed: ${error?.message || "unknown"}`);
  const ab = await data.arrayBuffer();
  return { bytes: Buffer.from(ab), mime: data.type || "image/jpeg" };
}

async function signedSourceUrl(path: string) {
  const sb = supabaseService();
  const { data, error } = await sb.storage
    .from(UPLOAD_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error || !data) throw new Error(`sign: ${error?.message || "unknown"}`);
  return data.signedUrl;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await ctx.params;
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const ipHash = await hashIp(ip);
  const rl = await limit("roast", ipHash);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "RATE_LIMITED", retry_after: rl.retryAfter },
      { status: 429 }
    );
  }

  let roast;
  try {
    const access = await resolveRoastAccess(shortId, parsed.data.owner_token);
    roast = access.roast;
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

  const sb = supabaseService();

  if ((roast.regenerations ?? 0) >= MAX_REGENERATIONS) {
    return NextResponse.json(
      { error: "REGEN_LIMIT", message: "You've used all your re-rolls for this roast." },
      { status: 400 }
    );
  }
  if (!roast.source_image_path) {
    return NextResponse.json(
      { error: "NO_SOURCE", message: "Original photo is gone. Upload a new one." },
      { status: 400 }
    );
  }

  try {
    const { bytes, mime } = await downloadBytes(roast.source_image_path);
    const imageBase64 = bytes.toString("base64");

    await moderateImage({ imageBase64, mimeType: mime });

    const roastResult = await generateRoast({
      imageBase64,
      mimeType: mime,
      petName: roast.pet_name,
      petType: roast.pet_type,
      traits: roast.traits ?? [],
      level: roast.roast_level,
      style: roast.roast_style,
    });

    const signedUrl = await signedSourceUrl(roast.source_image_path);

    const formats: MemeFormat[] = ["square", "story", "landscape"];
    const rendered = await Promise.all(
      formats.map(async (fmt) => {
        const png = await renderMeme({
          format: fmt,
          template: "classic",
          petImageUrl: signedUrl,
          roast: roastResult.roast,
          petName: roast.pet_name,
          archetype: roastResult.archetype,
          archetypeEmoji: roastResult.archetype_emoji,
          level: roast.roast_level,
        });
        const path = `${shortId}_${fmt}.png`;
        await sb.storage.from(MEMES_BUCKET).upload(path, png, {
          contentType: "image/png",
          cacheControl: "31536000",
          upsert: true,
        });
        return {
          format: fmt,
          url: storagePublicUrl(MEMES_BUCKET, path),
          width: FORMAT_DIMENSIONS[fmt].width,
          height: FORMAT_DIMENSIONS[fmt].height,
          bytes: png.length,
        };
      })
    );

    await sb
      .from("roasts")
      .update({
        roast_text: roastResult.roast,
        archetype: roastResult.archetype,
        archetype_emoji: roastResult.archetype_emoji,
        vibe_tags: roastResult.vibe_tags,
        follow_up: roastResult.follow_up_zinger,
        visual_observation: roastResult.visual_observation,
        regenerations: (roast.regenerations ?? 0) + 1,
      })
      .eq("id", roast.id);

    await sb.from("meme_assets").delete().eq("roast_id", roast.id);
    await sb.from("meme_assets").insert(
      rendered.map((r) => ({
        roast_id: roast.id,
        format: r.format,
        template: "classic" as const,
        url: r.url,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
      }))
    );

    await cacheDel(`roast:${shortId}`);

    const meme_urls: Record<string, string> = {};
    for (const r of rendered) meme_urls[r.format] = r.url;

    return NextResponse.json({
      ok: true,
      roast: roastResult.roast,
      archetype: roastResult.archetype,
      archetype_emoji: roastResult.archetype_emoji,
      follow_up: roastResult.follow_up_zinger,
      meme_urls,
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
        { error: "GENERATION_FAILED", message: "Couldn't regenerate. Try again." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
