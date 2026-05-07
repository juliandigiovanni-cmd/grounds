"use client";

import { useEffect } from "react";
import type { BrewMethod, VibeTags } from "@/types";

export interface FilterState {
  brewMethods: BrewMethod[];
  vibeTags: VibeTags[];
  minScore: number;
  verifiedOnly: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  brewMethods: [],
  vibeTags: [],
  minScore: 0,
  verifiedOnly: false,
};

export function activeFilterCount(f: FilterState): number {
  return f.brewMethods.length + f.vibeTags.length + (f.minScore > 0 ? 1 : 0) + (f.verifiedOnly ? 1 : 0);
}

const BREW_OPTIONS: { value: BrewMethod; label: string }[] = [
  { value: "espresso", label: "Espresso" },
  { value: "pour-over", label: "Pour-over" },
  { value: "aeropress", label: "AeroPress" },
  { value: "cold-brew", label: "Cold Brew" },
  { value: "syphon", label: "Syphon" },
  { value: "chemex", label: "Chemex" },
  { value: "french-press", label: "French Press" },
];

const VIBE_OPTIONS: { value: VibeTags; label: string }[] = [
  { value: "laptop-friendly", label: "Laptop friendly" },
  { value: "no-laptop", label: "No laptops" },
  { value: "standing-bar", label: "Standing bar" },
  { value: "outdoor-seating", label: "Outdoor seating" },
  { value: "dog-friendly", label: "Dog friendly" },
  { value: "roastery-on-site", label: "Roastery on-site" },
];

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
}

export function FilterModal({ filters, onChange, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleBrew = (v: BrewMethod) =>
    onChange({
      ...filters,
      brewMethods: filters.brewMethods.includes(v)
        ? filters.brewMethods.filter(b => b !== v)
        : [...filters.brewMethods, v],
    });

  const toggleVibe = (v: VibeTags) =>
    onChange({
      ...filters,
      vibeTags: filters.vibeTags.includes(v)
        ? filters.vibeTags.filter(t => t !== v)
        : [...filters.vibeTags, v],
    });

  const reset = () => onChange(DEFAULT_FILTERS);

  const count = activeFilterCount(filters);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-grounds-cream rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto lg:absolute lg:top-14 lg:left-0 lg:bottom-auto lg:right-auto lg:w-80 lg:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-grounds-cream border-b border-grounds-brown/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-grounds-espresso">Filters</h2>
            {count > 0 && (
              <span className="text-xs bg-grounds-gold text-grounds-espresso font-bold px-2 py-0.5 rounded-full">{count}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {count > 0 && (
              <button onClick={reset} className="text-sm text-grounds-gold hover:underline" style={{ minHeight: 44, display: "flex", alignItems: "center" }}>
                Clear all
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-grounds-brown/10 rounded-full" style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Close filters">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-6 pb-8">
          {/* Grounds Score minimum */}
          <section>
            <label className="block text-xs font-semibold text-grounds-brown/60 uppercase tracking-wide mb-3">
              Minimum Grounds Score: <span className="text-grounds-gold">{filters.minScore > 0 ? filters.minScore : "Any"}</span>
            </label>
            <input
              type="range"
              min={0}
              max={90}
              step={10}
              value={filters.minScore}
              onChange={e => onChange({ ...filters, minScore: Number(e.target.value) })}
              className="w-full accent-grounds-gold"
            />
            <div className="flex justify-between text-xs text-grounds-brown/40 mt-1">
              <span>Any</span><span>50</span><span>70</span><span>90+</span>
            </div>
          </section>

          {/* Brew methods */}
          <section>
            <p className="text-xs font-semibold text-grounds-brown/60 uppercase tracking-wide mb-3">Brew Method</p>
            <div className="flex flex-wrap gap-2">
              {BREW_OPTIONS.map(opt => {
                const active = filters.brewMethods.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleBrew(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
                      active
                        ? "bg-grounds-espresso text-grounds-cream border-grounds-espresso"
                        : "bg-white text-grounds-brown border-grounds-brown/20 hover:border-grounds-brown/40"
                    }`}
                    style={{ minHeight: 36 }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Vibe */}
          <section>
            <p className="text-xs font-semibold text-grounds-brown/60 uppercase tracking-wide mb-3">Vibe</p>
            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map(opt => {
                const active = filters.vibeTags.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleVibe(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
                      active
                        ? "bg-grounds-sage text-white border-grounds-sage"
                        : "bg-white text-grounds-brown border-grounds-brown/20 hover:border-grounds-brown/40"
                    }`}
                    style={{ minHeight: 36 }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Verified only */}
          <section>
            <button
              onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                filters.verifiedOnly
                  ? "bg-grounds-gold/15 border-grounds-gold text-grounds-espresso"
                  : "bg-white border-grounds-brown/20 text-grounds-brown"
              }`}
              style={{ minHeight: 44 }}
            >
              <span className="text-sm font-medium">Verified listings only</span>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${filters.verifiedOnly ? "bg-grounds-gold" : "bg-grounds-brown/20"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.verifiedOnly ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
