import { NextResponse } from "next/server";
import { cacheDel } from "@/lib/redis";

export const runtime = "nodejs";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  await Promise.all([
    cacheDel("gallery:top:today"),
    cacheDel("gallery:top:week"),
    cacheDel("gallery:top:all"),
  ]);
  return NextResponse.json({ ok: true });
}
