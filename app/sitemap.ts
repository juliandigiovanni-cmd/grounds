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

  const cityUrls = SEED_CITIES.map(city => ({
    url: `${BRAND_URL}/city/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    { url: BRAND_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BRAND_URL}/about/score`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BRAND_URL}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BRAND_URL}/advertise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...cityUrls,
    ...cafeUrls,
  ];
}
