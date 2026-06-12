import { MetadataRoute } from "next";
import { SEED_CAFES, SEED_CITIES } from "@/lib/seed-data";
import { BRAND_URL } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const cafeUrls = SEED_CAFES.map(cafe => ({
    url: `${BRAND_URL}/cafe/${cafe.slug}`,
    lastModified: cafe.last_verified_at ? new Date(cafe.last_verified_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const CITY_LIST_UPDATED = new Date("2026-05-16");
  const cityUrls = SEED_CITIES.map(city => ({
    url: `${BRAND_URL}/city/${city.slug}`,
    lastModified: CITY_LIST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const STATIC_UPDATED = new Date("2026-05-16");
  return [
    { url: BRAND_URL, lastModified: STATIC_UPDATED, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BRAND_URL}/about`, lastModified: STATIC_UPDATED, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BRAND_URL}/about/score`, lastModified: STATIC_UPDATED, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BRAND_URL}/submit`, lastModified: STATIC_UPDATED, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BRAND_URL}/advertise`, lastModified: STATIC_UPDATED, changeFrequency: "monthly" as const, priority: 0.5 },
    ...cityUrls,
    ...cafeUrls,
  ];
}
