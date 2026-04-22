import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  supabaseRoute,
  supabaseService,
  AVATARS_BUCKET,
  storagePublicUrl,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const Schema = z.object({
  contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
});

function extFrom(ct: string) {
  return ct === "image/png" ? "png" : ct === "image/webp" ? "webp" : "jpg";
}

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }
  const route = await supabaseRoute();
  const { data: auth } = await route.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const path = `${auth.user.id}/${nanoid(12)}.${extFrom(parsed.data.contentType)}`;
  const sb = supabaseService();
  const { data, error } = await sb.storage
    .from(AVATARS_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json(
      { error: "UPLOAD_URL_FAILED", message: error?.message || "Could not sign URL." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl: storagePublicUrl(AVATARS_BUCKET, path),
  });
}
