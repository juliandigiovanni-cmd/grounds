"use client";

import { useState, useCallback, useRef } from "react";
import { SEED_CITIES } from "@/lib/seed-data";
import { MAPBOX_TOKEN } from "@/lib/mapbox";

interface GeoResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  text: string;
  context?: { id: string; text: string }[];
}

interface Props {
  onCitySelect: (lat: number, lng: number, zoom?: number) => void;
  variant?: "mobile" | "sidebar" | "hero";
}

export function TravelerModeSearch({ onCitySelect, variant = "sidebar" }: Props) {
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

    // Check seeded cities first for instant results
    const seededMatches = SEED_CITIES.filter(c =>
      c.name.toLowerCase().includes(val.toLowerCase()) ||
      c.country.toLowerCase().includes(val.toLowerCase())
    );

    if (seededMatches.length > 0) {
      // Convert seeded cities to GeoResult shape for unified rendering
      setResults(seededMatches.map(c => ({
        id: c.id,
        place_name: `${c.name}, ${c.country}`,
        center: [c.lng, c.lat],
        text: c.name,
        context: [{ id: "cafe_count", text: `${c.cafe_count} curated cafés` }],
      })));
      setOpen(true);
    }

    // Always also hit Mapbox geocoding for any city worldwide
    if (!MAPBOX_TOKEN) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?types=place,region&limit=5&access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      const geoResults: GeoResult[] = (data.features ?? []).filter((f: GeoResult) =>
        // Exclude results already covered by seeded cities to avoid duplicates
        !seededMatches.some(s => f.text.toLowerCase().includes(s.name.toLowerCase()))
      );
      if (geoResults.length > 0 || seededMatches.length > 0) {
        setResults([
          ...seededMatches.map(c => ({
            id: c.id,
            place_name: `${c.name}, ${c.country}`,
            center: [c.lng, c.lat] as [number, number],
            text: c.name,
            context: [{ id: "cafe_count", text: `${c.cafe_count} curated cafés` }],
          })),
          ...geoResults,
        ]);
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
    setQuery(result.text);
    setOpen(false);
    const [lng, lat] = result.center;
    onCitySelect(lat, lng, 12);
  }, [onCitySelect]);

  const isCurated = (result: GeoResult) =>
    result.context?.some(c => c.id === "cafe_count");

  const inputClass = variant === "mobile"
    ? "w-full bg-white/80 border border-grounds-brown/20 rounded-xl px-3 py-2 text-sm placeholder:text-grounds-brown/40 focus:outline-none focus:ring-2 focus:ring-grounds-gold/50"
    : "w-full bg-white border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm placeholder:text-grounds-brown/40 focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 shadow-sm";

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Where are you headed?"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={inputClass}
          aria-label="Search for a city"
          style={{ minHeight: 44 }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-grounds-gold/40 border-t-grounds-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grounds-brown/10 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
          {results.map(result => {
            const curated = isCurated(result);
            const cafeCount = result.context?.find(c => c.id === "cafe_count")?.text;
            return (
              <button
                key={result.id}
                className="w-full text-left px-4 py-3 hover:bg-grounds-cream transition-colors flex items-center gap-3 border-b border-grounds-brown/5 last:border-0"
                onMouseDown={() => handleSelect(result)}
                style={{ minHeight: 44 }}
              >
                <span className="text-lg shrink-0">{curated ? "☕" : "📍"}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-grounds-espresso truncate">{result.text}</div>
                  <div className="text-xs text-grounds-brown/50 truncate">
                    {curated ? cafeCount : result.place_name.split(", ").slice(1).join(", ")}
                  </div>
                </div>
                {curated && (
                  <span className="text-xs text-grounds-gold font-medium shrink-0">Curated</span>
                )}
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
