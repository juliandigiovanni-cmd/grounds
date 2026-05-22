/**
 * Discovery script: finds specialty coffee candidates for a city not yet in our dataset.
 * Sources: Google Places Text Search + public web pulls from Sprudge, Eater, Timeout,
 * The Infatuation, and The Guardian. Results are ranked by how many sources agree on a
 * cafe, and featured_in is pre-populated from whichever publications mentioned it.
 *
 * Usage:
 *   npx tsx scripts/find-cafes.ts --city "Seoul"
 *   npx tsx scripts/find-cafes.ts --city "Seoul" --max 40
 *   npx tsx scripts/find-cafes.ts --city "Seoul" --sources google   # Places only
 *   npx tsx scripts/find-cafes.ts --city "Seoul" --sources pubs     # publications only
 *
 * After pasting stubs and filling editorial_blurb, brew_methods, vibe_tags:
 *   npx tsc --noEmit
 *   npx tsx scripts/fix-coords-places.ts --city "Seoul" --apply
 *   npx tsx scripts/audit-cafes.ts --city "Seoul" --apply
 *   npx tsx scripts/seed-supabase.ts
 *
 * API cost: ~3–13 Places calls per run (~$0.05–0.22)
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import { SEED_CAFES, SEED_CITIES } from "../lib/seed-data";
import type { FeaturedIn } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  website?: string;
  rating?: number;
}

export interface Candidate {
  name: string;
  slug: string;
  lat?: number;
  lng?: number;
  address?: string;
  placeId?: string;
  website?: string;
  rating?: number;
  pubSources: FeaturedIn[];
  source: "both" | "google" | "pubs";
}

export interface DiscoveryResult {
  candidates: Candidate[];
  alreadyHave: { name: string; slug: string }[];
  cityName: string;
  citySlug: string;
  country: string;
}

// ── Publications ──────────────────────────────────────────────────────────────

const PUBLICATIONS: { id: FeaturedIn; label: string; urls: (city: string, slug: string) => string[] }[] = [
  {
    id: "sprudge",
    label: "Sprudge",
    urls: (city, slug) => [
      `https://sprudge.com/tag/${slug}/`,
      `https://sprudge.com/?s=${encodeURIComponent(city + " coffee")}`,
    ],
  },
  {
    id: "eater",
    label: "Eater",
    urls: (_city, slug) => [
      `https://www.eater.com/maps/best-coffee-${slug}`,
      `https://www.eater.com/maps/best-coffee-shops-${slug}`,
    ],
  },
  {
    id: "infatuation",
    label: "The Infatuation",
    urls: (_city, slug) => [
      `https://www.theinfatuation.com/${slug}/guides/best-coffee-in-${slug}`,
      `https://www.theinfatuation.com/${slug}/guides/the-best-coffee-in-${slug}`,
    ],
  },
  {
    id: "timeout",
    label: "Time Out",
    urls: (_city, slug) => [
      `https://www.timeout.com/${slug}/coffee/best-coffee-shops-in-${slug}`,
      `https://www.timeout.com/${slug}/restaurants/best-coffee-shops-in-${slug}`,
    ],
  },
  {
    id: "guardian",
    label: "The Guardian",
    urls: (_city, slug) => [
      `https://www.theguardian.com/travel/series/10-of-the-best-coffee-shops-in-${slug}`,
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const COFFEE_STOPWORDS = new Set([
  "coffee", "cafe", "caf", "roasters", "roastery", "roasting", "espresso",
  "bar", "lab", "house", "shop", "the", "and", "for",
]);

export function makeWordOverlap(cityName: string) {
  const cityWords = new Set(
    cityName.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean)
  );
  const stopwords = new Set(Array.from(COFFEE_STOPWORDS).concat(Array.from(cityWords)));
  return function wordOverlap(a: string, b: string): boolean {
    const tokenize = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/)
        .filter(w => w.length > 2 && !stopwords.has(w));
    const setA = new Set(tokenize(a));
    for (const w of tokenize(b)) { if (setA.has(w)) return true; }
    return false;
  };
}

export function toSlug(name: string, citySlug: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()
    .replace(/\s+/g, "-").replace(/-+/g, "-") + "-" + citySlug;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── Google Places API ─────────────────────────────────────────────────────────

async function fetchPage(textQuery: string, pageToken?: string): Promise<{ places: PlaceResult[]; nextPageToken?: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");
  const body: Record<string, string> = { textQuery };
  if (pageToken) body.pageToken = pageToken;
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri,places.rating,places.businessStatus,nextPageToken",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Places API ${res.status}: ${await res.text()}`);
  const data = await res.json() as {
    places?: { id: string; displayName?: { text: string }; formattedAddress?: string; location?: { latitude: number; longitude: number }; websiteUri?: string; rating?: number; businessStatus?: string }[];
    nextPageToken?: string;
  };
  const places: PlaceResult[] = (data.places ?? [])
    .filter(p => p.displayName?.text && p.location && p.businessStatus !== "CLOSED_PERMANENTLY")
    .map(p => ({
      id: p.id,
      name: p.displayName!.text,
      address: p.formattedAddress ?? "",
      lat: p.location!.latitude,
      lng: p.location!.longitude,
      website: p.websiteUri,
      rating: p.rating,
    }));
  return { places, nextPageToken: data.nextPageToken };
}

async function searchOneCafe(name: string, cityName: string): Promise<PlaceResult | null> {
  try {
    const { places } = await fetchPage(`${name} ${cityName}`);
    const wordOverlap = makeWordOverlap(cityName);
    const match = places.find(p => wordOverlap(name, p.name));
    return match ?? null;
  } catch { return null; }
}

// ── Publication web fetch ─────────────────────────────────────────────────────

const NON_NAME_PATTERNS = [
  /^best\s/i, /^top\s/i, /^the\s+best/i, /guide/i, /^how\s/i, /^sign\s/i,
  /newsletter/i, /subscribe/i, /advertisement/i, /sponsored/i, /cookie/i,
  /privacy/i, /^read\s/i, /^see\s/i, /^get\s/i, /^load\s/i, /shops?$/i,
  /\bcoffee\s+in\b/i, /\bcafes?\s+in\b/i,
];

function extractCafeNames(html: string): string[] {
  const results: string[] = [];
  const tagRe = /<(?:h[23]|strong|li)[^>]*>([\s\S]*?)<\/(?:h[23]|strong|li)>/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#\d+;/g, "").trim();
    if (
      text.length >= 3 && text.length <= 60 &&
      /^[A-Z\d%#@']/.test(text) &&
      !text.includes(". ") &&
      text !== text.toUpperCase() &&
      !NON_NAME_PATTERNS.some(p => p.test(text))
    ) {
      results.push(text);
    }
  }
  return Array.from(new Set(results));
}

async function fetchPubNames(cityName: string, citySlug: string): Promise<Map<FeaturedIn, string[]>> {
  const results = new Map<FeaturedIn, string[]>();
  for (const pub of PUBLICATIONS) {
    const urls = pub.urls(cityName, citySlug);
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) continue;
        const html = await res.text();
        const names = extractCafeNames(html);
        if (names.length > 2) { // only trust if we got a meaningful list
          results.set(pub.id, names);
          process.stdout.write(` ${names.length} names\n`);
          break;
        }
      } catch { /* skip on timeout/error */ }
    }
    if (!results.has(pub.id)) process.stdout.write(` –\n`);
    await sleep(300);
  }
  return results;
}

