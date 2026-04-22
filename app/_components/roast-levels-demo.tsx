"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const LEVELS = [
  {
    value: "cute",
    label: "Cute 🍼",
    text:
      "Pepper's biggest crime is blinking too slowly at the treat drawer. Court-ordered sentence: three kisses and a belly rub.",
    tint: "from-pink-100 to-white",
  },
  {
    value: "medium",
    label: "Medium 🌶️",
    text:
      "Pepper operates like a pyramid scheme for snacks — you keep paying in, the returns never arrive, but somehow everyone's still recruited.",
    tint: "from-orange-100 to-white",
  },
  {
    value: "savage",
    label: "Savage 🔥",
    text:
      "Pepper has the work ethic of a trust-fund houseplant and the job title to match. If you left tomorrow she'd outsource the grief to a throw pillow.",
    tint: "from-red-100 to-white",
  },
] as const;

export function RoastLevelsDemo() {
  const [value, setValue] = useState<(typeof LEVELS)[number]["value"]>("medium");
  const current = LEVELS.find((l) => l.value === value)!;

  return (
    <Tabs value={value} onValueChange={(v) => setValue(v as typeof value)}>
      <TabsList className="w-full max-w-md">
        {LEVELS.map((l) => (
          <TabsTrigger key={l.value} value={l.value} className="flex-1">
            {l.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={value}>
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className={`grid gap-6 rounded-3xl border border-border bg-gradient-to-br ${current.tint} p-6 md:grid-cols-[300px_1fr] md:items-center shadow-card`}
          >
            <div className="aspect-square w-full rounded-2xl bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><rect width=%22200%22 height=%22200%22 fill=%22%23FFD2C2%22/><text x=%22100%22 y=%22130%22 text-anchor=%22middle%22 font-size=%2290%22>🐶</text></svg>')] bg-cover shadow-soft" />
            <p className="font-display text-2xl font-bold leading-snug md:text-3xl">
              {current.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </TabsContent>
    </Tabs>
  );
}
