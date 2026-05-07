"use client";

import type { Cafe } from "@/types";
import { CafeCard } from "./CafeCard";

interface Props {
  cafe: Cafe;
  onClose: () => void;
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="4" x2="16" y2="16" />
      <line x1="16" y1="4" x2="4" y2="16" />
    </svg>
  );
}

export function SidePanel({ cafe, onClose }: Props) {
  return (
    <div className="absolute top-0 right-0 h-full w-[400px] bg-grounds-cream shadow-2xl z-20 overflow-y-auto" style={{ animation: "slideInRight 0.3s ease" }}>
      <div className="sticky top-0 bg-grounds-cream/95 backdrop-blur-sm border-b border-grounds-brown/10 flex items-center justify-between px-4 py-3 z-10">
        <h2 className="font-serif font-bold text-grounds-espresso text-lg truncate">{cafe.name}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-grounds-brown/10 rounded-full transition-colors"
          aria-label="Close panel"
          style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <XIcon />
        </button>
      </div>
      <CafeCard cafe={cafe} />
    </div>
  );
}