// ── Core discovery ────────────────────────────────────────────────────────────

export async function discoverCafes(
  cityName: string,
  citySlug: string,
  country: string,
  opts: { maxResults?: number; sources?: "all" | "google" | "pubs"; queryOverride?: string } = {}
): Promise<DiscoveryResult> {
  const { maxResults = 40, sources = "all", queryOverride } = opts;
  const wordOverlap = makeWordOverlap(cityName);

  const existingPlaceIds = new Set(SEED_CAFES.filter(c => c.google_place_id).map(c => c.google_place_id!));
  const existingInCity = SEED_CAFES.filter(c => c.city.toLowerCase() === cityName.toLowerCase() && !c.permanently_closed);

  function isExisting(name: string, placeId?: string): { slug: string } | null {
    if (placeId && existingPlaceIds.has(placeId)) {
      const m = SEED_CAFES.find(c => c.google_place_id === placeId);
      return m ? { slug: m.slug } : null;
    }
    const m = existingInCity.find(c => wordOverlap(c.name, name));
    return m ? { slug: m.slug } : null;
  }

  // ── Step 1: Google Places search ──
  const googleResults: PlaceResult[] = [];
  if (sources !== "pubs") {
    const textQuery = queryOverride ? `${queryOverride} ${cityName}` : `specialty coffee ${cityName}`;
    let pageToken: string | undefined;
    let page = 0;
    while (googleResults.length < maxResults && page < 3) {
      if (page > 0) await sleep(2000);
      process.stdout.write(`  Google page ${page + 1}…`);
      const { places, nextPageToken } = await fetchPage(textQuery, pageToken);
      googleResults.push(...places);
      pageToken = nextPageToken;
      page++;
      process.stdout.write(` ${places.length} results\n`);
      if (!nextPageToken) break;
    }
  }

  // ── Step 2: Publication web fetch ──
  let pubNames = new Map<FeaturedIn, string[]>();
  if (sources !== "google") {
    console.log("\n  Fetching from publications…");
    for (const pub of PUBLICATIONS) {
      process.stdout.write(`    ${pub.label}…`);
    }
    process.stdout.write("\r"); // reset line
    for (const pub of PUBLICATIONS) {
      process.stdout.write(`    ${pub.label}…`);
    }
    pubNames = await fetchPubNames(cityName, citySlug);
  }

  // ── Step 3: Build candidate map from Google results ──
  const googleCandidates = new Map<string, { place: PlaceResult; pubSources: FeaturedIn[] }>();
  const alreadyHave: { name: string; slug: string }[] = [];

  for (const place of googleResults.slice(0, maxResults)) {
    const existing = isExisting(place.name, place.id);
    if (existing) { alreadyHave.push({ name: place.name, slug: existing.slug }); continue; }
    googleCandidates.set(place.id, { place, pubSources: [] });
  }

  // ── Step 4: Match pub names to Google results, collect unmatched ──
  const pubOnlyNames: { name: string; pubSources: FeaturedIn[] }[] = [];
  const pubNameToSources = new Map<string, FeaturedIn[]>();

  for (const [pubId, names] of Array.from(pubNames.entries())) {
    for (const name of names) {
      if (isExisting(name)) continue;

      // Try to match to a Google candidate
      const matched = Array.from(googleCandidates.values()).find(({ place }) => wordOverlap(name, place.name));
      if (matched) {
        matched.pubSources.push(pubId);
      } else {
        // Accumulate pub sources for this unmatched name
        const existing = pubNameToSources.get(name) ?? [];
        if (!existing.includes(pubId)) existing.push(pubId);
        pubNameToSources.set(name, existing);
      }
    }
  }

  // Collapse pub-only names (same cafe mentioned in multiple pubs)
  for (const [name, srcs] of Array.from(pubNameToSources.entries())) {
    const existing = isExisting(name);
    if (existing) { alreadyHave.push({ name, slug: existing.slug }); continue; }
    const dupe = pubOnlyNames.find(p => wordOverlap(p.name, name));
    if (dupe) { srcs.forEach((s: FeaturedIn) => { if (!dupe.pubSources.includes(s)) dupe.pubSources.push(s); }); }
    else pubOnlyNames.push({ name, pubSources: srcs });
  }

  // ── Step 5: Enrich pub-only names with Places lookup ──
  const enriched: Candidate[] = [];
  if (pubOnlyNames.length > 0 && sources !== "pubs") {
    console.log(`\n  Looking up coordinates for ${pubOnlyNames.length} pub-only candidates…`);
    for (const p of pubOnlyNames) {
      process.stdout.write(`    ${p.name}…`);
      const place = await searchOneCafe(p.name, cityName);
      await sleep(300);
      if (place && !isExisting(place.name, place.id)) {
        // Upgrade to 'both'
        process.stdout.write(` ✓ found\n`);
        enriched.push({
          name: place.name,
          slug: toSlug(place.name, citySlug),
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          placeId: place.id,
          website: place.website,
          rating: place.rating,
          pubSources: p.pubSources,
          source: "both",
        });
      } else {
        process.stdout.write(` – (no Places match)\n`);
        enriched.push({
          name: p.name,
          slug: toSlug(p.name, citySlug),
          pubSources: p.pubSources,
          source: "pubs",
        });
      }
    }
  } else {
    pubOnlyNames.forEach(p => enriched.push({ name: p.name, slug: toSlug(p.name, citySlug), pubSources: p.pubSources, source: "pubs" }));
  }

  // ── Step 6: Assemble final ranked candidate list ──
  const candidates: Candidate[] = [
    // 'both': Google + at least one pub
    ...Array.from(googleCandidates.values())
      .filter(({ pubSources }) => pubSources.length > 0)
      .map(({ place, pubSources }) => ({
        name: place.name, slug: toSlug(place.name, citySlug),
        lat: place.lat, lng: place.lng, address: place.address,
        placeId: place.id, website: place.website, rating: place.rating,
        pubSources, source: "both" as const,
      })),
    // 'both' from enriched pub-only names
    ...enriched.filter(c => c.source === "both"),
    // 'pubs' only (no Places match)
    ...enriched.filter(c => c.source === "pubs"),
    // 'google' only (not in any publication)
    ...Array.from(googleCandidates.values())
      .filter(({ pubSources }) => pubSources.length === 0)
      .map(({ place }) => ({
        name: place.name, slug: toSlug(place.name, citySlug),
        lat: place.lat, lng: place.lng, address: place.address,
        placeId: place.id, website: place.website, rating: place.rating,
        pubSources: [] as FeaturedIn[], source: "google" as const,
      })),
  ];

  return { candidates, alreadyHave, cityName, citySlug, country };
}

