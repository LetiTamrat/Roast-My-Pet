import { promises as fs } from "node:fs";
import path from "node:path";

let cachedDataUrl: string | null = null;

/**
 * Load the brand logo once, return a data URL that satori can embed directly.
 * Cached in module scope for the life of the server process.
 */
export async function getLogoDataUrl(): Promise<string> {
  if (cachedDataUrl) return cachedDataUrl;
  const candidates = [
    path.join(process.cwd(), "public", "logo-sm.png"),
    path.join(process.cwd(), "public", "logo.png"),
  ];
  for (const filePath of candidates) {
    try {
      const buf = await fs.readFile(filePath);
      cachedDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
      return cachedDataUrl;
    } catch {
      // try next
    }
  }
  throw new Error("Brand logo not found in public/");
}
