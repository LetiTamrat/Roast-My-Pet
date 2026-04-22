"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  src: string;
  alt: string;
  priority?: boolean;
}

export function MemeCard({ src, alt, priority }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Dialog>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="group relative mx-auto w-full max-w-[540px]"
      >
        <DialogTrigger asChild>
          <button
            className="relative block w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-card transition-shadow hover:shadow-glow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            aria-label="Expand meme"
          >
            <div className="aspect-square w-full">
              <Image
                src={src}
                alt={alt}
                width={1080}
                height={1080}
                priority={priority}
                sizes="(max-width: 640px) 100vw, 540px"
                className="h-full w-full object-cover"
                onLoad={() => setLoaded(true)}
              />
            </div>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </button>
        </DialogTrigger>
      </motion.div>
      <DialogContent className="max-w-3xl p-2">
        <DialogTitle className="sr-only">Meme</DialogTitle>
        <Image
          src={src}
          alt={alt}
          width={1080}
          height={1080}
          className="w-full rounded-xl"
        />
      </DialogContent>
    </Dialog>
  );
}
