import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();

  const [
    { count: subscribers },
    { count: inquiries },
    { count: sponsored },
    { count: verifiedPaid },
    { count: submissions },
    { count: totalCafes },
  ] = await Promise.all([
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).is("unsubscribed_at", null),
    supabase.from("advertiser_inquiries").select("*", { count: "exact", head: true }),
    supabase.from("cafes").select("*", { count: "exact", head: true }).eq("sponsored", true),
    supabase.from("cafes").select("*", { count: "exact", head: true }).eq("verified_paid", true),
    supabase.from("cafes").select("*", { count: "exact", head: true }).eq("verified", false),
    supabase.from("cafes").select("*", { count: "exact", head: true }),
  ]);

  // Recent inquiries
  const { data: recentInquiries } = await supabase
    .from("advertiser_inquiries")
    .select("id, name, email, company, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    subscribers: subscribers ?? 0,
    inquiries: inquiries ?? 0,
    sponsored: sponsored ?? 0,
    verifiedPaid: verifiedPaid ?? 0,
    pendingSubmissions: submissions ?? 0,
    totalCafes: totalCafes ?? 0,
    recentInquiries: recentInquiries ?? [],
  });
}
