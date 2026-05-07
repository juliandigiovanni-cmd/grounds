import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

function toSlug(name: string, city: string): string {
  const base = `${name} ${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, city, address, website, instagram, blurb, submitterEmail } = body;

    if (!name?.trim() || !city?.trim()) {
      return NextResponse.json({ error: "Name and city are required." }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase.from("cafes").insert({
      name: name.trim(),
      slug: toSlug(name.trim(), city.trim()),
      city: city.trim(),
      country: "",
      lat: 0,
      lng: 0,
      address: address?.trim() ?? "",
      website: website?.trim() || null,
      instagram_handle: instagram?.trim().replace(/^@/, "") || null,
      editorial_blurb: blurb?.trim() || "Submitted for review.",
      brew_methods: [],
      vibe_tags: [],
      featured_in: [],
      verified: false,
      submitted_by: null,
      permanently_closed: false,
      sponsored: false,
      verified_paid: false,
    });

    if (error) {
      console.error("Submit insert error:", error.message);
      return NextResponse.json({ error: "Failed to save submission." }, { status: 500 });
    }

    // Also log to verified_waitlist if email provided
    if (submitterEmail?.trim()) {
      try {
        await supabase.from("verified_waitlist").insert({
          cafe_name: name.trim(),
          city: city.trim(),
          email: submitterEmail.trim(),
        });
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Submit route error:", err);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
