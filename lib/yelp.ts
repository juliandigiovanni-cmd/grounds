/**
 * Yelp Fusion API wrapper.
 * IMPORTANT — Yelp Fusion ToS compliance:
 * - Reviews MUST NOT be stored in Supabase or any local database.
 * - Always fetch at request time and display with Yelp branding.
 * - Must include a link back to the Yelp listing on all displayed data.
 * - Yelp logo must accompany any Yelp data.
 * See: https://www.yelp.com/developers/api_terms
 */

export interface YelpReview {
  id: string;
  text: string;
  rating: number;
  time_created: string;
  user: { name: string; image_url: string };
  url: string;
}

export async function fetchYelpReviews(businessId: string): Promise<YelpReview[]> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) return [];

  // Never cache Yelp reviews — ToS requirement
  const res = await fetch(`https://api.yelp.com/v3/businesses/${businessId}/reviews`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.reviews ?? [];
}

export async function fetchYelpBusiness(businessId: string) {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`https://api.yelp.com/v3/businesses/${businessId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store", // Do not cache Yelp data
  });
  if (!res.ok) return null;
  return res.json();
}
