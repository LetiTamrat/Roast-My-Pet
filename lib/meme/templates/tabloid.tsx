import * as React from "react";
import type { MemeTemplateProps } from "../render";

export function TabloidTemplate(props: MemeTemplateProps) {
  const { width, height, petImageDataUrl, roast, archetype } = props;
  const headerH = Math.round(height * 0.12);
  const footerH = Math.round(height * 0.06);
  const bodyH = height - headerH - footerH;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        background: "#FFFBF5",
        fontFamily: "Bricolage",
      }}
    >
      <div
        style={{
          height: headerH,
          background: "#FFD23F",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          borderBottom: "6px solid #0F0E13",
        }}
      >
        <div style={{ fontSize: Math.round(headerH * 0.55), fontWeight: 700 }}>
          EXCLUSIVE 🚨
        </div>
        <div style={{ fontSize: Math.round(headerH * 0.35), fontFamily: "Inter" }}>
          ROAST MY PET • DAILY EDITION
        </div>
      </div>

      <div style={{ display: "flex", height: bodyH }}>
        <img
          src={petImageDataUrl}
          width={Math.round(width * 0.5)}
          height={bodyH}
          style={{
            width: Math.round(width * 0.5),
            height: bodyH,
            objectFit: "cover",
          }}
        />
        <div
          style={{
            width: Math.round(width * 0.5),
            height: bodyH,
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: Math.round(width * 0.02),
              color: "#FF5A1F",
              fontWeight: 700,
              letterSpacing: "0.15em",
              fontFamily: "Inter",
            }}
          >
            ARCHETYPE: {archetype.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: computeHeadline(roast, width),
              lineHeight: 1.05,
              fontWeight: 700,
              color: "#0F0E13",
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            {roast}
          </div>
        </div>
      </div>

      <div
        style={{
          height: footerH,
          background: "#0F0E13",
          color: "#FFFBF5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: Math.round(footerH * 0.45),
          letterSpacing: "0.2em",
        }}
      >
        🔥 ROASTMYPET.COM • NEW ROASTS DAILY 🔥
      </div>
    </div>
  );
}

function computeHeadline(text: string, width: number): number {
  const ratio = width / 1080;
  const len = text.length;
  if (len < 80) return Math.round(56 * ratio);
  if (len < 160) return Math.round(44 * ratio);
  if (len < 240) return Math.round(36 * ratio);
  return Math.round(30 * ratio);
}
