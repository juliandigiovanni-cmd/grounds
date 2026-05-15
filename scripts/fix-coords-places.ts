/**
 * Coordinate correction via Google Places Text Search API.
 * Finds each café by name + city, extracts precise coordinates (~5–20m accuracy),
 * and populates the google_place_id field for future enrichment.
 *
 * Dry-run by default — prints proposed changes without touching any files.
 * Pass --apply to write corrections back to the seed files.
 *
 * Usage:
 *   npx tsx scripts/fix-coords-places.ts                          # dry-run all cafés
 *   npx tsx scripts/fix-coords-places.ts --city Vancouver         # dry-run one city
 *   npx tsx scripts/fix-coords-places.ts --city Vancouver --apply # apply one city
 *   npx tsx scripts/fix-coords-places.ts --apply                  # apply all (~2 min)
 *   npx tsx scripts/fix-coords-places.ts --threshold 20           # custom threshold (m)
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
const THRESHOLD_METERS = isNaN(thresholdArg) ? 50 : thresholdArg;

const DELAY_MS = 200;

// ── Seed file paths ───────────────────────────────────────────────────────────

const SEED_FILES = ["seed-na", "seed-europe", "seed-asia", "seed-latam", "seed-africa", "seed-oceania"]
  .map(f => path.join(__dirname, `../lib/${f}.ts`));

const fileContents = new Map<string, string>();

function loadFile(filePath: string): string {
  if (!fileContents.has(filePath)) {
    fileContents.set(filePath, fs.readFileSync(filePath, "utf8"));
  }
  return fileContents.get(filePath)!;
}

function findSeedFile(slug: string): string | null {
  for (const filePath of SEED_FILES) {
    if (loadFile(filePath).includes(`slug: "${slug}"`)) return filePath;
  }
  return null;
}

function patchEntry(filePath: string, slug: string, newLat: number, newLng: number, placeId: string): boolean {
  const content = loadFile(filePath);
  const slugMarker = `slug: "${slug}"`;
  const slugIdx = content.indexOf(slugMarker);
  if (slugIdx === -1) return false;

  const windowStart = slugIdx;
  const windowEnd = slugIdx + 300;
  let window = content.slice(windowStart, windowEnd);

  const patched = window.replace(
    /lat: [-\d.]+, lng: [-\d.]+/,
    `lat: ${newLat.toFixed(4)}, lng: ${newLng.toFixed(4)}`
  );
  if (patched === window) return false;
  window = patched;

  if (window.includes("google_place_id:")) {
    window = window.replace(/google_place_id: "[^"]*"/, `google_place_id: "${placeId}"`);
  } else {
    window = window.replace(
      /(lat: [-\d.]+, lng: [-\d.]+,\n)/,
      `$1    google_place_id: "${placeId}",\n`
    );
  }

  fileContents.set(filePath, content.slice(0, windowStart) + window + content.slice(windowEnd));
  return true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function wordOverlap(a: string, b: string): boolean {
  const tokenize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const setA = new Set(tokenize(a));
  for (const w of tokenize(b)) {
    if (setA.has(w) && w.length > 2) return true;
  }
  return false;
}

async function searchPlace(name: string, city: string, address: string): Promise<{ lat: number; lng: number; placeId: string; matchName: string } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");

  // Include address so multi-branch chains resolve to the right location
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location",
    },
    body: JSON.stringify({ textQuery: `${name} ${address}` }),
  });
  if (!res.ok) return null;

  const data = await res.json() as {
    places?: { id: string; displayName: { text: string }; location: { latitude: number; longitude: number } }[];
  };

  const r = data.places?.[0];
  if (!r) return null;
  return {
    lat: r.location.latitude,
    lng: r.location.longitude,
    placeId: r.id,
    matchName: r.displayName.text,
  };
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
  if (!applyFix) console.log("  Run with --apply to write changes to seed files.\n");

  const fixes: {
    slug: string; city: string; dist: number;
    oldCoords: string; newCoords: string;
    seedName: string; matchName: string;
    placeId: string; filePath: string;
  }[] = [];
  const skipped: { slug: string; reason: string }[] = [];
  const failures: string[] = [];
  let checked = 0;

  for (const cafe of cafes) {
    const result = await searchPlace(cafe.name, cafe.city, cafe.address);
    checked++;
    process.stdout.write(`\r[${checked}/${cafes.length}] checking…                              `);

    if (!result) {
      failures.push(cafe.slug);
      await sleep(DELAY_MS);
      continue;
    }

    if (!wordOverlap(cafe.name, result.matchName)) {
      skipped.push({ slug: cafe.slug, reason: `name mismatch: "${cafe.name}" vs "${result.matchName}"` });
      await sleep(DELAY_MS);
      continue;
    }

    const dist = Math.round(haversine(cafe.lat, cafe.lng, result.lat, result.lng));

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
        newCoords: `${result.lat.toFixed(4)},${result.lng.toFixed(4)}`,
        seedName: cafe.name,
        matchName: result.matchName,
        placeId: result.placeId,
        filePath,
      });
    }

    await sleep(DELAY_MS);
  }

  process.stdout.write("\n\n");

  // ── Report ────────────────────────────────────────────────────────────────

  if (fixes.length === 0) {
    console.log(`✓ No coordinate mismatches found above ${THRESHOLD_METERS} m threshold.`);
  } else {
    fixes.sort((a, b) => b.dist - a.dist);
    console.log(`${fixes.length} fix${fixes.length !== 1 ? "es" : ""} proposed (>${THRESHOLD_METERS} m off):\n`);
    console.log("DIST(m)  CITY              SEED NAME                       GOOGLE MATCH");
    console.log("───────  ────────────────  ──────────────────────────────  ──────────────────────────────");
    for (const f of fixes) {
      let tag = "";
      if (applyFix) {
        const applied = patchEntry(f.filePath, f.slug, ...f.newCoords.split(",").map(Number) as [number, number], f.placeId);
        tag = applied ? "  ✓ patched" : "  ✗ patch failed";
      }
      const nameMatch = f.seedName === f.matchName ? "✓" : "~";
      console.log(`${String(f.dist).padEnd(7)}  ${f.city.padEnd(16)}  ${f.seedName.padEnd(30)}  ${f.matchName} ${nameMatch}${tag}`);
      console.log(`         old: ${f.oldCoords}`);
      console.log(`         new: ${f.newCoords}`);
      console.log();
    }
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped (name mismatch — not applied): ${skipped.length}`);
    skipped.forEach(s => console.log(`  - ${s.slug}: ${s.reason}`));
  }

  if (failures.length > 0) {
    console.log(`\nGeocoding failures (no results): ${failures.length}`);
    failures.forEach(s => console.log(`  - ${s}`));
  }

  // ── Write patched files ───────────────────────────────────────────────────

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
