"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

interface Item {
  short_id: string;
  pet_name: string;
  archetype: string;
  archetype_emoji: string;
  thumb_url: string;
  reaction_count: number;
}

interface Props {
  archetype?: string;
  level?: string;
}

export function GalleryGrid({ archetype, level }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const fetchNext = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (archetype) params.set("archetype", archetype);
      if (level) params.set("level", level);
      params.set("limit", "18");
      const res = await fetch(`/api/gallery?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setItems((prev) => [...prev, ...(data.items || [])]);
      if (!data.nextCursor) setDone(true);
      else setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [archetype, level, cursor, loading, done]);

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setDone(false);
  }, [archetype, level]);

  useEffect(() => {
    track("gallery_viewed", { archetype, level });
  }, [archetype, level]);

  useEffect(() => {
    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archetype, level]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNext();
      },
      { rootMargin: "400px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [fetchNext]);

  if (!items.length && !loading && done) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <div className="text-4xl">🦴</div>
        <h3 className="mt-4 font-display text-2xl font-bold">No roasts here yet.</h3>
        <p className="mt-2 text-muted-foreground">
          Be the first to add a roast for this filter.
        </p>
        <Button asChild className="mt-6">
          <Link href="/upload">Roast your pet →</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 md:columns-3 [&>*]:mb-4">
        {items.map((item) => (
          <Link
            key={item.short_id}
            href={`/r/${item.short_id}`}
            className="group block break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform hover:scale-[1.015]"
          >
            <div className="relative aspect-square w-full">
              <Image
                src={item.thumb_url}
                alt={item.pet_name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold">
              <span className="truncate">
                {item.archetype_emoji} {item.pet_name}
              </span>
              <span className="tabular-nums text-muted-foreground">
                🔥 {item.reaction_count}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div ref={sentinel} className="h-12" />
      {loading && (
        <div className="mt-4 text-center text-sm text-muted-foreground">Loading…</div>
      )}
      {error && (
        <div className="mt-4 text-center">
          <Button size="sm" variant="outline" onClick={fetchNext}>
            Try again
          </Button>
        </div>
      )}
    </>
  );
}
