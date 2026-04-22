import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { RoastGrid } from "@/components/dashboard/roast-grid";
import { supabaseService } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "My roasts",
  description: "Manage your roasts — toggle public/private, delete, or regenerate.",
};

export const dynamic = "force-dynamic";

export default async function MyRoastsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/my-roasts");

  const sb = supabaseService();
  const { data: roasts } = await sb
    .from("roasts")
    .select("id, short_id, pet_name, archetype, archetype_emoji, roast_text, is_public, created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  const ids = (roasts || []).map((r) => r.id);
  const { data: memes } = ids.length
    ? await sb.from("meme_assets").select("roast_id, url, format").in("roast_id", ids).eq("format", "square")
    : { data: [] as Array<{ roast_id: string; url: string; format: string }> };

  const thumbByRoast = new Map<string, string>();
  for (const m of memes || []) thumbByRoast.set(m.roast_id, m.url);

  const items = (roasts || []).map((r) => ({
    id: r.id,
    short_id: r.short_id,
    pet_name: r.pet_name,
    archetype: r.archetype,
    archetype_emoji: r.archetype_emoji,
    roast_text: r.roast_text,
    is_public: r.is_public,
    thumb_url: thumbByRoast.get(r.id) || "",
    created_at: r.created_at,
  }));

  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Your roasts</h1>
              <p className="mt-2 text-muted-foreground">
                {items.length} roast{items.length === 1 ? "" : "s"} in your archive.
                {session.profile?.username && (
                  <>
                    {" "}
                    Your public page:{" "}
                    <Link
                      href={`/${session.profile.username}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      /{session.profile.username}
                    </Link>
                  </>
                )}
              </p>
            </div>
            <Button asChild>
              <Link href="/upload">New roast 🔥</Link>
            </Button>
          </div>

          <div className="mt-10">
            {items.length ? (
              <RoastGrid initialItems={items} />
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <div className="text-4xl">🐾</div>
                <h3 className="mt-4 font-display text-2xl font-bold">No roasts yet.</h3>
                <p className="mt-2 text-muted-foreground">
                  Upload a pet photo and we'll handle the rest.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/upload">Roast your pet →</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
