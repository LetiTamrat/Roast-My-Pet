import { NextResponse, type NextRequest } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

export const runtime = "nodejs";

function safeNext(next: string | null | undefined): string {
  if (!next) return "/my-roasts";
  if (!next.startsWith("/") || next.startsWith("//")) return "/my-roasts";
  return next;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");
  const next = safeNext(searchParams.get("next"));

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await supabaseRoute();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }
  return NextResponse.redirect(`${origin}${next}`);
}
