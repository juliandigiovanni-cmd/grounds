"use client";

import { useState, useCallback } from "react";
import { SEED_CITIES } from "@/lib/seed-data";

interface Props {
  onCitySelect: (lat: number, lng: number, zoom?: number) => void;
  variant?: "mobile" | "sidebar" | "hero";
}

export function TravelerModeSearch({ onCitySelect, variant = "sidebar" }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof SEED_CITIES>([]);
  const [open, setOpen] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 1) {
      const filtered = SEED_CITIES.filter(c =>
        c.name.toLowerCase().includes(val.toLowerCase()) ||
        c.country.toLowerCase().includes(val.toLowerCase())
      );
      setResults(filtered);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, []);

  const handleSelect = useCallback((city: typeof SEED_CITIES[0]) => {
    setQuery(city.name);
    setOpen(false);
    onCitySelect(city.lat, city.lng, 12);
  }, [onCitySelect]);

  const inputClass = variant === "mobile"
    ? "w-full bg-white/80 border border-grounds-brown/20 rounded-xl px-3 py-2 text-sm placeholder:text-grounds-brown/40 focus:outline-none focus:ring-2 focus:ring-grounds-gold/50"
    : "w-full bg-white border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm placeholder:text-grounds-brown/40 focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 shadow-sm";

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Where are you headed?"
        value={query}
        onChange={handleChange}
        onFocus={() => query.length > 1 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={inputClass}
        aria-label="Search for a city"
        style={{ minHeight: 44 }}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grounds-brown/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map(city => (
            <button
              key={city.id}
              className="w-full text-left px-4 py-3 hover:bg-grounds-cream transition-colors flex items-center gap-3"
              onMouseDown={() => handleSelect(city)}
              style={{ minHeight: 44 }}
            >
              <span className="text-2xl">📍</span>
              <div>
                <div className="text-sm font-medium text-grounds-espresso">{city.name}</div>
                <div className="text-xs text-grounds-brown/60">{city.country} · {city.cafe_count} cafés</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
