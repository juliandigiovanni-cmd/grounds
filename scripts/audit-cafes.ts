/**
 * Rigorous café audit via Google Places API.
 * For each café, checks: open/closed status, website accuracy, address differences,
 * and flags chains that may have additional unlisted locations.
 *
 * Cafés with google_place_id (from fix-coords-places.ts) use Place Details directly.
 * Cafés without use Text Search first to find them.
 *
 * Dry-run by default — prints a report, no file changes.
 * Pass --apply to write permanently_closed and website fixes to seed files.
 *
 * Usage:
 *   npx tsx scripts/audit-cafes.ts                          # dry-run all cafés
 *   npx tsx scripts/audit-cafes.ts --city Vancouver         # dry-run one city
 *   npx tsx scripts/audit-cafes.ts --city Vancouver --apply # apply one city
 *   npx tsx scripts/audit-cafes.ts --apply                  # apply all (~4 min)
 *
 * After applying, re-seed Supabase:
 *   npx tsx scripts/seed-supabase.ts
 */

import * as fs from "fs";
import * as path from "path";
import { SEED_CAFES } from "../lib/seed-data";

// ── CLI args ──────────────────────────────────────────────────────────────────

const applyFix = process.argv.includes("--apply");
const closuresOnly = process.argv.includes("--closures-only");

const cityFilter = (() => {
  const idx = process.argv.indexOf("--city");
  return idx !== -1 ? process.argv[idx + 1]?.toLowerCase() : null;
})();

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

function patchWebsite(filePath: string, slug: string, newWebsite: string): boolean {
  const content = loadFile(filePath);
  const slugIdx = content.indexOf(`slug: "${slug}"`);
  if (slugIdx === -1) return false;

  const entryEnd = content.indexOf('\n  },', slugIdx);
  if (entryEnd === -1) return false;
  const win = content.slice(slugIdx, entryEnd);

  let patched: string;
  if (win.includes("website:")) {
    patched = win.replace(/website: "[^"]*"/, `website: "${newWebsite}"`);
  } else {
    // Insert before editorial_blurb
    patched = win.replace(
      /(editorial_blurb:)/,
      `website: "${newWebsite}",\n    $1`
    );
  }

  if (patched === win) return false;
  fileContents.set(filePath, content.slice(0, slugIdx) + patched + content.slice(entryEnd));
  return true;
}

function patchClosed(filePath: string, slug: string, date: string): boolean {
  const content = loadFile(filePath);
  const slugIdx = content.indexOf(`slug: "${slug}"`);
  if (slugIdx === -1) return false;

  const entryEnd = content.indexOf('\n  },', slugIdx);
  if (entryEnd === -1) return false;
  const win = content.slice(slugIdx, entryEnd);

  // Update if already present, otherwise insert before editorial_blurb
  let patched = win;
  if (win.includes("permanently_closed:")) {
    patched = patched.replace(/permanently_closed: \w+/, "permanently_closed: true");
  } else {
    patched = patched.replace(/(editorial_blurb:)/, `permanently_closed: true,\n    $1`);
  }
  if (win.includes("closure_reported_at:")) {
    patched = patched.replace(/closure_reported_at: "[^"]*"/, `closure_reported_at: "${date}"`);
  } else {
    patched = patched.replace(/(permanently_closed: true,\n)/, `$1    closure_reported_at: "${date}",\n`);
  }

  if (patched === win) return false;
  fileContents.set(filePath, content.slice(0, slugIdx) + patched + content.slice(entryEnd));
  return true;
}

// ── Google Places API ─────────────────────────────────────────────────────────

interface PlaceDetails {
  name: string;
  formatted_address: string;
  business_status: string;
  website?: string;
}

async function fetchDetails(placeId: string): Promise<PlaceDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");

  const fields = "name,formatted_address,business_status,website";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as { status: string; result?: PlaceDetails };
  if (data.status !== "OK" || !data.result) return null;
  return data.result;
}

async function textSearch(name: string, address: string): Promise<{ placeId: string; matchName: string } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({ textQuery: `${name} ${address}` }),
  });
  if (!res.ok) return null;

  const data = await res.json() as {
    places?: { id: string; displayName: { text: string } }[];
  };
  const r = data.places?.[0];
  if (!r) return null;
  return { placeId: r.id, matchName: r.displayName.text };
}

