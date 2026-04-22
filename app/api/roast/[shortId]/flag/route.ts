import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/server";
import { limit } from "@/lib/ratelimit";
import { getClientIp, hashIp } from "@/lib/utils";

export const runtime = "nodejs";

const Schema = z.object({ reason: z.string().trim().min(2).max(500).optional() });
const AUTO_FLAG_THRESHOLD = 3;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await ctx.params;
  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const ipHash = await hashIp(ip);
  const rl = await limit("flag", ipHash);
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

  await sb
    .from("flags")
    .upsert(
      {
        roast_id: roast.id,
        reason: parsed.data.reason ?? null,
        reporter_ip_hash: ipHash,
        status: "pending",
      },
      { onConflict: "roast_id,reporter_ip_hash" }
    );

  const { count } = await sb
    .from("flags")
    .select("id", { count: "exact", head: true })
    .eq("roast_id", roast.id)
    .eq("status", "pending");

  if ((count ?? 0) >= AUTO_FLAG_THRESHOLD) {
    await sb
      .from("roasts")
      .update({ is_flagged: true, is_public: false })
      .eq("id", roast.id);
  }

  return NextResponse.json({ ok: true });
}
