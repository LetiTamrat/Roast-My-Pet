// Satori can't rasterize color emojis from a regular TTF — the bundled fonts
// only cover Latin glyphs. This helper fetches Twemoji SVGs per-emoji and feeds
// them to satori via `loadAdditionalAsset`. Results are cached in-memory so
// repeat renders pay the network cost once per emoji.

const cache = new Map<string, string>();

// Convert an emoji segment (possibly a surrogate pair / ZWJ sequence) to the
// dash-joined hex code-point format Twemoji uses on disk: "1f525", "1f468-200d-1f33e".
function toCodePoint(segment: string): string {
  const out: string[] = [];
  let high = 0;
  for (let i = 0; i < segment.length; i++) {
    const c = segment.charCodeAt(i);
    if (high) {
      out.push((0x10000 + ((high - 0xd800) << 10) + (c - 0xdc00)).toString(16));
      high = 0;
    } else if (c >= 0xd800 && c <= 0xdbff) {
      high = c;
    } else if (c !== 0xfe0f) {
      // Strip the "variation selector" that marks emoji-presentation.
      out.push(c.toString(16));
    }
  }
  return out.join("-");
}

export async function loadEmoji(segment: string): Promise<string | null> {
  const cp = toCodePoint(segment);
  if (!cp) return null;
  const cached = cache.get(cp);
  if (cached) return cached;

  const sources = [
    `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${cp}.svg`,
    `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${cp}.svg`,
  ];
  for (const url of sources) {
    try {
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) continue;
      const svg = await res.text();
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
      cache.set(cp, dataUrl);
      return dataUrl;
    } catch {
      // try next mirror
    }
  }
  cache.set(cp, ""); // don't retry failed lookups every render
  return null;
}
