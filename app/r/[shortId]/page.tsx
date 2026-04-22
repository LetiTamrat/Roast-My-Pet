import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MemeCard } from "@/components/meme-card";
import { ArchetypeBadge } from "@/components/archetype-badge";
import { ShareSheet } from "@/components/share-sheet";
import { ReactionBar } from "@/components/reaction-bar";
import { REACTION_EMOJIS } from "@/lib/reactions";
import { Button } from "@/components/ui/button";
import { supabaseService } from "@/lib/supabase/server";
import { absoluteUrl, formatRelativeTime } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";
import { ResultClient } from "./result-client";
import { MoreLikeThis } from "./more-like-this";
import { ReportLink } from "./report-link";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ shortId: string }>;
}

interface CreatorInfo {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

async function fetchRoast(shortId: string) {
  const sb = supabaseService();
  const { data: roast } = await sb
    .from("roasts")
    .select("*")
    .eq("short_id", shortId)
    .maybeSingle();
  if (!roast) return null;
  const { data: assets } = await sb
    .from("meme_assets")
    .select("*")
    .eq("roast_id", roast.id);
  const { data: reactions } = await sb
    .from("reactions")
    .select("emoji")
    .eq("roast_id", roast.id);

  let creator: CreatorInfo | null = null;
  if (roast.user_id) {
    const { data: profile } = await sb
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", roast.user_id)
      .maybeSingle();
    if (profile) creator = profile as CreatorInfo;
  }

  const memes: Record<string, string> = {};
  for (const a of assets || []) memes[a.format] = a.url;

  const counts: Record<string, number> = {};
  for (const emoji of REACTION_EMOJIS) counts[emoji] = 0;
  for (const r of reactions || []) counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;

  return { roast, memes, counts, creator };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shortId } = await params;
  const data = await fetchRoast(shortId);
  if (!data) return { title: "Roast not found" };
  const { roast, memes } = data;
  const title = `${roast.pet_name} just got roasted`;
  const description = roast.roast_text;
  const ogImage = memes.landscape || memes.square;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl(`/r/${shortId}`),
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: description }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function RoastPage({ params }: PageProps) {
  const { shortId } = await params;
  const data = await fetchRoast(shortId);
  if (!data) notFound();
  const { roast, memes, counts, creator } = data;

  const session = await getSession().catch(() => null);
  const ownedByCurrentUser = !!session && roast.user_id === session.userId;

  const shareUrl = absoluteUrl(`/r/${shortId}`);
  const createdAgo = formatRelativeTime(roast.created_at);

  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-6 sm:px-6">
        <div className="mx-auto w-full max-w-[680px]">
          <div className="flex items-center justify-between">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to gallery
            </Link>
            <span className="text-xs text-muted-foreground">{createdAgo}</span>
          </div>

          {/* MEME + headline combined into a single showcase card */}
          <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            {memes.square ? (
              <MemeCard src={memes.square} alt={roast.roast_text} priority />
            ) : (
              <div className="aspect-square w-full bg-muted" />
            )}

            <div className="space-y-5 px-6 py-7 text-center">
              <div className="flex items-center justify-center">
                <ArchetypeBadge
                  archetype={roast.archetype}
                  emoji={roast.archetype_emoji}
                />
              </div>
              <h1 className="font-display text-2xl font-bold leading-snug sm:text-3xl md:text-4xl">
                {roast.roast_text}
              </h1>
              {roast.follow_up && (
                <p className="text-sm italic text-muted-foreground sm:text-base">
                  &ldquo;{roast.follow_up}&rdquo;
                </p>
              )}
              {creator && (
                <Link
                  href={`/${creator.username}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/50 hover:bg-muted"
                >
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted">
                    {creator.avatar_url ? (
                      <Image
                        src={creator.avatar_url}
                        alt={creator.username}
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px]">
                        🐾
                      </span>
                    )}
                  </div>
                  <span>
                    Roasted by{" "}
                    <span className="font-bold text-primary">
                      @{creator.username}
                    </span>
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* REACTIONS */}
          <div className="mt-6">
            <ReactionBar shortId={shortId} initialCounts={counts} />
          </div>

          {/* SHARE */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold">Spread the chaos</h2>
              <p className="text-xs text-muted-foreground">
                One tap to the group chat. They'll forgive you eventually.
              </p>
            </div>
            <ShareSheet
              shortId={shortId}
              shareUrl={shareUrl}
              squareUrl={memes.square || ""}
              storyUrl={memes.story || memes.square || ""}
              roastText={roast.roast_text}
            />
          </section>

          {/* OWNER ACTIONS (toggle, regenerate, delete) */}
          <ResultClient
            shortId={shortId}
            initialIsPublic={roast.is_public}
            petName={roast.pet_name}
            petType={roast.pet_type}
            traits={roast.traits || []}
            level={roast.roast_level}
            style={roast.roast_style}
            ownedByCurrentUser={ownedByCurrentUser}
          />

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-2">
            <Button asChild size="lg">
              <Link href="/upload">Roast another pet 🔥</Link>
            </Button>
          </div>

          <MoreLikeThis archetype={roast.archetype} excludeShortId={shortId} />

          <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <ReportLink shortId={shortId} />
          </div>
        </div>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            headline: `${roast.pet_name} got roasted`,
            description: roast.roast_text,
            image: memes.square,
            url: shareUrl,
            ...(creator
              ? {
                  author: {
                    "@type": "Person",
                    name: creator.display_name || `@${creator.username}`,
                    url: absoluteUrl(`/${creator.username}`),
                  },
                }
              : {}),
          }),
        }}
      />
    </>
  );
}
