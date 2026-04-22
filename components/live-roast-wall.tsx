"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface GalleryItem {
  short_id: string;
  pet_name: string;
  archetype: string;
  archetype_emoji: string;
  thumb_url: string;
}

export function LiveRoastWall() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gallery?limit=12")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items.length) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground">
        The gallery is warming up. Be the first to drop a legendary roast.
      </div>
    );
  }

  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-label="Recent public roasts"
    >
      <div className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <Link
            key={`${item.short_id}-${i}`}
            href={`/r/${item.short_id}`}
            className="group block h-52 w-52 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform hover:scale-[1.03]"
          >
            <div className="relative h-40 w-full">
              <Image
                src={item.thumb_url}
                alt={`${item.pet_name} meme`}
                fill
                sizes="208px"
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold">
              <span aria-hidden>{item.archetype_emoji}</span>
              <span className="truncate">{item.pet_name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
