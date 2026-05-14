/**
 * Coordinate validation script.
 * Geocodes every café address via Nominatim (OpenStreetMap) and flags entries
 * where the stored lat/lng is more than THRESHOLD_METERS away from the result.
 *
 * Run with: npx tsx scripts/check-coords.ts
 * Optional city filter: npx tsx scripts/check-coords.ts --city Vancouver
 */
import { SEED_CAFES } from "../lib/seed-data";

const THRESHOLD_METERS = 300;
const DELAY_MS = 1100; // Nominatim policy: max 1 req/s

const cityFilter = (() => {
  const idx = process.argv.indexOf("--city");
  return idx !== -1 ? process.argv[idx + 1]?.toLowerCase() : null;
})();

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "grounds-coord-check/1.0 (grounds-snowy.vercel.app)",
      "Accept-Language": "en",
    },
  });
  if (!res.ok) return null;
  const data = await res.json() as { lat: string; lon: string }[];
  const f = data[0];
  if (!f) return null;
  return { lat: parseFloat(f.lat), lng: parseFloat(f.lon) };
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const cafes = SEED_CAFES.filter(c => {
    if (c.permanently_closed) return false;
    if (cityFilter) return c.city.toLowerCase() === cityFilter;
    return true;
  });

  console.log(`Checking ${cafes.length} cafés${cityFilter ? ` in ${cityFilter}` : ""}…\n`);

  const flagged: { slug: string; city: string; dist: number; stored: string; geocoded: string; address: string }[] = [];
  let checked = 0;

  for (const cafe of cafes) {
    const geo = await geocode(cafe.address);
    checked++;

    if (!geo) {
      process.stdout.write(`\r[${checked}/${cafes.length}] ${cafe.slug} — geocode failed, skipping`);
      await sleep(DELAY_MS);
      continue;
    }

    const dist = Math.round(haversine(cafe.lat, cafe.lng, geo.lat, geo.lng));
    process.stdout.write(`\r[${checked}/${cafes.length}] checking…                              `);

    if (dist > THRESHOLD_METERS) {
      flagged.push({
        slug: cafe.slug,
        city: cafe.city,
        dist,
        stored: `${cafe.lat},${cafe.lng}`,
        geocoded: `${geo.lat.toFixed(4)},${geo.lng.toFixed(4)}`,
        address: cafe.address,
      });
    }

    await sleep(DELAY_MS);
  }

  process.stdout.write("\n\n");

  if (flagged.length === 0) {
    console.log("✓ No coordinate mismatches found above threshold.");
    return;
  }

  flagged.sort((a, b) => b.dist - a.dist);
  console.log(`${flagged.length} flagged (>${THRESHOLD_METERS}m off):\n`);
  console.log("DIST(m)  CITY              SLUG");
  console.log("───────  ────────────────  ────────────────────────────────────────");
  for (const f of flagged) {
    console.log(`${String(f.dist).padEnd(7)}  ${f.city.padEnd(16)}  ${f.slug}`);
    console.log(`         stored:   ${f.stored}`);
    console.log(`         geocoded: ${f.geocoded}`);
    console.log(`         address:  ${f.address}`);
    console.log();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
