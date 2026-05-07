"use client";

import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { SEED_CAFES } from "@/lib/seed-data";
import Link from "next/link";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";

// Mock top contributors — in production this comes from Supabase
const TOP_CONTRIBUTORS = [
  { name: "kopfsteinpflaster", submissions: 12, cities: ["Berlin", "Vienna", "Prague"] },
  { name: "flat_white_pilgrim", submissions: 9, cities: ["Melbourne", "Tokyo", "Seoul"] },
  { name: "arabica.wanderer", submissions: 7, cities: ["Copenhagen", "Oslo", "Stockholm"] },
  { name: "brewer_roamer", submissions: 6, cities: ["NYC", "Montreal", "London"] },
  { name: "third_wave_nomad", submissions: 5, cities: ["Portland", "Cape Town", "Buenos Aires"] },
];

export default function AboutPage() {
  const totalCafes = SEED_CAFES.length;
  const cityCount = new Set(SEED_CAFES.map(c => c.city)).size;

  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-grounds-gold hover:underline text-sm mb-8 block">← Map</Link>

        <h1 className="font-serif text-4xl font-bold text-grounds-espresso mb-4">{BRAND_NAME}</h1>
        <p className="text-xl text-grounds-brown/70 mb-12">{BRAND_TAGLINE}</p>

        {/* Mission */}
        <div className="prose max-w-none mb-12">
          <p className="text-grounds-brown leading-relaxed mb-4">
            Grounds is a map-first travel companion for serious coffee people. We don&apos;t review restaurants.
            We don&apos;t rate chains. We find the world&apos;s best specialty coffee shops and make it easy to
            visit them — wherever you&apos;re headed next.
          </p>
          <p className="text-grounds-brown leading-relaxed">
            We built this because the alternatives are broken. Google Maps treats Starbucks and a
            meticulously crafted single-origin pour-over bar as equals. City guides go stale. Review
            apps are gamed. Grounds is the utility layer: curated, scored, and always map-first.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {[
            { value: totalCafes.toString(), label: "Curated cafés" },
            { value: cityCount.toString(), label: "Cities covered" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <p className="text-3xl font-bold text-grounds-espresso">{s.value}</p>
              <p className="text-sm text-grounds-brown/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top Contributors */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-2">Top Contributors</h2>
          <p className="text-grounds-brown/60 text-sm mb-6">
            Community submissions are at the heart of what makes Grounds better than any algorithm.
            These travelers have helped build the database.
          </p>
          <div className="space-y-3">
            {TOP_CONTRIBUTORS.map((c, i) => (
              <div key={c.name} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                <span className="text-lg font-bold text-grounds-gold w-6">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-grounds-espresso">@{c.name}</p>
                  <p className="text-xs text-grounds-brown/50">{c.cities.join(" · ")}</p>
                </div>
                <span className="text-sm font-medium text-grounds-brown/60">{c.submissions} cafés</span>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-grounds-espresso mb-1">New cities, first</h2>
          <p className="text-sm text-grounds-brown/60 mb-4">Get notified when we add new destinations to the map.</p>
          <NewsletterSignup source="about" variant="compact" />
        </div>

        {/* Score link */}
        <div className="bg-grounds-espresso text-grounds-cream rounded-2xl p-8 text-center">
          <h2 className="font-serif text-2xl font-bold mb-2">The Grounds Score</h2>
          <p className="text-grounds-cream/70 text-sm mb-4">
            Our scoring methodology is 100% public. No payments, no influence, no black box.
          </p>
          <Link href="/about/score" className="inline-block bg-grounds-gold text-grounds-espresso font-medium px-6 py-3 rounded-xl hover:bg-grounds-gold/90 transition-colors">
            How scores are calculated →
          </Link>
        </div>
      </div>
    </div>
  );
}
