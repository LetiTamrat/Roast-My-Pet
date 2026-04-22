import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/server";
import { limit } from "@/lib/ratelimit";
import { getClientIp, hashIp } from "@/lib/utils";

export const runtime = "nodejs";

const Schema = z.object({
  channel: z.enum([
    "instagram",
    "tiktok",
    "x",
    "whatsapp",
    "facebook",
    "copy_link",
    "download",
    "download_story",
    "native",
  ]),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Invalid channel" },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  const ipHash = await hashIp(ip);
  const rl = await limit("share", ipHash);
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
  if (!roast) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await sb.from("share_events").insert({
    roast_id: roast.id,
    channel: parsed.data.channel,
    ip_hash: ipHash,
    user_agent: req.headers.get("user-agent")?.slice(0, 200) || null,
  });

  return NextResponse.json({ ok: true });
}
