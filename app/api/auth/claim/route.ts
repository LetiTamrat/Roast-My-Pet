import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseRoute, supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Schema = z.object({
  tokens: z
    .array(
      z.object({
        short_id: z.string().min(4).max(32),
        owner_token: z.string().min(8).max(64),
      })
    )
    .max(50),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }
  if (!parsed.data.tokens.length) {
    return NextResponse.json({ claimed: [], failed: [] });
  }

  const route = await supabaseRoute();
  const { data: auth } = await route.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to claim roasts." },
      { status: 401 }
    );
  }

  const byShortId = new Map(parsed.data.tokens.map((t) => [t.short_id, t.owner_token]));
  const shortIds = Array.from(byShortId.keys());

  const sb = supabaseService();
  const { data: rows, error } = await sb
    .from("roasts")
    .select("id, short_id, owner_token, user_id")
    .in("short_id", shortIds);

  if (error) {
    return NextResponse.json({ error: "DB_ERROR", message: error.message }, { status: 500 });
  }

  const claimed: string[] = [];
  const failed: string[] = [];

  for (const row of rows || []) {
    const token = byShortId.get(row.short_id);
    if (!token) continue;
    if (row.user_id && row.user_id !== auth.user.id) {
      failed.push(row.short_id);
      continue;
    }
    if (row.owner_token !== token) {
      failed.push(row.short_id);
      continue;
    }
    const { error: updErr } = await sb
      .from("roasts")
      .update({ user_id: auth.user.id })
      .eq("id", row.id);
    if (updErr) failed.push(row.short_id);
    else claimed.push(row.short_id);
  }

  // Also mark short_ids that simply didn't exist as failed so client removes them.
  for (const sid of shortIds) {
    if (!claimed.includes(sid) && !failed.includes(sid)) {
      failed.push(sid);
    }
  }

  return NextResponse.json({ claimed, failed });
}
