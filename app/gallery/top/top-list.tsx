"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Item {
  short_id: string;
  pet_name: string;
  archetype: string;
  archetype_emoji: string;
  thumb_url: string;
  reaction_count: number;
  roast_text: string;
}

interface Props {
  period: "today" | "week" | "all";
}

export function TopList({ period }: Props) {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/gallery/top?period=${period}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (items === null) {
    return (
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
        No roasts yet for this period. Be the legend.
      </div>
    );
  }

  return (
    <ol className="mt-4 space-y-3">
      {items.map((item, idx) => (
        <li key={item.short_id}>
          <Link
            href={`/r/${item.short_id}`}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft transition-all hover:shadow-card"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold">
              #{idx + 1}
            </div>
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={item.thumb_url}
                alt={item.pet_name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span aria-hidden>{item.archetype_emoji}</span>
                <span className="truncate">{item.archetype}</span>
              </div>
              <p className="mt-1 line-clamp-2 font-semibold">{item.roast_text}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                {item.pet_name} · 🔥 {item.reaction_count} reactions
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
