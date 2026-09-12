import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  const { id, editorial_blurb } = await req.json();
  if (!id || !editorial_blurb?.trim()) {
    return NextResponse.json({ error: "Missing id or blurb." }, { status: 400 });
  }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("cafes")
    .update({ editorial_blurb: editorial_blurb.trim() })
    .eq("slug", id); // seed cafe ids are slugs
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
