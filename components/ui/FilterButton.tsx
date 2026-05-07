"use client";

import { SpecialtyToggle } from "@/components/ui/SpecialtyToggle";

export function FilterBar() {
  return (
    <div className="flex items-center gap-2">
      <button
        className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-grounds-brown/20 rounded-xl px-4 py-2 text-sm font-medium text-grounds-espresso shadow-sm hover:bg-grounds-cream transition-colors"
        style={{ minHeight: 44 }}
        onClick={() => console.log("Filter modal TODO")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
        Filters
      </button>
      <SpecialtyToggle />
    </div>
  );
}

// Backwards-compatible alias
export const FilterButton = FilterBar;
