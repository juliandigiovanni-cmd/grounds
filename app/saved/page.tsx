"use client";

import { useSavedCafes } from "@/hooks/useSavedCafes";
import { SEED_CAFES } from "@/lib/seed-data";
import { CafeCard } from "@/components/cafe/CafeCard";
import Link from "next/link";

export default function SavedPage() {
  const { saved, toggle } = useSavedCafes();
  const savedCafes = SEED_CAFES.filter(c => saved.includes(c.id));

  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-grounds-gold hover:underline mb-6 block">← Map</Link>
        <h1 className="font-serif text-2xl font-bold text-grounds-espresso mb-6">Saved Cafés</h1>
        {savedCafes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔖</p>
            <p className="text-grounds-brown/60 mb-4">No saved cafés yet.</p>
            <Link href="/" className="text-grounds-gold hover:underline text-sm">Explore the map →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {savedCafes.map(cafe => (
              <div key={cafe.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <CafeCard cafe={cafe} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
