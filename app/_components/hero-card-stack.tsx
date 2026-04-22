"use client";

import { motion } from "framer-motion";

const CARDS = [
  {
    emoji: "🛋️",
    archetype: "Couch Goblin",
    name: "Biscuit",
    roast:
      "Biscuit has spent so long horizontal that gravity is considering sending him a thank-you card.",
    tint: "bg-[radial-gradient(circle_at_top_left,#FFD2C2,#FFFBF5)]",
  },
  {
    emoji: "👑",
    archetype: "Household Dictator",
    name: "Princess",
    roast:
      "Princess doesn't ask for dinner — she sighs, stares at her empty bowl, and waits for you to apologize.",
    tint: "bg-[radial-gradient(circle_at_top_right,#FFE38A,#FFFBF5)]",
  },
  {
    emoji: "🤡",
    archetype: "Chaos Gremlin",
    name: "Nugget",
    roast:
      "Nugget saw a leaf move and is now personally responsible for at least one HOA complaint.",
    tint: "bg-[radial-gradient(circle_at_bottom_left,#FFB4A2,#FFFBF5)]",
  },
];

export function HeroCardStack() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-sm md:max-w-md">
      {CARDS.map((c, i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0, rotate: 0 }}
          animate={{
            y: [0, -6, 0],
            opacity: 1,
            rotate: [-4 + i * 4, -3 + i * 4, -4 + i * 4],
          }}
          transition={{
            y: { repeat: Infinity, duration: 6 + i, ease: "easeInOut" },
            rotate: { repeat: Infinity, duration: 8 + i, ease: "easeInOut" },
            opacity: { duration: 0.6, delay: i * 0.1 },
          }}
          style={{
            zIndex: i + 1,
            top: `${i * 20}px`,
            left: `${i * 18}px`,
          }}
          className={`absolute w-72 sm:w-80 rounded-3xl border border-border ${c.tint} p-6 shadow-card paper-grain`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1 text-background">
              <span>{c.emoji}</span>
              <span>{c.archetype}</span>
            </span>
          </div>
          <p className="mt-4 font-display text-xl font-bold leading-snug text-foreground">
            {c.roast}
          </p>
          <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>— {c.name}</span>
            <span className="font-bold text-primary">roastmypet.com</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
