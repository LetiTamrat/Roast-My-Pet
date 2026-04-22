import { NextResponse } from "next/server";
import { supabaseService, UPLOAD_BUCKET } from "@/lib/supabase/server";

export const runtime = "nodejs";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // allow in dev
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const sb = supabaseService();

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: toDelete, error } = await sb
    .from("roasts")
    .select("id, source_image_path")
    .is("user_id", null)
    .eq("is_public", false)
    .lt("created_at", cutoff);

  if (error) {
    return NextResponse.json({ error: "DB_ERROR", message: error.message }, { status: 500 });
  }

  const ids = (toDelete || []).map((r) => r.id);
  const paths = (toDelete || [])
    .map((r) => r.source_image_path)
    .filter((p): p is string => !!p);

  if (paths.length) {
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      await sb.storage.from(UPLOAD_BUCKET).remove(chunk);
    }
  }

  if (ids.length) {
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      await sb.from("roasts").delete().in("id", chunk);
    }
  }

  return NextResponse.json({ ok: true, deleted: ids.length });
}
