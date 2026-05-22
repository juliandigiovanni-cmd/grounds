/**
 * Interactive cafe management orchestrator.
 * Combines discovery (Google Places + publication web pulls), seed file editing,
 * and the full verification pipeline in a single guided workflow.
 *
 * Usage:
 *   npx tsx scripts/grounds.ts
 *
 * Three modes:
 *   1. Add cafes to an existing city
 *   2. Add cafes to a NEW city
 *   3. Audit / verify an existing city
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { execSync } from "child_process";
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import { SEED_CAFES, SEED_CITIES } from "../lib/seed-data";
import { discoverCafes, formatStub, toSlug } from "./find-cafes";

const ROOT = path.join(__dirname, "..");

// ── Seed file config ──────────────────────────────────────────────────────────

const SEED_FILES = ["seed-na", "seed-europe", "seed-asia", "seed-latam", "seed-africa", "seed-oceania"];

const REGIONS = [
  { label: "Asia", file: "seed-asia", countries: ["japan","south korea","taiwan","singapore","vietnam","thailand","indonesia","india","china","hong kong","philippines","malaysia"] },
  { label: "Europe", file: "seed-europe", countries: ["united kingdom","france","germany","denmark","netherlands","spain","italy","switzerland","austria","sweden","portugal","norway","finland","ireland","belgium","greece","poland","czech republic","hungary"] },
  { label: "North America", file: "seed-na", countries: ["united states","canada","mexico"] },
  { label: "Latin America", file: "seed-latam", countries: ["brazil","argentina","peru","colombia","chile","ecuador","uruguay","bolivia"] },
  { label: "Africa", file: "seed-africa", countries: ["south africa","kenya","ethiopia","ghana","nigeria","rwanda","tanzania"] },
  { label: "Oceania", file: "seed-oceania", countries: ["australia","new zealand"] },
];

function countryToFile(country: string): string | null {
  const lower = country.toLowerCase();
  return REGIONS.find(r => r.countries.includes(lower))?.file ?? null;
}

function findSeedFileForCity(cityName: string): string {
  for (const file of SEED_FILES) {
    const fp = path.join(ROOT, `lib/${file}.ts`);
    if (fs.readFileSync(fp, "utf8").match(new RegExp(`city:\\s*"${cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "i"))) {
      return file;
    }
  }
  throw new Error(`Could not find seed file for city: ${cityName}`);
}

// ── Readline helpers ──────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string, defaultVal = ""): Promise<string> {
  const hint = defaultVal ? ` [${defaultVal}]` : "";
  return new Promise(resolve =>
    rl.question(`${question}${hint}: `, ans => resolve(ans.trim() || defaultVal))
  );
}

async function pickFromList<T>(prompt: string, items: T[], label: (t: T) => string): Promise<T> {
  console.log(`\n${prompt}`);
  items.forEach((item, i) => console.log(`  ${String(i + 1).padStart(2)}. ${label(item)}`));
  while (true) {
    const input = await ask("Enter number");
    const n = parseInt(input, 10);
    if (n >= 1 && n <= items.length) return items[n - 1];
    console.log(`  Please enter a number between 1 and ${items.length}`);
  }
}

async function confirm(question: string): Promise<boolean> {
  const ans = await ask(`${question} [y/N]`);
  return ans.toLowerCase().startsWith("y");
}

// ── Pipeline runner ───────────────────────────────────────────────────────────

function run(cmd: string, label: string): boolean {
  console.log(`\n▸ ${label}…`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT });
    console.log(`  ✓ Done`);
    return true;
  } catch {
    console.error(`  ✗ Failed — see errors above`);
    return false;
  }
}

function openInVSCode(filePath: string, line?: number) {
  const target = line ? `${filePath}:${line}` : filePath;
  try { execSync(`code --goto "${target}"`); }
  catch { console.log(`  Open manually: ${target}`); }
}

// ── Seed file editing ─────────────────────────────────────────────────────────

function appendStubsToCity(seedFile: string, cityName: string, stubs: string): number {
  const filePath = path.join(ROOT, `lib/${seedFile}.ts`);
  let content = fs.readFileSync(filePath, "utf8");

  const escaped = cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headerRe = new RegExp(`//\\s*(?:──\\s*)?${escaped}`, "i");
  const headerMatch = headerRe.exec(content);
  if (!headerMatch) throw new Error(`City section header not found for "${cityName}" in ${seedFile}.ts`);

  const afterHeader = headerMatch.index + headerMatch[0].length;
  const nextHeader = content.indexOf("\n  // ──", afterHeader);
  const arrayClose = content.indexOf("\n];", afterHeader);
  const insertPos = nextHeader !== -1 ? nextHeader : arrayClose;
  if (insertPos === -1) throw new Error("Could not find section end in seed file");

  const before = content.slice(0, insertPos);
  content = before + "\n\n" + stubs + content.slice(insertPos);
  fs.writeFileSync(filePath, content);
  return before.split("\n").length + 2;
}

function countTodos(seedFile: string, cityName: string): number {
  const content = fs.readFileSync(path.join(ROOT, `lib/${seedFile}.ts`), "utf8");
  const escaped = cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headerRe = new RegExp(`//\\s*(?:──\\s*)?${escaped}`, "i");
  const start = headerRe.exec(content)?.index ?? 0;
  const next = content.indexOf("\n  // ──", start + 1);
  const section = content.slice(start, next === -1 ? undefined : next);
  return (section.match(/editorial_blurb: "TODO"/g) ?? []).length;
}

// ── Google Places geocoding (for new city) ────────────────────────────────────

async function geocodeCity(cityName: string, country: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.location,places.displayName",
      },
      body: JSON.stringify({ textQuery: `${cityName} ${country}` }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { places?: { location?: { latitude: number; longitude: number } }[] };
    const loc = data.places?.[0]?.location;
    return loc ? { lat: loc.latitude, lng: loc.longitude } : null;
  } catch { return null; }
}

// ── Shared: run discovery + append stubs ─────────────────────────────────────

async function runDiscoveryAndAppend(
  cityName: string,
  citySlug: string,
  country: string,
  seedFile: string,
  maxResults: number
): Promise<void> {
  console.log(`\nSearching for new cafés in ${cityName}…`);
  const result = await discoverCafes(cityName, citySlug, country, { maxResults, sources: "all" });
  const { candidates, alreadyHave } = result;

  const both = candidates.filter(c => c.source === "both").length;
  const pubs = candidates.filter(c => c.source === "pubs").length;
  const google = candidates.filter(c => c.source === "google").length;

  console.log(`\n  Found ${candidates.length} new candidates`);
  console.log(`  ✦ Both sources: ${both}  ★ Pubs only: ${pubs}  · Google only: ${google}`);
  console.log(`  Already in dataset: ${alreadyHave.length}`);

  if (candidates.length === 0) {
    console.log("\n  No new candidates found. Nothing to append.");
    return;
  }

  // Format all stubs
  const stubs = candidates.map(c => formatStub(c, cityName, country)).join("\n\n");

  // Append to seed file
  const lineNum = appendStubsToCity(seedFile, cityName, stubs);
  const relPath = `lib/${seedFile}.ts`;
  console.log(`\n  ✓ ${candidates.length} stubs appended to ${relPath} (line ~${lineNum})`);
  console.log(`\n  Opening in VS Code…`);
  openInVSCode(path.join(ROOT, relPath), lineNum);

  console.log(`
  ┌─────────────────────────────────────────────────────────────────┐
  │  In VS Code:                                                    │
  │  • Keep any cafés you want to add — fill in:                   │
  │      brew_methods, vibe_tags, editorial_blurb                  │
  │      (featured_in is pre-filled where found in publications)   │
  │  • Delete the entire block for any you don't want              │
  │  • Save the file when done                                      │
  └─────────────────────────────────────────────────────────────────┘`);

  await ask("\nPress Enter when you've saved the file");

  const remaining = countTodos(seedFile, cityName);
  if (remaining > 0) {
    console.log(`\n  ⚠  ${remaining} stub(s) still have editorial_blurb: "TODO" — they'll fail the type check.`);
    const proceed = await confirm("Continue anyway?");
    if (!proceed) { console.log("  Aborting — fix the stubs and re-run."); return; }
  }
}

// ── Shared: run verification pipeline ────────────────────────────────────────

function runPipeline(cityName: string) {
  run("npx tsc --noEmit", "TypeScript check");
  run(`npx tsx scripts/fix-coords-places.ts --city "${cityName}" --apply`, `Fix coordinates (${cityName})`);
  run(`npx tsx scripts/audit-cafes.ts --city "${cityName}" --apply`, `Audit cafés (${cityName})`);
  run("npx tsx scripts/seed-supabase.ts", "Sync to Supabase");
  console.log(`\n  ✓ All done for ${cityName}!`);
}

// ── Mode 1: Add cafes to existing city ───────────────────────────────────────

async function addCafesToExistingCity() {
  const cityRecord = await pickFromList(
    "Which city?",
    SEED_CITIES,
    c => `${c.name}, ${c.country}  (${c.cafe_count} cafés)`
  );

  const maxStr = await ask("Max candidates to fetch", "40");
  const maxResults = parseInt(maxStr, 10) || 40;

  let seedFile: string;
  try { seedFile = findSeedFileForCity(cityRecord.name); }
  catch (e) { console.error(`\n  Error: ${(e as Error).message}`); return; }

  await runDiscoveryAndAppend(cityRecord.name, cityRecord.slug, cityRecord.country, seedFile, maxResults);
  runPipeline(cityRecord.name);
}

// ── Mode 2: Add cafes to a NEW city ──────────────────────────────────────────

async function addCafesToNewCity() {
  const cityName = await ask("City name (e.g. Kyoto)");
  if (!cityName) { console.log("  Cancelled."); return; }

  const country = await ask("Country (e.g. Japan)");
  if (!country) { console.log("  Cancelled."); return; }

  // Auto-detect region from country
  let seedFile = countryToFile(country);
  if (!seedFile) {
    const region = await pickFromList("Which region does this city belong to?", REGIONS, r => r.label);
    seedFile = region.file;
  } else {
    const detected = REGIONS.find(r => r.file === seedFile)!;
    console.log(`  Region auto-detected: ${detected.label} (${seedFile}.ts)`);
    const ok = await confirm("  Is that correct?");
    if (!ok) {
      const region = await pickFromList("Choose region", REGIONS, r => r.label);
      seedFile = region.file;
    }
  }

  // Auto-derive slug
  const rawSlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slugInput = await ask("City slug", rawSlug);
  const citySlug = slugInput || rawSlug;

  // Check no duplicate
  if (SEED_CITIES.find(c => c.slug === citySlug)) {
    console.error(`  City slug "${citySlug}" already exists in SEED_CITIES. Use Mode 1 instead.`);
    return;
  }

  // Geocode
  console.log(`\n  Looking up coordinates for ${cityName}, ${country}…`);
  const geo = await geocodeCity(cityName, country);
  let lat: number, lng: number;
  if (geo) {
    console.log(`  Found: lat ${geo.lat.toFixed(4)}, lng ${geo.lng.toFixed(4)}`);
    const ok = await confirm("  Use these coordinates?");
    if (ok) { lat = geo.lat; lng = geo.lng; }
    else {
      const manual = await ask("Enter lat,lng (e.g. 35.0116,135.7681)");
      [lat, lng] = manual.split(",").map(Number);
    }
  } else {
    console.log("  Could not auto-detect — please enter manually.");
    const manual = await ask("Enter lat,lng (e.g. 35.0116,135.7681)");
    [lat, lng] = manual.split(",").map(Number);
  }

  // City blurb
  console.log("\n  Write a 1–2 sentence editorial blurb about this city's coffee scene.");
  console.log("  (Press Enter to leave a placeholder and fill it in seed-data.ts later.)");
  const blurb = await ask("City blurb");
  const finalBlurb = blurb || `TODO: Add city blurb for ${cityName} in lib/seed-data.ts`;

  // Insert into RAW_CITIES in seed-data.ts
  const nextId = SEED_CITIES.length + 1;
  const seedDataPath = path.join(ROOT, "lib/seed-data.ts");
  let seedDataContent = fs.readFileSync(seedDataPath, "utf8");
  const newEntry = `  { id: 'city-${nextId}', name: '${cityName}', country: '${country}', lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}, slug: '${citySlug}', city_blurb: '${finalBlurb.replace(/'/g, "\\'")}' },`;
  // Insert before the closing ]; of RAW_CITIES
  const rawCitiesClose = seedDataContent.lastIndexOf("\n];");
  if (rawCitiesClose === -1) throw new Error("Could not find RAW_CITIES closing ]; in seed-data.ts");
  seedDataContent = seedDataContent.slice(0, rawCitiesClose) + "\n" + newEntry + seedDataContent.slice(rawCitiesClose);
  fs.writeFileSync(seedDataPath, seedDataContent);
  console.log(`\n  ✓ Added ${cityName} (city-${nextId}) to RAW_CITIES in seed-data.ts`);

  // Add new city section to seed file
  const seedFilePath = path.join(ROOT, `lib/${seedFile}.ts`);
  let seedFileContent = fs.readFileSync(seedFilePath, "utf8");
  const bar = "─".repeat(Math.max(0, 72 - cityName.length));
  const newSection = `\n  // ── ${cityName.toUpperCase()} (0) ${bar}\n`;
  const arrayClose = seedFileContent.lastIndexOf("\n];");
  if (arrayClose === -1) throw new Error(`Could not find ]; in ${seedFile}.ts`);
  seedFileContent = seedFileContent.slice(0, arrayClose) + newSection + seedFileContent.slice(arrayClose);
  fs.writeFileSync(seedFilePath, seedFileContent);
  console.log(`  ✓ Added city section header to lib/${seedFile}.ts`);

  // Discover and append stubs
  const maxStr = await ask("\nMax candidates to fetch", "40");
  const maxResults = parseInt(maxStr, 10) || 40;
  await runDiscoveryAndAppend(cityName, citySlug, country, seedFile, maxResults);

  // Open seed-data.ts too if blurb was a placeholder
  if (finalBlurb.startsWith("TODO")) {
    console.log("\n  Opening seed-data.ts so you can fill in the city blurb…");
    openInVSCode(seedDataPath);
    await ask("Press Enter when you've saved seed-data.ts");
  }

  runPipeline(cityName);
}

// ── Mode 3: Audit existing city ───────────────────────────────────────────────

async function auditExistingCity() {
  const cityRecord = await pickFromList(
    "Which city to audit?",
    SEED_CITIES,
    c => `${c.name}, ${c.country}  (${c.cafe_count} cafés)`
  );

  console.log(`\n  Running full audit for ${cityRecord.name}…`);
  run(`npx tsx scripts/fix-coords-places.ts --city "${cityRecord.name}" --apply`, `Fix coordinates (${cityRecord.name})`);
  run(`npx tsx scripts/audit-cafes.ts --city "${cityRecord.name}" --apply`, `Audit open/closed & websites`);
  run("npx tsx scripts/seed-supabase.ts", "Sync to Supabase");
  console.log(`\n  ✓ Audit complete for ${cityRecord.name}`);
}

// ── Main menu ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n  ┌───────────────────────────────────┐");
  console.log("  │  Grounds — Cafe Manager           │");
  console.log("  └───────────────────────────────────┘\n");

  const MODES = [
    { label: "Add cafes to an existing city", fn: addCafesToExistingCity },
    { label: "Add cafes to a NEW city", fn: addCafesToNewCity },
    { label: "Audit / verify an existing city", fn: auditExistingCity },
  ];

  const mode = await pickFromList("What would you like to do?", MODES, m => m.label);
  console.log();
  await mode.fn();
  rl.close();
}

main().catch(err => { console.error(err); rl.close(); process.exit(1); });