// ── Stub formatter (exported for grounds.ts) ──────────────────────────────────

export function formatStub(c: Candidate, cityName: string, country: string): string {
  const dateStr = todayStr();
  const sourceLabel = c.source === "both" ? "✦ BOTH" : c.source === "pubs" ? "★ PUBS" : "· GOOGLE";
  const ratingStr = c.rating != null ? `Rating: ${c.rating}` : "No rating";
  const lines: string[] = [];
  lines.push(`// ── ${sourceLabel}  ${c.name} (${cityName}) ${"─".repeat(Math.max(0, 44 - c.name.length - cityName.length))}`);
  if (c.pubSources.length > 0) lines.push(`// Sources: ${c.pubSources.join(", ")}  |  ${ratingStr}`);
  else lines.push(`// ${ratingStr}  |  Place ID: ${c.placeId ?? "?"}`);
  lines.push(`  {`);
  lines.push(`    name: "${c.name}",`);
  lines.push(`    slug: "${c.slug}",`);
  if (c.lat != null && c.lng != null) {
    lines.push(`    lat: ${c.lat.toFixed(4)}, lng: ${c.lng.toFixed(4)},`);
  } else {
    lines.push(`    lat: 0, lng: 0,  // ← FILL: look up coordinates manually`);
  }
  if (c.placeId) lines.push(`    google_place_id: "${c.placeId}",`);
  lines.push(`    city: "${cityName}", country: "${country}",`);
  if (c.address) lines.push(`    address: "${c.address}",`);
  else lines.push(`    address: "",  // ← FILL`);
  if (c.website) lines.push(`    website: "${c.website}",`);
  lines.push(`    // roaster: "...",                       // ← fill if they roast in-house`);
  lines.push(`    brew_methods: [],                        // ← FILL: ["espresso","pour-over",...]`);
  lines.push(`    vibe_tags: [],                           // ← FILL: ["minimalist","no-laptop",...]`);
  lines.push(`    // instagram_handle: "...",              // ← fill if known`);
  lines.push(`    editorial_blurb: "TODO",                 // ← FILL: 1–2 sentence hook`);
  const featuredInStr = c.pubSources.length > 0
    ? `["${c.pubSources.join('", "')}"]`
    : `[]  // ← FILL: ["sprudge","monocle",...]`;
  lines.push(`    featured_in: ${featuredInStr},`);
  lines.push(`    verified: true,`);
  lines.push(`    last_verified_at: "${dateStr}",`);
  lines.push(`    verification_source: "admin",`);
  lines.push(`  },`);
  return lines.join("\n");
}

