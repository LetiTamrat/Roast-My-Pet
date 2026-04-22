import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MemeCard } from "@/components/meme-card";
import { ArchetypeBadge } from "@/components/archetype-badge";
import { ShareSheet } from "@/components/share-sheet";
import { ReactionBar } from "@/components/reaction-bar";
import { REACTION_EMOJIS } from "@/lib/reactions";
import { Button } from "@/components/ui/button";
import { supabaseService } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";
import { ResultClient } from "./result-client";
import { MoreLikeThis } from "./more-like-this";
import { ReportLink } from "./report-link";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ shortId: string }>;
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

  const memes: Record<string, string> = {};
  for (const a of assets || []) memes[a.format] = a.url;

  const counts: Record<string, number> = {};
  for (const emoji of REACTION_EMOJIS) counts[emoji] = 0;
  for (const r of reactions || []) counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;

  return { roast, memes, counts };
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
  const { roast, memes, counts } = data;

  const session = await getSession().catch(() => null);
  const ownedByCurrentUser = !!session && roast.user_id === session.userId;

  const shareUrl = absoluteUrl(`/r/${shortId}`);

  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-36 pt-8 sm:px-6 md:pb-16">
        <div className="mx-auto w-full max-w-[640px]">
          <Link
            href="/gallery"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            ← Back to gallery
          </Link>

          <div className="mt-6">
            {memes.square ? (
              <MemeCard src={memes.square} alt={roast.roast_text} priority />
            ) : (
              <div className="aspect-square w-full rounded-2xl bg-muted" />
            )}
          </div>

          <div className="mt-8 space-y-4 text-center">
            <ArchetypeBadge
              archetype={roast.archetype}
              emoji={roast.archetype_emoji}
            />
            <h1 className="font-display text-2xl font-bold leading-snug sm:text-3xl md:text-4xl">
              {roast.roast_text}
            </h1>
            {roast.follow_up && (
              <p className="text-base text-muted-foreground italic">
                &ldquo;{roast.follow_up}&rdquo;
              </p>
            )}
          </div>

          <div className="mt-8">
            <ReactionBar shortId={shortId} initialCounts={counts} />
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-bold">Share this roast</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Drop it in the group chat. They'll forgive you eventually.
            </p>
            <ShareSheet
              shortId={shortId}
              shareUrl={shareUrl}
              squareUrl={memes.square || ""}
              storyUrl={memes.story || memes.square || ""}
              roastText={roast.roast_text}
            />
          </div>

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

          <div className="mt-10 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/upload">Roast another pet →</Link>
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
          }),
        }}
      />
    </>
  );
}

