import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/server";
import { limit } from "@/lib/ratelimit";
import { getClientIp, hashIp } from "@/lib/utils";
import { cacheDel } from "@/lib/redis";

export const runtime = "nodejs";

const REACTIONS = ["😂", "🔥", "💀", "😭", "👑"] as const;
const Schema = z.object({ emoji: z.enum(REACTIONS) });

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
  const rl = await limit("reaction", ipHash);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "RATE_LIMITED", retry_after: rl.retryAfter },
      { status: 429 }
    );
  }

  const sb = supabaseService();
  const { data: roast } = await sb
    .from("roasts")
    .select("id")
    .eq("short_id", shortId)
    .maybeSingle();
  if (!roast) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const { data: existing } = await sb
    .from("reactions")
    .select("id")
    .eq("roast_id", roast.id)
    .eq("emoji", parsed.data.emoji)
    .eq("ip_hash", ipHash)
    .maybeSingle();

  if (existing) {
    await sb.from("reactions").delete().eq("id", existing.id);
  } else {
    await sb.from("reactions").insert({
      roast_id: roast.id,
      emoji: parsed.data.emoji,
      ip_hash: ipHash,
    });
  }

  const { data: all } = await sb
    .from("reactions")
    .select("emoji")
    .eq("roast_id", roast.id);
  const counts: Record<string, number> = {};
  for (const e of REACTIONS) counts[e] = 0;
  for (const r of all || []) counts[r.emoji] = (counts[r.emoji] || 0) + 1;

  await cacheDel(`roast:${shortId}`);

  return NextResponse.json({ ok: true, counts });
}
