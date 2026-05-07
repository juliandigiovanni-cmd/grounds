/**
 * Seed script: upserts all cities and cafes from seed-data.ts into Supabase.
 * Run with: npx tsx scripts/seed-supabase.ts
 * Safe to re-run — uses onConflict: slug for idempotent upserts.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import { SEED_CAFES, SEED_CITIES } from "../lib/seed-data";

// Load .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log(`Connecting to ${SUPABASE_URL}…`);

  // ── 1. Upsert cities ──────────────────────────────────────────────────────
  console.log(`Upserting ${SEED_CITIES.length} cities…`);
  const { error: cityError } = await supabase
    .from("cities")
    .upsert(
      SEED_CITIES.map(c => ({
        name: c.name,
        country: c.country,
        lat: c.lat,
        lng: c.lng,
        slug: c.slug,
        cafe_count: c.cafe_count,
        city_blurb: c.city_blurb,
      })),
      { onConflict: "slug" }
    );

  if (cityError) {
    console.error("City upsert failed:", cityError.message);
    process.exit(1);
  }
  console.log("✓ Cities done");

  // ── 2. Upsert cafes ───────────────────────────────────────────────────────
  const cafes = SEED_CAFES.map(cafe => ({
    name: cafe.name,
    slug: cafe.slug,
    lat: cafe.lat,
    lng: cafe.lng,
    city: cafe.city,
    country: cafe.country,
    address: cafe.address,
    roaster: cafe.roaster ?? null,
    brew_methods: cafe.brew_methods,
    vibe_tags: cafe.vibe_tags,
    google_place_id: cafe.google_place_id ?? null,
    instagram_handle: cafe.instagram_handle ?? null,
    website: cafe.website ?? null,
    editorial_blurb: cafe.editorial_blurb,
    featured_in: cafe.featured_in,
    verified: cafe.verified,
    last_verified_at: cafe.last_verified_at ? new Date(cafe.last_verified_at).toISOString() : null,
    verification_source: cafe.verification_source ?? null,
    permanently_closed: false,
    sponsored: false,
    verified_paid: false,
  }));

  console.log(`Upserting ${cafes.length} cafes…`);
  const BATCH = 25;
  for (let i = 0; i < cafes.length; i += BATCH) {
    const batch = cafes.slice(i, i + BATCH);
    const { error } = await supabase
      .from("cafes")
      .upsert(batch, { onConflict: "slug" });
    if (error) {
      console.error(`Cafe batch ${i / BATCH + 1} failed:`, error.message);
      process.exit(1);
    }
    console.log(`  batch ${i / BATCH + 1}/${Math.ceil(cafes.length / BATCH)} ✓`);
  }
  console.log("✓ Cafes done");

  // ── 3. Upsert aggregate scores ────────────────────────────────────────────
  console.log("Fetching cafe UUIDs for aggregate scores…");
  const { data: cafeRows, error: fetchErr } = await supabase
    .from("cafes")
    .select("id, slug");
  if (fetchErr || !cafeRows) {
    console.error("Could not fetch cafe IDs:", fetchErr?.message);
    process.exit(1);
  }
  const slugToId = Object.fromEntries(cafeRows.map(r => [r.slug, r.id]));

  const scores = SEED_CAFES
    .map(cafe => {
      const id = slugToId[cafe.slug];
      if (!id) return null;
      return {
        cafe_id: id,
        third_wave_score: cafe.third_wave_score ?? 50,
        overall_rating: cafe.overall_rating ?? 4.5,
        review_count: cafe.review_count ?? 100,
      };
    })
    .filter(Boolean);

  const { error: scoreError } = await supabase
    .from("aggregate_scores")
    .upsert(scores as object[], { onConflict: "cafe_id" });
  if (scoreError) {
    console.error("Scores upsert failed:", scoreError.message);
    process.exit(1);
  }
  console.log("✓ Aggregate scores done");

  console.log(`\n✅ Seeded ${SEED_CITIES.length} cities, ${cafes.length} cafes, and ${scores.length} scores into Supabase.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
