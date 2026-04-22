"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { toast } from "sonner";
import { REACTION_EMOJIS, type ReactionEmoji } from "@/lib/reactions";

export { REACTION_EMOJIS };
export type { ReactionEmoji };

interface Props {
  shortId: string;
  initialCounts: Record<string, number>;
}

export function ReactionBar({ shortId, initialCounts }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const toggle = (emoji: ReactionEmoji) => {
    const wasActive = !!active[emoji];
    setActive((a) => ({ ...a, [emoji]: !wasActive }));
    setCounts((c) => ({
      ...c,
      [emoji]: Math.max(0, (c[emoji] ?? 0) + (wasActive ? -1 : 1)),
    }));
    track("reaction_added", { shortId, emoji });

    startTransition(async () => {
      try {
        const res = await fetch(`/api/roast/${shortId}/react`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ emoji }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.counts) setCounts(data.counts);
        } else if (res.status !== 409) {
          toast.error("Couldn't save reaction.");
        }
      } catch {
        // swallow
      }
    });
  };

  return (
    <div className="flex items-center justify-center gap-2 rounded-full bg-muted p-2">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => toggle(emoji)}
          aria-pressed={!!active[emoji]}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
            active[emoji]
              ? "bg-card shadow-soft scale-105"
              : "text-foreground hover:bg-card/70"
          )}
        >
          <span className="text-base leading-none" aria-hidden>
            {emoji}
          </span>
          <span className="tabular-nums text-xs text-muted-foreground">
            {counts[emoji] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
