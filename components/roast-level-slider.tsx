"use client";

import { ROAST_LEVELS, type RoastLevel } from "@/lib/traits";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  value: RoastLevel;
  onChange: (value: RoastLevel) => void;
}

export function RoastLevelSlider({ value, onChange }: Props) {
  const current = ROAST_LEVELS.find((l) => l.value === value) ?? ROAST_LEVELS[1];
  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1"
        role="radiogroup"
        aria-label="Roast level"
      >
        {ROAST_LEVELS.map((l) => {
          const selected = l.value === value;
          return (
            <button
              key={l.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(l.value)}
              className={cn(
                "relative rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
                selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {selected && (
                <motion.div
                  layoutId="roast-level-pill"
                  className="absolute inset-0 rounded-full bg-primary shadow-soft"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative flex items-center justify-center gap-1.5">
                <span aria-hidden>{l.emoji}</span>
                <span>{l.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground px-1">{current.desc}</p>
    </div>
  );
}
