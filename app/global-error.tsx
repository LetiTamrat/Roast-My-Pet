"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#FFFBF5",
          color: "#0F0E13",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 56 }}>🔥</div>
          <h1 style={{ fontSize: 32, margin: "16px 0 8px", fontWeight: 800 }}>
            Something went sideways.
          </h1>
          <p style={{ color: "#6B6B6B", marginBottom: 8 }}>
            The roast machine hit an error. Try again, or head home.
          </p>
          {error?.digest && (
            <p style={{ fontSize: 12, color: "#6B6B6B", fontFamily: "monospace" }}>
              ref {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#FF5A1F",
                color: "white",
                border: 0,
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: "white",
                color: "#0F0E13",
                padding: "12px 24px",
                borderRadius: 999,
                border: "1px solid #E8E2D6",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
