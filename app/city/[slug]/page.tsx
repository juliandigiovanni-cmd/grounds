import { SEED_CITIES, SEED_CAFES } from "@/lib/seed-data";
import { BRAND_NAME } from "@/lib/brand";
import { CafeCard } from "@/components/cafe/CafeCard";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateStaticParams() {
  return SEED_CITIES.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const city = SEED_CITIES.find(c => c.slug === params.slug);
  if (!city) return {};
  return {
    title: `Best 3rd Wave Coffee in ${city.name} | ${BRAND_NAME}`,
    description: city.city_blurb,
    openGraph: {
      images: [{
        url: `/api/og?title=${encodeURIComponent(`Best Coffee in ${city.name}`)}&subtitle=${encodeURIComponent(city.city_blurb.slice(0, 60))}&city=${encodeURIComponent(city.name)}`,
        width: 1200,
        height: 630,
      }],
    },
  };
}

export default function CityPage({ params }: { params: { slug: string } }) {
  const city = SEED_CITIES.find(c => c.slug === params.slug);
  if (!city) return <div className="p-8">City not found</div>;
  const cafes = SEED_CAFES.filter(c => c.city.toLowerCase().replace(/\s+/g, "-") === params.slug || c.city.toLowerCase() === city.name.toLowerCase())
    .sort((a, b) => (b.third_wave_score ?? 0) - (a.third_wave_score ?? 0));

  return (
    <div className="min-h-screen bg-grounds-cream">
      <header className="bg-grounds-espresso text-grounds-cream px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-grounds-cream/70 hover:text-grounds-cream">← Map</Link>
        <h1 className="font-serif text-xl font-bold">{city.name}</h1>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="font-serif text-3xl font-bold text-grounds-espresso mb-2">{city.name}</h2>
        <p className="text-grounds-brown/70 mb-6">{city.city_blurb}</p>
        <h3 className="font-semibold text-grounds-espresso mb-4">Top Cafés ({cafes.length})</h3>
        <div className="space-y-2">
          {cafes.map(cafe => (
            <div key={cafe.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <CafeCard cafe={cafe} />
            </div>
          ))}
        </div>
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm">
          <h3 className="font-semibold text-grounds-espresso mb-2">Further Reading</h3>
          <p className="text-sm text-grounds-brown/60 mb-3">For long-form city guides and journalism, we recommend:</p>
          <a href={`https://sprudge.com/tag/${city.name.toLowerCase().replace(/\s+/g, "-")}`}
            target="_blank" rel="noopener noreferrer"
            className="text-grounds-gold hover:underline text-sm flex items-center gap-1">
            Sprudge: {city.name} Guide ↗
          </a>
          {cafes.some(c => c.featured_in.includes("standart")) && (
            <a href="https://standartmag.com/" target="_blank" rel="noopener noreferrer"
              className="text-grounds-gold hover:underline text-sm flex items-center gap-1 mt-2">
              Standart Magazine features ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
