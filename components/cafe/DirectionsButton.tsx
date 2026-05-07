"use client";

import type { Cafe } from "@/types";

interface Props {
  cafe: Cafe;
}

export function DirectionsButton({ cafe }: Props) {
  const handleDirections = () => {
    const query = encodeURIComponent(`${cafe.name}, ${cafe.address}`);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?q=${query}&ll=${cafe.lat},${cafe.lng}`
      : `https://maps.google.com/?q=${query}&ll=${cafe.lat},${cafe.lng}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); handleDirections(); }}
      className="flex items-center gap-1.5 bg-grounds-espresso text-grounds-cream text-sm font-medium px-3 py-2 rounded-lg hover:bg-grounds-brown transition-colors"
      style={{ minHeight: 44, minWidth: 44 }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3,11 22,2 13,21 11,13" />
      </svg>
      Directions
    </button>
  );
}
