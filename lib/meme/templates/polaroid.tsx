import * as React from "react";
import type { MemeTemplateProps } from "../render";

export function PolaroidTemplate(props: MemeTemplateProps) {
  const { width, height, petImageDataUrl, roast, archetypeEmoji, petName } = props;
  const padding = Math.round(width * 0.06);
  const photoSize = width - padding * 2;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F5EFE6",
        fontFamily: "Caveat",
      }}
    >
      <div
        style={{
          width: width - padding,
          height: height - padding,
          background: "#FFFBF5",
          borderRadius: 24,
          padding,
          display: "flex",
          flexDirection: "column",
          gap: padding * 0.6,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <img
          src={petImageDataUrl}
          width={photoSize}
          height={photoSize * 0.9}
          style={{
            width: "100%",
            height: photoSize * 0.9,
            objectFit: "cover",
            borderRadius: 12,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "0 8px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: Math.round(width * 0.045),
              color: "#0F0E13",
              lineHeight: 1.2,
            }}
          >
            {archetypeEmoji} {roast}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Inter",
              fontSize: Math.round(width * 0.018),
              color: "#6B6B6B",
              marginTop: 8,
            }}
          >
            <span>— {petName}, {new Date().toLocaleDateString()}</span>
            <span>roastmypet.com 🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
}
