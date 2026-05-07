import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { cafe, email, city, website } = await req.json();
    if (!cafe?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Café name and email are required." }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase.from("advertiser_inquiries").insert({
      name: cafe.trim(),
      email: email.trim().toLowerCase(),
      company: city?.trim() || null,
      message: website?.trim() || null,
    });

    if (error) {
      console.error("Inquiry insert error:", error.message);
      return NextResponse.json({ error: "Failed to save inquiry." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
