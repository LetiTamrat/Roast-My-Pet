#!/usr/bin/env node
// One-shot script: resize RMP LOGO.png into every icon variant Next.js uses.
// Run: node scripts/build-icons.mjs

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "RMP LOGO.png");
const app = path.join(root, "app");
const pub = path.join(root, "public");

async function main() {
  const buf = await fs.readFile(src);

  // Trim transparent borders once so downstream crops are tight.
  const trimmed = await sharp(buf).trim({ threshold: 10 }).toBuffer();

  // Small logo for favicon fallback (multi-size ICO not supported natively by
  // sharp, but modern browsers happily accept 48px PNG renamed .ico).
  await sharp(trimmed)
    .resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(pub, "favicon.ico"));

  // Next.js file-based icons (app/icon.png, app/apple-icon.png)
  await sharp(trimmed)
    .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(app, "icon.png"));

  await sharp(trimmed)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 251, b: 245, alpha: 1 } })
    .png()
    .toFile(path.join(app, "apple-icon.png"));

  // Small header logo (retina-ready 128px)
  await sharp(trimmed)
    .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(pub, "logo-sm.png"));

  // OG banner: 1200×630, logo on warm gradient with tagline.
  const logoSide = 360;
  const logoResized = await sharp(trimmed)
    .resize(logoSide, logoSide, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const ogSvg = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFFBF5"/>
          <stop offset="0.6" stop-color="#FFD2C2"/>
          <stop offset="1" stop-color="#FFD23F"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#g)"/>
      <text x="520" y="300" font-family="Helvetica,Arial,sans-serif" font-weight="800" font-size="96" fill="#0F0E13" letter-spacing="-3">Roast My Pet</text>
      <text x="520" y="360" font-family="Helvetica,Arial,sans-serif" font-size="30" fill="#0F0E13" opacity="0.75">Upload a photo. Get a roast worth sharing.</text>
      <text x="520" y="430" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="28" fill="#FF5A1F">roastmypet.com</text>
    </svg>
  `);

  await sharp(ogSvg)
    .composite([{ input: logoResized, top: Math.floor((630 - logoSide) / 2), left: 90 }])
    .png({ quality: 90 })
    .toFile(path.join(pub, "og-default.png"));

  console.log("Icons generated:");
  for (const f of ["public/favicon.ico", "app/icon.png", "app/apple-icon.png", "public/logo-sm.png", "public/og-default.png"]) {
    const stat = await fs.stat(path.join(root, f));
    console.log(`  ${f} — ${Math.round(stat.size / 1024)}KB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
