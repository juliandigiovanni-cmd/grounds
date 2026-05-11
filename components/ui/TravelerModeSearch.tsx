"use client";

import { useState, useCallback, useRef } from "react";
import { SEED_CITIES, SEED_CAFES } from "@/lib/seed-data";
import { MAPBOX_TOKEN } from "@/lib/mapbox";
import type { Cafe } from "@/types";

interface CityResult {
  id: string;
  text: string;
  subtitle: string;
  center: [number, number];
  type: 'city-curated' | 'city-geo';
  cafeCount?: string;
}

interface CafeResult {
  id: string;
  text: string;
  city: string;
  score: number;
  center: [number, number];
  cafe: Cafe;
}

interface Props {
  onCitySelect: (lat: number, lng: number, zoom?: number, cityName?: string) => void;
  onCafeSelect?: (cafe: Cafe) => void;
  variant?: "mobile" | "sidebar" | "hero";
}

export function TravelerModeSearch({ onCitySelect, onCafeSelect, variant = "sidebar" }: Props) {
  const [query, setQuery] = useState("");
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [cafeResults, setCafeResults] = useState<CafeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);

  const open = cityResults.length > 0 || cafeResults.length > 0;

  const search = useCallback(async (val: string) => {
    const id = ++searchIdRef.current;
    const q = val.toLowerCase();

    // — Cafes: sync, isolated from Mapbox —
    const cafes = SEED_CAFES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.roaster ?? "").toLowerCase().includes(q)
    ).slice(0, 4);
    setCafeResults(cafes.map(c => ({
      id: c.id,
      text: c.name,
      city: `${c.city}, ${c.country}`,
      score: c.third_wave_score ?? 0,
      center: [c.lng, c.lat],
      cafe: c,
    })));

    // — Seeded cities: sync —
    const seeded = SEED_CITIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
    const seededResults: CityResult[] = seeded.map(c => ({
      id: c.id,
      text: c.name,
      subtitle: `${c.cafe_count} curated cafés`,
      center: [c.lng, c.lat],
      type: 'city-curated',
      cafeCount: String(c.cafe_count),
    }));
    setCityResults(seededResults);

    // — Mapbox: async worldwide cities —
    if (!MAPBOX_TOKEN) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?types=place,region&limit=5&access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      if (id !== searchIdRef.current) return; // stale response — discard
      const geoResults: CityResult[] = (data.features ?? [])
        .filter((f: { text: string }) =>
          !seeded.some(s => f.text.toLowerCase().includes(s.name.toLowerCase()))
        )
        .map((f: { id: string; place_name: string; center: [number, number]; text: string }) => ({
          id: f.id,
          text: f.text,
          subtitle: f.place_name.split(", ").slice(1).join(", "),
          center: f.center,
          type: 'city-geo' as const,
        }));
      setCityResults([...seededResults, ...geoResults]);
    } catch {
      // seeded results remain
    } finally {
      if (id === searchIdRef.current) setLoading(false);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) {
      setCityResults([]);
      setCafeResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => search(val), 300);
  }, [search]);

  const handleCitySelect = useCallback((result: CityResult) => {
    setQuery(result.text);
    setCityResults([]);
    setCafeResults([]);
    onCitySelect(result.center[1], result.center[0], 12, result.type === 'city-curated' ? result.text : undefined);
  }, [onCitySelect]);

  const handleCafeSelect = useCallback((result: CafeResult) => {
    setQuery(result.text);
    setCityResults([]);
    setCafeResults([]);
    onCafeSelect?.(result.cafe);
  }, [onCafeSelect]);

  const handleBlur = useCallback(() => {
    setTimeout(() => { setCityResults([]); setCafeResults([]); }, 150);
  }, []);

  const handleFocus = useCallback(() => {
    if (query.length >= 2) search(query);
  }, [query, search]);

  const inputClass = variant === "mobile"
    ? "w-full bg-white/80 border border-grounds-brown/20 rounded-xl px-3 py-2 text-sm placeholder:text-grounds-brown/40 focus:outline-none focus:ring-2 focus:ring-grounds-gold/50"
    : "w-full bg-white border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm placeholder:text-grounds-brown/40 focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 shadow-sm";

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search cities or cafés…"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputClass}
          aria-label="Search for a city or café"
          style={{ minHeight: 44 }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-grounds-gold/40 border-t-grounds-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grounds-brown/10 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {/* City results */}
          {cityResults.map(result => (
            <button
              key={result.id}
              className="w-full text-left px-4 py-3 hover:bg-grounds-cream transition-colors flex items-center gap-3 border-b border-grounds-brown/5 last:border-0"
              onMouseDown={() => handleCitySelect(result)}
              style={{ minHeight: 44 }}
            >
              <span className="text-base shrink-0">{result.type === 'city-curated' ? "☕" : "📍"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-grounds-espresso truncate">{result.text}</div>
                <div className="text-xs text-grounds-brown/50 truncate">{result.subtitle}</div>
              </div>
              {result.type === 'city-curated' && (
                <span className="text-xs text-grounds-gold font-medium shrink-0">Curated</span>
              )}
            </button>
          ))}

          {/* Divider when both sections present */}
          {cityResults.length > 0 && cafeResults.length > 0 && (
            <div className="px-4 py-1.5 bg-grounds-cream/60 border-y border-grounds-brown/8">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-grounds-brown/40">Cafés</p>
            </div>
          )}

          {/* Cafe results */}
          {cafeResults.map(result => (
            <button
              key={result.id}
              className="w-full text-left px-4 py-3 hover:bg-grounds-cream transition-colors flex items-center gap-3 border-b border-grounds-brown/5 last:border-0"
              onMouseDown={() => handleCafeSelect(result)}
              style={{ minHeight: 44 }}
            >
              <span className="text-base shrink-0">☕</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-grounds-espresso truncate">{result.text}</div>
                <div className="text-xs text-grounds-brown/50 truncate">{result.city}</div>
              </div>
              <span className="text-xs font-semibold text-grounds-gold shrink-0">GS {result.score}</span>
            </button>
          ))}
        </div>
      )}

      {!open && query.length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grounds-brown/10 rounded-xl shadow-xl z-50 px-4 py-3">
          <p className="text-sm text-grounds-brown/50">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
