// Find Supabase cafe rows whose slug no longer exists in local seed data (i.e. removed by an audit
// but never synced). Prints the list; pass --delete to actually delete them.
// Usage: npx tsx --env-file=.env.local scripts/audit-supabase-diff.mts [--delete]
import { createClient } from "@supabase/supabase-js";
import { SEED_CAFES } from "../lib/seed-data";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const localSlugs = new Set((SEED_CAFES as any[]).map(c => c.slug));

const { data, error } = await supabase.from("cafes").select("slug, name, city");
if (error) { console.error(error.message); process.exit(1); }

const stale = (data ?? []).filter(r => !localSlugs.has(r.slug));
console.log(`Supabase has ${data?.length} cafes; local seed has ${localSlugs.size}; stale (in Supabase, not local): ${stale.length}`);
for (const r of stale) console.log(`  ${r.slug.padEnd(40)} ${r.name} (${r.city})`);

if (process.argv.includes("--delete") && stale.length) {
  const { error: delErr, count } = await supabase.from("cafes").delete({ count: "exact" }).in("slug", stale.map(r => r.slug));
  console.log(delErr ? `ERROR: ${delErr.message}` : `Deleted ${count} stale cafes from Supabase`);
}
