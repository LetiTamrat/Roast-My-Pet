import { ImageResponse } from "next/og";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Roast My Pet";

export default async function OgImage({ params }: { params: { shortId: string } }) {
  const sb = supabaseService();
  const { data: roast } = await sb
    .from("roasts")
    .select("id, pet_name, roast_text, archetype, archetype_emoji")
    .eq("short_id", params.shortId)
    .maybeSingle();

  if (roast) {
    const { data: asset } = await sb
      .from("meme_assets")
      .select("url")
      .eq("roast_id", roast.id)
      .eq("format", "landscape")
      .maybeSingle();
    if (asset?.url) {
      try {
        const res = await fetch(asset.url);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          return new Response(buf, {
            headers: {
              "content-type": "image/png",
              "cache-control": "public, max-age=31536000, immutable",
            },
          });
        }
      } catch {
        // fall through to generated image
      }
    }
  }

  const roastText = roast?.roast_text || "A fresh roast is cooking.";
  const petName = roast?.pet_name || "Your pet";
  const emoji = roast?.archetype_emoji || "🔥";
  const archetype = roast?.archetype || "Roast My Pet";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg,#FFFBF5,#FFD2C2)",
          padding: "60px 70px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 28 }}>
          <span style={{ fontSize: 38 }}>🔥</span>
          <span style={{ fontWeight: 700 }}>Roast My Pet</span>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.1,
            color: "#0F0E13",
            display: "flex",
          }}
        >
          {roastText.length > 160 ? roastText.slice(0, 157) + "…" : roastText}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#0F0E13",
              color: "#FFFBF5",
              padding: "10px 20px",
              borderRadius: 999,
            }}
          >
            <span style={{ fontSize: 28 }}>{emoji}</span>
            <span style={{ fontWeight: 700 }}>{archetype}</span>
          </div>
          <div style={{ color: "#6B6B6B" }}>— {petName} · roastmypet.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
