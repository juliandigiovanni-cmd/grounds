"use client";

import { SpecialtyToggle } from "@/components/ui/SpecialtyToggle";
import { activeFilterCount } from "@/components/ui/FilterModal";
import type { FilterState } from "@/components/ui/FilterModal";

interface Props {
  filters: FilterState;
  onOpen: () => void;
}

export function FilterBar({ filters, onOpen }: Props) {
  const count = activeFilterCount(filters);
  return (
    <div className="flex items-center gap-2">
      <button
        className={`flex items-center gap-2 backdrop-blur-sm border rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
          count > 0
            ? "bg-grounds-espresso text-grounds-cream border-grounds-espresso"
            : "bg-white/95 border-grounds-brown/20 text-grounds-espresso hover:bg-grounds-cream"
        }`}
        style={{ minHeight: 44 }}
        onClick={onOpen}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
        Filters
        {count > 0 && (
          <span className="bg-grounds-gold text-grounds-espresso text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
            {count}
          </span>
        )}
      </button>
      <SpecialtyToggle />
    </div>
  );
}

// Backwards-compatible alias
export const FilterButton = FilterBar;
