// Load fonts for satori. We fetch from Google Fonts static mirror on first call
// and cache in module scope. In production you can also drop TTF files into
// public/fonts/ and the loader will prefer local files.

import { promises as fs } from "node:fs";
import path from "node:path";

interface FontSpec {
  name: string;
  localFile?: string;
  cdnUrl: string;
  weight: 400 | 500 | 600 | 700;
  style: "normal" | "italic";
}

const FONT_SPECS: FontSpec[] = [
  {
    name: "Inter",
    localFile: "Inter-Regular.ttf",
    cdnUrl:
      "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.otf",
    weight: 400,
    style: "normal",
  },
  {
    name: "Inter",
    localFile: "Inter-Bold.ttf",
    cdnUrl:
      "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.otf",
    weight: 700,
    style: "normal",
  },
  {
    name: "Bricolage",
    localFile: "BricolageGrotesque-Regular.ttf",
    cdnUrl:
      "https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@latest/latin-400-normal.ttf",
    weight: 400,
    style: "normal",
  },
  {
    name: "Bricolage",
    localFile: "BricolageGrotesque-Bold.ttf",
    cdnUrl:
      "https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@latest/latin-700-normal.ttf",
    weight: 700,
    style: "normal",
  },
  {
    name: "Caveat",
    localFile: "Caveat-Regular.ttf",
    cdnUrl:
      "https://cdn.jsdelivr.net/fontsource/fonts/caveat@latest/latin-400-normal.ttf",
    weight: 400,
    style: "normal",
  },
];

interface LoadedFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal" | "italic";
}

let cache: LoadedFont[] | null = null;

async function loadOne(spec: FontSpec): Promise<ArrayBuffer | null> {
  if (spec.localFile) {
    const full = path.join(process.cwd(), "public", "fonts", spec.localFile);
    try {
      const buf = await fs.readFile(full);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    } catch {
      // fall back to CDN
    }
  }
  try {
    const res = await fetch(spec.cdnUrl, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function loadFonts(): Promise<LoadedFont[]> {
  if (cache && cache.length) return cache;
  const loaded: LoadedFont[] = [];
  await Promise.all(
    FONT_SPECS.map(async (spec) => {
      const data = await loadOne(spec);
      if (data) {
        loaded.push({ name: spec.name, data, weight: spec.weight, style: spec.style });
      }
    })
  );
  if (!loaded.length) {
    throw new Error("Failed to load any font for meme rendering.");
  }
  cache = loaded;
  return cache;
}