function wordOverlap(a: string, b: string): boolean {
  const tokenize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 2);
  const setA = new Set(tokenize(a));
  return tokenize(b).some(w => setA.has(w));
}

// Detect if a name has a branch qualifier suffix (e.g. "Pallet Coffee - East Broadway")
function hasBranchQualifier(googleName: string, seedName: string): boolean {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const gn = clean(googleName);
  const sn = clean(seedName);
  // Google name is longer and contains a delimiter suggesting a branch
  return gn.length > sn.length + 5 && (googleName.includes(" - ") || googleName.includes(", "));
}

function normalizeWebsite(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").toLowerCase();
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── Issue types ───────────────────────────────────────────────────────────────

type IssueType = "CLOSED_PERM" | "CLOSED_TEMP" | "WEBSITE" | "WEBSITE_ADD" | "ADDRESS" | "CHAIN" | "NO_RESULT";

interface Issue {
  type: IssueType;
  slug: string;
  city: string;
  seedName: string;
  detail: string;
  suggestedValue?: string;
  filePath?: string;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  const cafes = SEED_CAFES.filter(c => {
    if (cityFilter) return c.city.toLowerCase() === cityFilter;
    return true;
  });

  console.log(`\nMode: ${applyFix ? "APPLY" : "DRY-RUN"}`);
  console.log(`Cafés to audit: ${cafes.length}${cityFilter ? ` (city: ${cityFilter})` : ""}\n`);
  if (!applyFix) console.log("  Run with --apply to write fixes to seed files.\n");

  const issues: Issue[] = [];
  let checked = 0;
  let noResult = 0;

  for (const cafe of cafes) {
    checked++;
    process.stdout.write(`\r[${checked}/${cafes.length}] auditing…                              `);

    let details: PlaceDetails | null = null;
    let resolvedPlaceId = cafe.google_place_id;

    if (resolvedPlaceId) {
      details = await fetchDetails(resolvedPlaceId);
      await sleep(DELAY_MS);
    } else {
      const found = await textSearch(cafe.name, cafe.address);
      await sleep(DELAY_MS);
      if (found && wordOverlap(cafe.name, found.matchName)) {
        resolvedPlaceId = found.placeId;
        details = await fetchDetails(resolvedPlaceId);
        await sleep(DELAY_MS);
      }
    }

    if (!details) {
      if (!cafe.permanently_closed) {
        issues.push({ type: "NO_RESULT", slug: cafe.slug, city: cafe.city, seedName: cafe.name, detail: "no Places match found" });
        noResult++;
      }
      continue;
    }

    const filePath = findSeedFile(cafe.slug);

    // ── Open/closed status ───────────────────────────────────────────────────
    if (details.business_status === "CLOSED_PERMANENTLY" && !cafe.permanently_closed) {
      issues.push({
        type: "CLOSED_PERM",
        slug: cafe.slug, city: cafe.city, seedName: cafe.name,
        detail: `Google: CLOSED_PERMANENTLY`,
        filePath: filePath ?? undefined,
      });
    } else if (details.business_status === "CLOSED_TEMPORARILY" && !cafe.permanently_closed) {
      issues.push({
        type: "CLOSED_TEMP",
        slug: cafe.slug, city: cafe.city, seedName: cafe.name,
        detail: `Google: CLOSED_TEMPORARILY`,
      });
    }

    // ── Website ──────────────────────────────────────────────────────────────
    if (details.website) {
      if (!cafe.website) {
        issues.push({
          type: "WEBSITE_ADD",
          slug: cafe.slug, city: cafe.city, seedName: cafe.name,
          detail: `seed: (none) → Google: ${details.website}`,
          suggestedValue: details.website,
          filePath: filePath ?? undefined,
        });
      } else if (normalizeWebsite(details.website) !== normalizeWebsite(cafe.website)) {
        issues.push({
          type: "WEBSITE",
          slug: cafe.slug, city: cafe.city, seedName: cafe.name,
          detail: `seed: ${cafe.website} → Google: ${details.website}`,
          suggestedValue: details.website,
          filePath: filePath ?? undefined,
        });
      }
    }

    // ── Chain / multiple locations ───────────────────────────────────────────
    if (hasBranchQualifier(details.name, cafe.name)) {
      issues.push({
        type: "CHAIN",
        slug: cafe.slug, city: cafe.city, seedName: cafe.name,
        detail: `Google name: "${details.name}" — may have other locations`,
      });
    }

    // ── Address diff (flag only, no auto-apply) ──────────────────────────────
    const seedStreet = cafe.address.split(",")[0].trim().toLowerCase();
    const googleStreet = details.formatted_address.split(",")[0].trim().toLowerCase();
    if (seedStreet !== googleStreet && !seedStreet.includes(googleStreet) && !googleStreet.includes(seedStreet)) {
      issues.push({
        type: "ADDRESS",
        slug: cafe.slug, city: cafe.city, seedName: cafe.name,
        detail: `seed: "${cafe.address}" → Google: "${details.formatted_address}"`,
      });
    }
  }

  process.stdout.write("\n\n");

  // ── Apply fixes ───────────────────────────────────────────────────────────

  const applyable = issues.filter(i => applyFix && i.filePath && (
    i.type === "CLOSED_PERM" ||
    (!closuresOnly && (i.type === "WEBSITE" || i.type === "WEBSITE_ADD"))
  ));
  const applyResults = new Map<string, boolean>();

  if (applyFix) {
    for (const issue of applyable) {
      if (issue.type === "CLOSED_PERM") {
        const ok = patchClosed(issue.filePath!, issue.slug, today);
        applyResults.set(issue.slug + issue.type, ok);
      } else if (issue.type === "WEBSITE" || issue.type === "WEBSITE_ADD") {
        const ok = patchWebsite(issue.filePath!, issue.slug, issue.suggestedValue!);
        applyResults.set(issue.slug + issue.type, ok);
      }
    }
  }

  // ── Report ────────────────────────────────────────────────────────────────

  const ORDER: IssueType[] = ["CLOSED_PERM", "CLOSED_TEMP", "WEBSITE", "WEBSITE_ADD", "CHAIN", "ADDRESS", "NO_RESULT"];
  const sorted = [...issues].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type) || a.city.localeCompare(b.city));

  const counts: Partial<Record<IssueType, number>> = {};
  for (const i of issues) counts[i.type] = (counts[i.type] ?? 0) + 1;

  console.log("── Summary ──────────────────────────────────────────────────────");
  if (counts.CLOSED_PERM)  console.log(`  ${counts.CLOSED_PERM} permanently closed`);
  if (counts.CLOSED_TEMP)  console.log(`  ${counts.CLOSED_TEMP} temporarily closed`);
  if (counts.WEBSITE)      console.log(`  ${counts.WEBSITE} website mismatches`);
  if (counts.WEBSITE_ADD)  console.log(`  ${counts.WEBSITE_ADD} websites to add`);
  if (counts.CHAIN)        console.log(`  ${counts.CHAIN} possible chain locations`);
  if (counts.ADDRESS)      console.log(`  ${counts.ADDRESS} address differences`);
  if (counts.NO_RESULT)    console.log(`  ${counts.NO_RESULT} no Places match`);
  if (issues.length === 0) console.log("  ✓ No issues found");
  console.log();

  let lastType: IssueType | null = null;
  for (const issue of sorted) {
    if (issue.type !== lastType) {
      const labels: Record<IssueType, string> = {
        CLOSED_PERM:  "── PERMANENTLY CLOSED ───────────────────────────────────────────",
        CLOSED_TEMP:  "── TEMPORARILY CLOSED ───────────────────────────────────────────",
        WEBSITE:      "── WEBSITE MISMATCH ──────────────────────────────────────────────",
        WEBSITE_ADD:  "── WEBSITE TO ADD ────────────────────────────────────────────────",
        CHAIN:        "── POSSIBLE CHAIN (review manually) ─────────────────────────────",
        ADDRESS:      "── ADDRESS DIFFERENCE (review manually) ──────────────────────────",
        NO_RESULT:    "── NO PLACES MATCH ───────────────────────────────────────────────",
      };
      console.log(labels[issue.type]);
      lastType = issue.type;
    }

    const applied = applyFix && applyResults.has(issue.slug + issue.type);
    const tag = applied ? (applyResults.get(issue.slug + issue.type) ? " ✓ applied" : " ✗ failed") : "";
    console.log(`  ${issue.city.padEnd(16)} ${issue.seedName.padEnd(30)} ${issue.detail}${tag}`);
  }

  // ── Write patched files ───────────────────────────────────────────────────

  if (applyFix && applyable.length > 0) {
    process.stdout.write("\n");
    const changedFiles = Array.from(new Set(applyable.map(i => i.filePath!)));
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
