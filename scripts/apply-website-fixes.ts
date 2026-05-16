/**
 * Apply verified website fixes to seed files.
 * Each entry was manually reviewed from the audit-cafes.ts output.
 * Safe criteria: genuine domain changes (rebrand, TLD change, local domain).
 * Skipped: UTM params, wrong-company matches, Instagram/Facebook links, location-path appends.
 *
 * Usage: npx tsx scripts/apply-website-fixes.ts
 */

import * as fs from "fs";
import * as path from "path";

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
    patched = win.replace(/(editorial_blurb:)/, `website: "${newWebsite}",\n    $1`);
  }

  if (patched === win) return false;
  fileContents.set(filePath, content.slice(0, slugIdx) + patched + content.slice(entryEnd));
  return true;
}

// ── Verified website fixes ────────────────────────────────────────────────────
// Format: [slug, new_website, description]

const FIXES: [string, string, string][] = [
  // Amsterdam
  ["bocca-coffee-amsterdam", "https://www.bocca.nl/", "Bocca Coffee → bocca.nl (rebranded short domain)"],

  // Auckland
  ["mojo-coffee-queen-street", "https://mojo.coffee/", "Mojo Coffee NZ → mojo.coffee"],
  ["eighthirty-auckland", "https://www.eighthirty.com/", "Eighthirty → eighthirty.com"],
  ["eighthirty-ponsonby", "https://www.eighthirty.com/", "Eighthirty Ponsonby → eighthirty.com"],

  // Chicago
  ["colectivo-coffee-chicago-lincoln-park", "https://colectivo.com/", "Colectivo rebranded to colectivo.com"],
  ["gaslight-coffee-roasters-chicago", "https://www.gaslightcoffee.com/", "Gaslight → gaslightcoffee.com"],

  // Ho Chi Minh City
  ["shin-coffee-hcmc", "https://shincaphe.com/", "Shin Coffee → shincaphe.com (.vn → .com)"],

  // Istanbul
  ["petra-roasting-istanbul", "https://www.petracoffee.com/", "Petra Roasting → petracoffee.com (drop /en/)"],

  // London
  ["dose-espresso-london", "https://www.dose.london/", "Dose Espresso → dose.london"],
  ["square-mile-london", "https://www.squaremilecoffee.com/", "Square Mile → squaremilecoffee.com (drop shop subdomain)"],
  ["square-mile-coffee-bar", "https://www.squaremilecoffee.com/", "Square Mile Coffee Bar → squaremilecoffee.com"],

  // Mexico City
  ["tierra-garat-polanco", "https://www.tierragarat.mx/", "Tierra Garat → tierragarat.mx (.com.mx → .mx)"],

  // Nashville
  ["crema-coffee-nashville", "https://www.cremacoffeeroasters.com/", "Crema Nashville → cremacoffeeroasters.com"],

  // New York City
  ["sey-coffee-bushwick", "https://sey.coffee/", "Sey Coffee → sey.coffee (new TLD)"],
  ["joe-coffee-west-village", "https://joecoffeecompany.com/", "Joe Coffee rebranded to joecoffeecompany.com"],
  ["joe-coffee-columbia-nyc", "https://joecoffeecompany.com/", "Joe Coffee Columbia → joecoffeecompany.com"],
  ["joe-coffee-upper-west-side-nyc", "https://joecoffeecompany.com/", "Joe Coffee UWS → joecoffeecompany.com"],

  // Osaka
  ["mel-coffee-roasters-osaka", "https://mel-coffee.jp/", "Mel Coffee → mel-coffee.jp (Japan domain)"],
  ["fuglen-osaka", "https://fuglencoffee.jp/", "Fuglen Osaka → fuglencoffee.jp"],

  // Paris
  ["cafe-lomi-paris", "https://lomi.cafe/", "Café Lomi → lomi.cafe"],
  ["cafe-lomi-canal", "https://lomi.cafe/", "Café Lomi Canal → lomi.cafe"],

  // Portland
  ["never-coffee-lab-portland", "https://www.nevercoffeelab.com/", "Never Coffee Lab → nevercoffeelab.com"],

  // San Francisco
  ["ritual-coffee-hayes-valley", "https://ritualcoffee.com/", "Ritual Coffee → ritualcoffee.com"],
  ["ritual-coffee-valencia-sf", "https://ritualcoffee.com/", "Ritual Coffee Valencia → ritualcoffee.com"],
  ["ritual-coffee-castro-sf", "https://ritualcoffee.com/", "Ritual Coffee Castro → ritualcoffee.com"],

  // Seoul
  ["fritz-coffee-seoul", "https://fritz.co.kr/", "Fritz Coffee → fritz.co.kr"],
  ["fritz-coffee-yangjae", "https://fritz.co.kr/", "Fritz Coffee Yangjae → fritz.co.kr"],
  ["namusairo-seoul", "https://www.namusairo.com/", "Namusairo → namusairo.com (drop en subdomain)"],
  ["namusairo-gahoe-dong", "https://www.namusairo.com/", "Namusairo Gahoe-dong → namusairo.com"],
  ["lowkey-coffee-seongsu", "https://www.lowkeycoffee.com/", "Lowkey Coffee → lowkeycoffee.com (.co.kr → .com)"],
  ["felt-coffee-seoul", "https://www.feltcoffee.com/", "Felt Coffee → feltcoffee.com (drop en subdomain)"],
  ["the-barn-seoul", "https://thebarnberlin.kr/", "The Barn Seoul → thebarnberlin.kr (Korean domain)"],
  ["southside-parlor-seoul", "https://ssp448.com/", "Southside Parlor → ssp448.com"],

  // Singapore
  ["nylon-coffee-singapore", "https://nylon.coffee/", "Nylon Coffee → nylon.coffee (new TLD)"],
  ["dutch-colony-coffee-chip-bee", "https://www.dutchcolony.sg/", "Dutch Colony → dutchcolony.sg (local domain)"],
  ["dutch-colony-coffee-fusionopolis", "https://www.dutchcolony.sg/", "Dutch Colony Fusionopolis → dutchcolony.sg"],
  ["oriole-coffee-bar-singapore", "https://www.oriole.com.sg/", "Oriole Coffee → oriole.com.sg (add website)"],

  // Stockholm
  ["johan-nystrom-stockholm", "https://johanochnystrom.se/", "Johan & Nyström → .se domain"],
  ["lykke-coffee-stockholm", "https://www.lykkenytorget.se/", "Lykke Coffee → lykkenytorget.se (add website)"],

  // Sydney
  ["mecca-espresso-melbourne", "https://www.mecca.coffee/", "Mecca Coffee → mecca.coffee"],
  ["mecca-coffee-surry-hills", "https://www.mecca.coffee/", "Mecca Coffee Surry Hills → mecca.coffee"],
  ["mecca-coffee-rosebery", "https://www.mecca.coffee/", "Mecca Coffee Rosebery → mecca.coffee"],
  ["ona-coffee-sydney", "https://www.onacoffeesydney.com/", "ONA Coffee Sydney → onacoffeesydney.com"],
  ["ona-coffee-melbourne", "https://onacoffee.com.au/", "ONA Coffee Melbourne → keep onacoffee.com.au"],

  // Tokyo
  ["paul-bassett-shinjuku", "https://www.paulbassett.jp/", "Paul Bassett → paulbassett.jp (Japan domain)"],
  ["verve-coffee-tokyo", "https://vervecoffee.jp/", "Verve Coffee Tokyo → vervecoffee.jp"],
  ["single-o-hamacho", "https://singleo.jp/", "Single O Japan → singleo.jp"],
  ["fuglen-tokyo", "https://fuglencoffee.jp/", "Fuglen Tokyo → fuglencoffee.jp"],
  ["fuglen-tokyo-asakusa", "https://fuglencoffee.jp/", "Fuglen Asakusa → fuglencoffee.jp"],

  // Toronto
  ["reunion-island-coffee-toronto", "https://reunioncoffeeroasters.com/", "Reunion Island → reunioncoffeeroasters.com"],
  ["hale-coffee-toronto", "https://www.halecoffee.com/", "Hale Coffee → halecoffee.com (.ca → .com)"],

  // Vancouver
  ["prado-cafe-vancouver", "https://pradocafe.com/", "Prado Café → pradocafe.com"],

  // São Paulo
  ["lucca-cafes-sao-paulo", "https://luccacafesespeciais.com.br/", "Lucca Cafés → luccacafesespeciais.com.br"],

  // London (add website)
  ["host-coffee-london", "https://www.hostcafelondon.com/", "Host Coffee → hostcafelondon.com (add website)"],

  // Istanbul (add website)
  ["coffeetopia-cihangir", "https://www.coffeetopia.com.tr/", "Coffeetopia → coffeetopia.com.tr (add website)"],

  // Lisbon (add websites)
  ["garagem-lisboa", "http://www.garagemlisboa.com/", "Garagem Lisboa → garagemlisboa.com (add website)"],
  ["delta-coffee-house-experience-lisbon", "https://deltacoffeehouse.com/", "Delta Coffee House → deltacoffeehouse.com (add website)"],

  // Montreal (add websites)
  ["cafe-neve-montreal", "http://www.cafeneve.com/", "Café Névé → cafeneve.com (add website)"],
  ["pikolo-espresso-bar-montreal", "https://pikoloespresso.com/", "Pikolo Espresso → pikoloespresso.com (add website)"],

  // Minneapolis (add website)
  ["five-watt-coffee-minneapolis", "http://www.fivewattcoffee.com/", "Five Watt Coffee → fivewattcoffee.com (add website)"],

  // New York City (add website)
  ["cafe-regular-brooklyn-heights-nyc", "http://www.caferegular.com/", "Cafe Regular → caferegular.com (add website)"],

  // Portland (add website)
  ["cellar-door-coffee-portland", "http://www.cellardoorcoffee.com/", "Cellar Door Coffee → cellardoorcoffee.com (add website)"],

  // Los Angeles (add websites)
  ["funnel-mill-coffee-santa-monica", "http://www.funnelmill.com/", "Funnel Mill → funnelmill.com (add website)"],
  ["bar-nine-coffee-culver-city", "http://www.barnine.us/", "Bar Nine Coffee → barnine.us (add website)"],

  // Melbourne (add website)
  ["little-mule-coffee-melbourne", "http://thelittlemulecafe.com/", "Little Mule Coffee → thelittlemulecafe.com (add website)"],

  // Wellington (add website)
  ["midnight-espresso-wellington", "https://midnightespresso.shop/", "Midnight Espresso → midnightespresso.shop (add website)"],

  // Tokyo (add website)
  ["arise-coffee-tokyo", "http://arisecoffee.jp/", "Arise Coffee → arisecoffee.jp (add website)"],
];

