import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET: list all unverified submissions (and recently approved ones)
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("cafes")
    .select("id, name, city, country, address, website, instagram_handle, editorial_blurb, created_at, verified")
    .is("submitted_by", null)
    .or("verified.eq.false,and(verified.eq.true,created_at.gte." + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() + ")")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: data ?? [] });
}

// PATCH: approve a submission (set verified: true)
export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = createServerClient();
  const { error } = await supabase
    .from("cafes")
    .update({ verified: true, verification_source: "admin", last_verified_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE: remove a submission
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = createServerClient();
  const { error } = await supabase.from("cafes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
