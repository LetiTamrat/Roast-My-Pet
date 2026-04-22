import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { loadFonts } from "./fonts";
import { getLogoDataUrl } from "./logo";
import { ClassicTemplate } from "./templates/classic";
import { PolaroidTemplate } from "./templates/polaroid";
import { TabloidTemplate } from "./templates/tabloid";
import type { MemeFormat, MemeTemplate, RoastLevel } from "../supabase/types";

export interface MemeTemplateProps {
  width: number;
  height: number;
  petImageDataUrl: string;
  logoDataUrl: string;
  roast: string;
  petName: string;
  archetype: string;
  archetypeEmoji: string;
  level: RoastLevel;
}

export const FORMAT_DIMENSIONS: Record<MemeFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
};

const TEMPLATES = {
  classic: ClassicTemplate,
  polaroid: PolaroidTemplate,
  tabloid: TabloidTemplate,
} as const;

export async function downloadAndResize(
  input: string | Buffer,
  maxWidth: number,
  maxHeight: number
): Promise<{ buffer: Buffer; mimeType: string }> {
  let raw: Buffer;
  if (typeof input === "string") {
    const res = await fetch(input);
    if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
    raw = Buffer.from(await res.arrayBuffer());
  } else {
    raw = input;
  }
  const resized = await sharp(raw)
    .rotate()
    .resize(maxWidth, maxHeight, { fit: "cover", position: "attention" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  return { buffer: resized, mimeType: "image/jpeg" };
}

export interface RenderArgs {
  template: MemeTemplate;
  format: MemeFormat;
  petImageUrl?: string;
  petImageBytes?: Buffer;
  roast: string;
  petName: string;
  archetype: string;
  archetypeEmoji: string;
  level: RoastLevel;
}

export async function renderMeme(args: RenderArgs): Promise<Buffer> {
  const { width, height } = FORMAT_DIMENSIONS[args.format];
  const TemplateComponent = TEMPLATES[args.template];

  const source: string | Buffer | undefined = args.petImageBytes ?? args.petImageUrl;
  if (!source) throw new Error("renderMeme needs petImageUrl or petImageBytes");

  const { buffer: petBuffer } = await downloadAndResize(
    source,
    Math.min(width, 1200),
    Math.min(height, 1200)
  );
  const petImageDataUrl = `data:image/jpeg;base64,${petBuffer.toString("base64")}`;
  const logoDataUrl = await getLogoDataUrl();

  const fonts = await loadFonts();

  const svg = await satori(
    TemplateComponent({
      width,
      height,
      petImageDataUrl,
      logoDataUrl,
      roast: args.roast,
      petName: args.petName,
      archetype: args.archetype,
      archetypeEmoji: args.archetypeEmoji,
      level: args.level,
    }) as React.ReactElement,
    {
      width,
      height,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: f.style,
      })),
    }
  );

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background: "#FFFBF5",
  })
    .render()
    .asPng();

  return sharp(png).png({ quality: 85, compressionLevel: 9 }).toBuffer();
}
