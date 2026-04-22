import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { supabaseService, UPLOAD_BUCKET, storagePublicUrl } from "@/lib/supabase/server";
import { limit } from "@/lib/ratelimit";
import { getClientIp, hashIp } from "@/lib/utils";

export const runtime = "nodejs";

const BodySchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp|heic|heif)$/, "Unsupported type"),
});

function extFrom(contentType: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return map[contentType] || "jpg";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  const ipHash = await hashIp(ip);
  const rl = await limit("upload", ipHash);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many uploads. Take a breath.", retry_after: rl.retryAfter },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } }
    );
  }

  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const id = nanoid(16);
  const ext = extFrom(parsed.data.contentType);
  const path = `${yyyy}/${mm}/${dd}/${id}.${ext}`;

  try {
    const sb = supabaseService();
    const { data, error } = await sb.storage.from(UPLOAD_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw error || new Error("signed url failed");

    // The signed upload URL from Supabase already includes the token.
    // We also return the token separately in case the client wants to set Authorization manually.
    return NextResponse.json({
      uploadUrl: data.signedUrl,
      token: data.token,
      path,
      publicUrl: storagePublicUrl(UPLOAD_BUCKET, path),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "UPLOAD_URL_FAILED",
        message: err instanceof Error ? err.message : "Could not create upload URL.",
      },
      { status: 500 }
    );
  }
}
