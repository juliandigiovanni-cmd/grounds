/**
 * Google Places API wrapper.
 * IMPORTANT — Google Places ToS compliance:
 * - Coordinates, names, hours: cacheable in Supabase (permitted)
 * - Reviews text: DO NOT cache locally. Fetch and display only at request time.
 * - Place photos: serve via Google's photo API URL, do not download/store
 * See: https://developers.google.com/maps/documentation/places/web-service/policies
 */

export async function fetchPlaceDetails(placeId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");

  // Only request fields that are cacheable
  const fields = "name,formatted_address,geometry,opening_hours,business_status,website,formatted_phone_number";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h — permitted for non-review data
  if (!res.ok) throw new Error(`Google Places error: ${res.status}`);
  return res.json();
}

// DO NOT cache reviews — fetch at request time only
export async function fetchPlaceReviews(placeId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" }); // Never cache reviews per ToS
  if (!res.ok) throw new Error(`Google Places error: ${res.status}`);
  return res.json();
}

export async function checkBusinessStatus(placeId: string): Promise<"OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY"> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return "OPERATIONAL";

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=business_status&key=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return "OPERATIONAL";
  const data = await res.json();
  return data.result?.business_status ?? "OPERATIONAL";
}
