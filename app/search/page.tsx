"use client";

import { useState, useMemo } from "react";
import { SEED_CAFES } from "@/lib/seed-data";
import { CafeCard } from "@/components/cafe/CafeCard";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const sorted = [...SEED_CAFES].sort((a, b) => (b.third_wave_score ?? 0) - (a.third_wave_score ?? 0));

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return sorted;
    return sorted.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.roaster?.toLowerCase().includes(q) ||
      c.editorial_blurb.toLowerCase().includes(q) ||
      c.vibe_tags.some(t => t.includes(q)) ||
      c.brew_methods.some(m => m.includes(q))
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-grounds-cream flex flex-col">
      <header className="bg-grounds-espresso text-grounds-cream px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-grounds-cream/70 hover:text-grounds-cream text-sm">← Map</Link>
        <Logo variant="light" size="sm" />
      </header>

      <div className="max-w-2xl mx-auto w-full px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-grounds-espresso mb-4">All Cafés</h1>

        <div className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, city, roaster, vibe..."
            className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 pr-10"
            style={{ minHeight: 44 }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grounds-brown/40 hover:text-grounds-brown text-lg leading-none"
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>

        <p className="text-xs text-grounds-brown/40 mb-4">
          {results.length} café{results.length !== 1 ? "s" : ""}{query ? ` matching "${query}"` : " · sorted by Grounds Score"}
        </p>

        <div className="space-y-2">
          {results.map(cafe => (
            <div key={cafe.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <CafeCard cafe={cafe} />
            </div>
          ))}
          {results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-grounds-brown/50 text-sm">No cafés match &ldquo;{query}&rdquo;</p>
              <button onClick={() => setQuery("")} className="text-grounds-gold text-sm hover:underline mt-2 block mx-auto">
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
