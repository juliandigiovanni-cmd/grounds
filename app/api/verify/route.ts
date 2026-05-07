import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { cafeId, vote } = await req.json();

  if (!cafeId || !["yes", "no"].includes(vote)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // In production: insert to Supabase verification_votes table
  // For now: log and return success
  console.log(`Verification vote: ${cafeId} → ${vote} (${ip})`);

  return NextResponse.json({ success: true });
}
