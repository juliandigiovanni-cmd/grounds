import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Know your Grounds";
  const subtitle = searchParams.get("subtitle") ?? "The specialty coffee map for travelers.";
  const score = searchParams.get("score");
  const city = searchParams.get("city") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1A0A00",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Background pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "radial-gradient(circle at 20% 50%, #C8972A 0%, transparent 60%), radial-gradient(circle at 80% 50%, #3D1F00 0%, transparent 60%)" }} />

        {/* Brand mark */}
        <div style={{ fontSize: 18, color: "#C8972A", marginBottom: 16, letterSpacing: 4, textTransform: "uppercase", display: "flex" }}>
          ☕ KNOW YOUR GROUNDS
        </div>

        {/* Title */}
        <div style={{ fontSize: score ? 64 : 80, fontWeight: 700, color: "#F5F0E8", textAlign: "center", maxWidth: 900, lineHeight: 1.1, display: "flex" }}>
          {title}
        </div>

        {/* Score badge if present */}
        {score && (
          <div style={{ marginTop: 24, padding: "8px 24px", backgroundColor: "#C8972A", borderRadius: 12, fontSize: 28, fontWeight: 700, color: "#1A0A00", display: "flex", alignItems: "center", gap: 8 }}>
            {score} GS
          </div>
        )}

        {/* Subtitle */}
        <div style={{ marginTop: 20, fontSize: 28, color: "#C8972A", display: "flex" }}>
          {subtitle}
        </div>

        {/* City */}
        {city && (
          <div style={{ marginTop: 12, fontSize: 20, color: "#F5F0E8", opacity: 0.5, display: "flex" }}>
            {city}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
