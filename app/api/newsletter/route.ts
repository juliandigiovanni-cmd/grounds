import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();
    if (!email?.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: email.trim().toLowerCase(),
      source: source ?? "unknown",
    });

    // Duplicate email is fine — silently succeed
    if (error && !error.message.includes("duplicate")) {
      console.error("Newsletter insert error:", error.message);
      return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
