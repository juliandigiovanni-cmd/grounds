/**
 * Coordinate correction script.
 * Geocodes every café address via Nominatim (OpenStreetMap) and patches entries
 * where the stored lat/lng is more than THRESHOLD_METERS away from the result.
 *
 * Dry-run by default — prints proposed changes without touching any files.
 * Pass --apply to write corrections back to the seed files.
 *
 * Usage:
 *   npx tsx scripts/fix-coords.ts                          # dry-run all cafés
 *   npx tsx scripts/fix-coords.ts --city Vancouver         # dry-run one city
 *   npx tsx scripts/fix-coords.ts --city Vancouver --apply # apply one city
 *   npx tsx scripts/fix-coords.ts --apply                  # apply all (~11 min)
 *   npx tsx scripts/fix-coords.ts --threshold 200          # custom threshold (m)
 *
 * After applying, re-seed Supabase:
 *   npx tsx scripts/seed-supabase.ts
 */

import * as fs from "fs";
import * as path from "path";
import { SEED_CAFES } from "../lib/seed-data";

// ── CLI args ─────────────────────────────────────────────────────────────────

const applyFix = process.argv.includes("--apply");

const cityFilter = (() => {
  const idx = process.argv.indexOf("--city");
  return idx !== -1 ? process.argv[idx + 1]?.toLowerCase() : null;
})();

const thresholdArg = (() => {
  const idx = process.argv.indexOf("--threshold");
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : NaN;
})();
const THRESHOLD_METERS = isNaN(thresholdArg) ? 100 : thresholdArg;

const DELAY_MS = 1100; // Nominatim policy: max 1 req/s

// ── Seed file paths ───────────────────────────────────────────────────────────

const SEED_FILES = ["seed-na", "seed-europe", "seed-asia", "seed-latam", "seed-africa", "seed-oceania"]
  .map(f => path.join(__dirname, `../lib/${f}.ts`));

// Cache of file contents (read once, patched in memory, written at end)
const fileContents = new Map<string, string>();

function loadFile(filePath: string): string {
  if (!fileContents.has(filePath)) {
    fileContents.set(filePath, fs.readFileSync(filePath, "utf8"));
  }
  return fileContents.get(filePath)!;
}

function findSeedFile(slug: string): string | null {
  for (const filePath of SEED_FILES) {
    const content = loadFile(filePath);
    if (content.includes(`slug: "${slug}"`)) return filePath;
  }
  return null;
}

function patchCoords(filePath: string, slug: string, newLat: number, newLng: number): boolean {
  const content = loadFile(filePath);
  const slugMarker = `slug: "${slug}"`;
  const slugIdx = content.indexOf(slugMarker);
  if (slugIdx === -1) return false;

  // The lat/lng line always follows the slug line within 200 chars
  const windowStart = slugIdx;
  const windowEnd = slugIdx + 200;
  const window = content.slice(windowStart, windowEnd);

  const newWindow = window.replace(
    /lat: [-\d.]+, lng: [-\d.]+/,
    `lat: ${newLat.toFixed(4)}, lng: ${newLng.toFixed(4)}`
  );

  if (newWindow === window) return false; // nothing changed

  const patched = content.slice(0, windowStart) + newWindow + content.slice(windowEnd);
  fileContents.set(filePath, patched);
  return true;
}

// ── Geocoding (same as check-coords.ts) ──────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "grounds-coord-fix/1.0 (grounds-snowy.vercel.app)",
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const cafes = SEED_CAFES.filter(c => {
    if (c.permanently_closed) return false;
    if (cityFilter) return c.city.toLowerCase() === cityFilter;
    return true;
  });

  console.log(`\nMode: ${applyFix ? "APPLY" : "DRY-RUN"}`);
  console.log(`Threshold: ${THRESHOLD_METERS} m`);
  console.log(`Cafés to check: ${cafes.length}${cityFilter ? ` (city: ${cityFilter})` : ""}\n`);
  if (!applyFix) {
    console.log("  Run with --apply to write changes to seed files.\n");
  }

  const fixes: { slug: string; city: string; dist: number; oldCoords: string; newCoords: string; filePath: string }[] = [];
  const failures: string[] = [];
  let checked = 0;

  for (const cafe of cafes) {
    const geo = await geocode(cafe.address);
    checked++;
    process.stdout.write(`\r[${checked}/${cafes.length}] checking…                              `);

    if (!geo) {
      failures.push(cafe.slug);
      await sleep(DELAY_MS);
      continue;
    }

    const dist = Math.round(haversine(cafe.lat, cafe.lng, geo.lat, geo.lng));

    if (dist > THRESHOLD_METERS) {
      const filePath = findSeedFile(cafe.slug);
      if (!filePath) {
        failures.push(cafe.slug);
        await sleep(DELAY_MS);
        continue;
      }
      fixes.push({
        slug: cafe.slug,
        city: cafe.city,
        dist,
        oldCoords: `${cafe.lat},${cafe.lng}`,
        newCoords: `${geo.lat.toFixed(4)},${geo.lng.toFixed(4)}`,
        filePath,
      });
    }

    await sleep(DELAY_MS);
  }

  process.stdout.write("\n\n");

  // ── Report ──────────────────────────────────────────────────────────────────

  if (fixes.length === 0) {
    console.log(`✓ No coordinate mismatches found above ${THRESHOLD_METERS} m threshold.`);
  } else {
    fixes.sort((a, b) => b.dist - a.dist);
    console.log(`${fixes.length} fix${fixes.length !== 1 ? "es" : ""} proposed (>${THRESHOLD_METERS} m off):\n`);
    console.log("DIST(m)  CITY              SLUG");
    console.log("───────  ────────────────  ────────────────────────────────────────");
    for (const f of fixes) {
      const applied = applyFix ? patchCoords(f.filePath, f.slug, ...f.newCoords.split(",").map(Number) as [number, number]) : false;
      const tag = applyFix ? (applied ? " ✓ patched" : " ✗ patch failed") : "";
      console.log(`${String(f.dist).padEnd(7)}  ${f.city.padEnd(16)}  ${f.slug}${tag}`);
      console.log(`         old: ${f.oldCoords}`);
      console.log(`         new: ${f.newCoords}`);
      console.log();
    }
  }

  if (failures.length > 0) {
    console.log(`\nGeocoding failures (skipped, no changes made): ${failures.length}`);
    failures.forEach(s => console.log(`  - ${s}`));
  }

  // ── Write patched files ─────────────────────────────────────────────────────

  if (applyFix && fixes.length > 0) {
    const changedFiles = Array.from(new Set(fixes.map(f => f.filePath)));
    let writeErrors = 0;
    for (const filePath of changedFiles) {
      try {
        fs.writeFileSync(filePath, fileContents.get(filePath)!);
        console.log(`Wrote ${path.basename(filePath)}`);
      } catch (err) {
        console.error(`Failed to write ${filePath}:`, err);
        writeErrors++;
      }
    }
    if (writeErrors === 0) {
      console.log(`\n✓ ${changedFiles.length} file${changedFiles.length !== 1 ? "s" : ""} updated.`);
      console.log("Next step: npx tsx scripts/seed-supabase.ts");
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
