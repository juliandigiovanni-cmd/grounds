import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET: flagged cafes with their report counts
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("cafes")
    .select("id, name, city, country, flag_count, flag_reason, flagged, verified")
    .eq("flagged", true)
    .order("flag_count", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also fetch recent flag reports for detail
  const ids = (data ?? []).map(c => c.id);
  let reports: object[] = [];
  if (ids.length > 0) {
    const { data: r } = await supabase
      .from("flag_reports")
      .select("cafe_id, reason, created_at")
      .in("cafe_id", ids)
      .order("created_at", { ascending: false });
    reports = r ?? [];
  }

  return NextResponse.json({ cafes: data ?? [], reports });
}

// PATCH: dismiss flag (clear flagged status)
export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = createServerClient();
  const { error } = await supabase
    .from("cafes")
    .update({ flagged: false, flag_count: 0, flag_reason: null, verified: true })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Delete associated reports
  await supabase.from("flag_reports").delete().eq("cafe_id", id);
  return NextResponse.json({ ok: true });
}

// DELETE: remove the cafe entirely
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = createServerClient();
  const { error } = await supabase.from("cafes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
