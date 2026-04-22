import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/server";
import { cacheDel } from "@/lib/redis";
import { resolveRoastAccess, AccessError } from "@/lib/auth/roast-access";

export const runtime = "nodejs";

const Schema = z.object({
  is_public: z.boolean(),
  owner_token: z.string().min(10).max(64).optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await ctx.params;
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  try {
    const { roast } = await resolveRoastAccess(shortId, parsed.data.owner_token);
    const sb = supabaseService();
    await sb.from("roasts").update({ is_public: parsed.data.is_public }).eq("id", roast.id);
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
