import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabaseService } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

async function fetchProfile(username: string) {
  const sb = supabaseService();
  const { data: profile } = await sb
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, created_at")
    .ilike("username", username)
    .maybeSingle();
  if (!profile) return null;

  const { data: roasts } = await sb
    .from("roasts")
    .select("id, short_id, pet_name, archetype, archetype_emoji, roast_text, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .eq("is_flagged", false)
    .order("created_at", { ascending: false })
    .limit(60);

  const ids = (roasts || []).map((r: any) => r.id);
  const { data: memes } = ids.length
    ? await sb
        .from("meme_assets")
        .select("roast_id, url")
        .in("roast_id", ids)
        .eq("format", "square")
    : { data: [] as Array<{ roast_id: string; url: string }> };
  const thumb = new Map<string, string>();
  for (const m of memes || []) thumb.set(m.roast_id, m.url);

  const items = (roasts || [])
    .map((r: any) => ({
      short_id: r.short_id,
      pet_name: r.pet_name,
      archetype: r.archetype,
      archetype_emoji: r.archetype_emoji,
      thumb_url: thumb.get(r.id) || "",
    }))
    .filter((r) => r.thumb_url);

  return { profile, items };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await fetchProfile(username);
  if (!data) return { title: "Profile not found" };
  const name = data.profile.display_name || `@${data.profile.username}`;
  return {
    title: `${name} · Roast My Pet`,
    description: data.profile.bio || `Public roasts by @${data.profile.username}.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const data = await fetchProfile(username);
  if (!data) notFound();
  const { profile, items } = data;
  const name = profile.display_name || `@${profile.username}`;

  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-soft sm:flex-row sm:items-start sm:text-left">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={`${name}'s avatar`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">🐾</div>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{name}</h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-3 max-w-prose text-base text-foreground">{profile.bio}</p>
              )}
            </div>
          </section>

          <div className="mt-10">
            {items.length ? (
              <>
                <h2 className="font-display text-xl font-bold">
                  {items.length} public roast{items.length === 1 ? "" : "s"}
                </h2>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {items.map((item) => (
                    <li key={item.short_id}>
                      <Link
                        href={`/r/${item.short_id}`}
                        className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform hover:scale-[1.02]"
                      >
                        <div className="relative aspect-square w-full">
                          <Image
                            src={item.thumb_url}
                            alt={item.pet_name}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold">
                          <span aria-hidden>{item.archetype_emoji}</span>
                          <span className="truncate">{item.pet_name}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <div className="text-4xl">🤫</div>
                <h3 className="mt-4 font-display text-2xl font-bold">No public roasts yet.</h3>
                <p className="mt-2 text-muted-foreground">
                  {name} is keeping it private for now.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
