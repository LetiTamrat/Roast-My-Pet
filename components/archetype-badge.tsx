import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  archetype: string;
  emoji: string;
  className?: string;
  clickable?: boolean;
}

export function ArchetypeBadge({ archetype, emoji, className, clickable = true }: Props) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-accent/90 px-4 py-1.5 text-sm font-semibold text-foreground shadow-soft transition-transform hover:scale-105",
        className
      )}
    >
      <span aria-hidden className="text-base leading-none">{emoji}</span>
      {archetype}
    </span>
  );
  if (!clickable) return content;
  return (
    <Link
      href={`/gallery?archetype=${encodeURIComponent(archetype)}`}
      className="inline-flex"
    >
      {content}
    </Link>
  );
}
