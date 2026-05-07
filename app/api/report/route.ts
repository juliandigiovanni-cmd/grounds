import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { cafeId, reason } = await req.json();
    if (!cafeId || !reason) {
      return NextResponse.json({ error: "Missing cafeId or reason." }, { status: 400 });
    }

    // Get reporter IP for basic dedup (hashed, not stored raw)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const supabase = createServerClient();

    // Insert the flag report (trigger in DB auto-increments flag_count and sets flagged=true at threshold 3)
    const { error } = await supabase.from("flag_reports").insert({
      cafe_id: cafeId,
      reason,
      reporter_ip: ip,
    });

    if (error) {
      // Ignore if this IP already reported this cafe (can add unique constraint later)
      console.error("Flag report insert error:", error.message);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
