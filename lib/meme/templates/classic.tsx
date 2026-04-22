import * as React from "react";
import type { MemeTemplateProps } from "../render";

const accentByLevel: Record<string, string> = {
  cute: "#FFB3C7",
  medium: "#FF5A1F",
  savage: "#FFD23F",
};

export function ClassicTemplate(props: MemeTemplateProps) {
  const {
    width,
    height,
    petImageDataUrl,
    logoDataUrl,
    roast,
    archetype,
    archetypeEmoji,
    level,
  } = props;
  const accent = accentByLevel[level] ?? "#FF5A1F";
  const fontSize = computeFontSize(roast, width);
  const logoSize = Math.round(Math.min(width, height) * 0.18);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        display: "flex",
        fontFamily: "Bricolage",
        backgroundColor: "#0F0E13",
      }}
    >
      <img
        src={petImageDataUrl}
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
          objectFit: "cover",
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15,14,19,0) 30%, rgba(15,14,19,0.55) 60%, rgba(15,14,19,0.92) 100%)",
        }}
      />

      {/* Brand logo — top-right corner, the only watermark */}
      <img
        src={logoDataUrl}
        width={logoSize}
        height={logoSize}
        style={{
          position: "absolute",
          top: Math.round(width * 0.035),
          right: Math.round(width * 0.035),
          width: logoSize,
          height: logoSize,
          filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "48px 56px 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 80,
              height: 8,
              borderRadius: 4,
              background: accent,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(255,251,245,0.14)",
              border: "1px solid rgba(255,251,245,0.25)",
              color: "#FFFBF5",
              fontSize: 24,
              fontWeight: 700,
              backdropFilter: "blur(6px)",
            }}
          >
            <span style={{ fontSize: 28 }}>{archetypeEmoji}</span>
            <span>{archetype}</span>
          </div>
        </div>
        <div
          style={{
            color: "#FFFBF5",
            fontSize,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 24px rgba(0,0,0,0.6)",
            display: "flex",
          }}
        >
          {roast}
        </div>
      </div>
    </div>
  );
}

function computeFontSize(text: string, width: number): number {
  const ratio = width / 1080;
  const len = text.length;
  if (len < 80) return Math.round(64 * ratio);
  if (len < 140) return Math.round(52 * ratio);
  if (len < 200) return Math.round(44 * ratio);
  if (len < 260) return Math.round(36 * ratio);
  return Math.round(30 * ratio);
}