// ── CLI entry point ───────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv;
  const getArg = (flag: string) => { const i = argv.indexOf(flag); return i !== -1 ? argv[i + 1] : null; };

  const cityArg = getArg("--city");
  if (!cityArg) {
    console.error('Usage: npx tsx scripts/find-cafes.ts --city "Seoul" [--max 40] [--sources all|google|pubs]');
    process.exit(1);
  }

  const cityRecord = SEED_CITIES.find(c => c.name.toLowerCase() === cityArg.toLowerCase());
  if (!cityRecord) {
    console.error(`City "${cityArg}" not found. Available: ${SEED_CITIES.map(c => c.name).join(", ")}`);
    process.exit(1);
  }

  const maxResults = parseInt(getArg("--max") ?? "40", 10);
  const sourcesRaw = getArg("--sources") ?? "all";
  const sources = (["all", "google", "pubs"].includes(sourcesRaw) ? sourcesRaw : "all") as "all" | "google" | "pubs";
  const queryOverride = getArg("--query") ?? undefined;

  console.log(`\nDiscovering cafés in ${cityRecord.name} (sources: ${sources})`);
  console.log(`Existing in dataset: ${SEED_CAFES.filter(c => c.city === cityRecord.name && !c.permanently_closed).length}\n`);

  const result = await discoverCafes(cityRecord.name, cityRecord.slug, cityRecord.country, { maxResults, sources, queryOverride });
  const { candidates, alreadyHave, cityName, country } = result;

  // ── Print ranked candidates ──
  const both = candidates.filter(c => c.source === "both");
  const pubs = candidates.filter(c => c.source === "pubs");
  const google = candidates.filter(c => c.source === "google");

  console.log(`\n${"═".repeat(72)}`);
  console.log(`  NEW CANDIDATES — ${cityName.toUpperCase()} (${candidates.length} total)`);
  console.log(`  ✦ Both sources: ${both.length}  ★ Pubs only: ${pubs.length}  · Google only: ${google.length}`);
  console.log(`${"═".repeat(72)}\n`);

  if (candidates.length === 0) {
    console.log("  All results already in dataset.\n");
  } else {
    for (const c of candidates) {
      console.log(formatStub(c, cityName, country));
      console.log();
    }
  }

  // ── Already have ──
  console.log(`${"─".repeat(72)}`);
  console.log(`  ALREADY IN DATASET (${alreadyHave.length})`);
  console.log(`${"─".repeat(72)}`);
  for (const a of alreadyHave) console.log(`  ✓ ${a.name.padEnd(36)}  ${a.slug}`);

  // ── Next steps ──
  if (candidates.length > 0) {
    console.log(`\n${"─".repeat(72)}`);
    console.log(`  NEXT STEPS`);
    console.log(`${"─".repeat(72)}`);
    console.log(`  1. Paste stubs into the right seed file, fill the ← FILL fields`);
    console.log(`  2. npx tsc --noEmit`);
    console.log(`  3. npx tsx scripts/fix-coords-places.ts --city "${cityName}" --apply`);
    console.log(`  4. npx tsx scripts/audit-cafes.ts --city "${cityName}" --apply`);
    console.log(`  5. npx tsx scripts/seed-supabase.ts`);
    console.log();
  }
}

// Only run when executed directly (not imported by grounds.ts)
const isEntryPoint = process.argv[1]?.endsWith("find-cafes.ts") || process.argv[1]?.endsWith("find-cafes.js");
if (isEntryPoint) {
  main().catch(err => { console.error(err); process.exit(1); });
}