// ── Main ──────────────────────────────────────────────────────────────────────

let applied = 0;
let failed = 0;

for (const [slug, newWebsite, desc] of FIXES) {
  const filePath = findSeedFile(slug);
  if (!filePath) {
    console.log(`  NOT FOUND   ${slug}`);
    failed++;
    continue;
  }
  const ok = patchWebsite(filePath, slug, newWebsite);
  if (ok) {
    console.log(`  ✓ applied   ${slug}`);
    applied++;
  } else {
    console.log(`  ✗ no change ${slug}  (${desc})`);
  }
}

// Write changed files
const changedFiles = Array.from(fileContents.keys());
let writeErrors = 0;
for (const filePath of changedFiles) {
  const original = fs.readFileSync(filePath, "utf8");
  if (original !== fileContents.get(filePath)!) {
    try {
      fs.writeFileSync(filePath, fileContents.get(filePath)!);
      console.log(`\nWrote ${path.basename(filePath)}`);
    } catch (err) {
      console.error(`Failed to write ${filePath}:`, err);
      writeErrors++;
    }
  }
}

console.log(`\n✓ ${applied} applied, ${failed} not found`);
if (writeErrors === 0 && applied > 0) {
  console.log("Next: npx tsx scripts/seed-supabase.ts");
}
