"use client";

import { useState, useCallback, useRef } from "react";
import { SEED_CITIES, SEED_CAFES } from "@/lib/seed-data";
import { MAPBOX_TOKEN } from "@/lib/mapbox";
import type { Cafe } from "@/types";

interface GeoResult {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  context?: { id: string; text: string }[];
  type: 'city-curated' | 'city-geo' | 'cafe';
  cafe?: Cafe;
}

interface Props {
  onCitySelect: (lat: number, lng: number, zoom?: number, cityName?: string) => void;
  onCafeSelect?: (cafe: Cafe) => void;
  variant?: "mobile" | "sidebar" | "hero";
}

export function TravelerModeSearch({ onCitySelect, onCafeSelect, variant = "sidebar" }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (val: string) => {
    if (val.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const q = val.toLowerCase();

    const seededMatches = SEED_CITIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    );

    const cafeMatches = SEED_CAFES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.roaster ?? "").toLowerCase().includes(q)
    ).slice(0, 4);

    const cityResults: GeoResult[] = seededMatches.map(c => ({
      id: c.id,
      place_name: `${c.name}, ${c.country}`,
      center: [c.lng, c.lat],
      text: c.name,
      context: [{ id: "cafe_count", text: `${c.cafe_count} curated cafés` }],
      type: 'city-curated',
    }));

    const cafeResults: GeoResult[] = cafeMatches.map(c => ({
      id: c.id,
      place_name: `${c.name}, ${c.city}`,
      center: [c.lng, c.lat],
      text: c.name,
      context: [{ id: "city", text: `${c.city}, ${c.country}` }, { id: "score", text: `GS ${c.third_wave_score}` }],
      type: 'cafe',
      cafe: c,
    }));

    if (cityResults.length > 0 || cafeResults.length > 0) {
      setResults([...cityResults, ...cafeResults]);
      setOpen(true);
    }

    if (!MAPBOX_TOKEN) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?types=place,region&limit=5&access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      const geoResults: GeoResult[] = (data.features ?? [])
        .filter((f: { text: string }) =>
          !seededMatches.some(s => f.text.toLowerCase().includes(s.name.toLowerCase()))
        )
        .map((f: { id: string; place_name: string; center: [number, number]; text: string }) => ({
          ...f,
          type: 'city-geo' as const,
        }));

      if (geoResults.length > 0 || cityResults.length > 0 || cafeResults.length > 0) {
        setResults([...cityResults, ...geoResults, ...cafeResults]);
        setOpen(true);
      }
    } catch {
      // Geocoding failed — seeded results still show
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => search(val), 300);
  }, [search]);

  const handleSelect = useCallback((result: GeoResult) => {
    setQuery(result.type === 'cafe' ? result.text : result.text);
    setOpen(false);
    if (result.type === 'cafe' && result.cafe && onCafeSelect) {
      onCafeSelect(result.cafe);
      return;
    }
    const [lng, lat] = result.center;
    onCitySelect(lat, lng, 12, result.type === 'city-curated' ? result.text : undefined);
  }, [onCitySelect, onCafeSelect]);

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
          onFocus={() => query.length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
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

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grounds-brown/10 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.map(result => {
            const isCafe = result.type === 'cafe';
            const isCurated = result.type === 'city-curated';
            const cafeCount = result.context?.find(c => c.id === "cafe_count")?.text;
            const cafeCity = result.context?.find(c => c.id === "city")?.text;
            const cafeScore = result.context?.find(c => c.id === "score")?.text;

            return (
              <button
                key={result.id}
                className="w-full text-left px-4 py-3 hover:bg-grounds-cream transition-colors flex items-center gap-3 border-b border-grounds-brown/5 last:border-0"
                onMouseDown={() => handleSelect(result)}
                style={{ minHeight: 44 }}
              >
                <span className="text-base shrink-0">
                  {isCafe ? "☕" : isCurated ? "☕" : "📍"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-grounds-espresso truncate">{result.text}</div>
                  <div className="text-xs text-grounds-brown/50 truncate">
                    {isCafe
                      ? cafeCity
                      : isCurated
                        ? cafeCount
                        : result.place_name.split(", ").slice(1).join(", ")}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {isCafe && cafeScore && (
                    <span className="text-xs font-semibold text-grounds-gold">{cafeScore}</span>
                  )}
                  {isCurated && !isCafe && (
                    <span className="text-xs text-grounds-gold font-medium">Curated</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grounds-brown/10 rounded-xl shadow-xl z-50 px-4 py-3">
          <p className="text-sm text-grounds-brown/50">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
