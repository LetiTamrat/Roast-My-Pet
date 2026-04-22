"use client";

import { cn } from "@/lib/utils";

interface Props {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function TraitChip({ label, selected, onToggle, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      disabled={disabled && !selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 active:scale-95",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "border-border bg-card text-foreground hover:border-primary/50",
        disabled && !selected && "opacity-40 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}
