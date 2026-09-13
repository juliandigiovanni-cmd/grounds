// One-off geocode for the two Europe additions (Gota Vienna, Tanat Paris).
// Usage: npx tsx --env-file=.env.local scripts/audit-geocode-additions.mts
const KEY = process.env.GOOGLE_PLACES_API_KEY!;
const FIELDS = "id,displayName,formattedAddress,location,businessStatus";
async function search(q: string) {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELDS.split(",").map(f => `places.${f}`).join(",") },
    body: JSON.stringify({ textQuery: q, pageSize: 3 }),
  });
  return (await r.json()).places ?? [];
}
const queries = [
  "Gota Coffee Experts, Mariahilfer Strasse 192, 1150 Wien, Austria",
  "Tanat, 36 Rue du Chateau d'Eau, 75010 Paris, France",
];
for (const q of queries) {
  const places = await search(q);
  console.log("QUERY:", q);
  for (const p of places) console.log(" ", p.displayName?.text, "|", p.formattedAddress, "|", JSON.stringify(p.location), "|", p.id, "|", p.businessStatus);
  console.log();
}
