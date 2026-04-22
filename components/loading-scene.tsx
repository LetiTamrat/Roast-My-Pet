"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COPY = [
  "Consulting the comedy council...",
  "Reviewing your pet's life choices...",
  "Polishing the punchline...",
  "Asking three other pets for opinions...",
  "Deciding which fur to make fun of...",
  "Calibrating the chaos...",
];

export function LoadingScene() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % COPY.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md motion-reduce:backdrop-blur-0"
      role="status"
      aria-live="polite"
      aria-label="Roasting your pet"
    >
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <div className="relative h-36 w-36">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full text-foreground/80"
            aria-hidden
          >
            <path
              d="M62 90c-10 0-18-10-18-22s8-22 18-22 18 10 18 22-8 22-18 22zm76 0c-10 0-18-10-18-22s8-22 18-22 18 10 18 22-8 22-18 22zm-58 46c-22 0-38-18-38-40 0-18 14-32 32-32s30 14 30 32c0 22-2 40-24 40zm68-40c0 22-16 40-38 40h-8c-22 0-24-18-24-40 0-18 12-32 30-32s40 14 40 32z"
              fill="currentColor"
              opacity="0.18"
            />
            <motion.circle
              cx="100" cy="100" r="70"
              stroke="#FF5A1F"
              strokeWidth="4"
              strokeDasharray="6 10"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              style={{ transformOrigin: "100px 100px" }}
              opacity={0.5}
            />
          </svg>
          <motion.div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_16px_4px_rgba(255,90,31,0.6)]"
            animate={{ top: ["15%", "85%", "15%"] }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: "easeInOut",
            }}
            aria-hidden
          />
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display text-2xl font-bold text-foreground"
            >
              {COPY[idx]}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-muted-foreground">
            This usually takes 4–8 seconds. Hang tight.
          </p>
        </div>

        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
