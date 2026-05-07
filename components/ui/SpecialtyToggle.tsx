"use client";

import { useState } from "react";

export function SpecialtyToggle() {
  const [on, setOn] = useState(true);

  return (
    <button
      onClick={() => setOn(v => !v)}
      className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border transition-colors ${
        on
          ? "bg-grounds-gold/15 border-grounds-gold text-grounds-espresso"
          : "bg-white border-grounds-brown/20 text-grounds-brown/60"
      }`}
      style={{ minHeight: 44 }}
      aria-pressed={on}
    >
      <span className="text-base">☕</span>
      <span>Specialty only</span>
      {on && <span className="text-xs bg-grounds-gold/30 text-grounds-espresso px-1.5 py-0.5 rounded-full font-semibold">ON</span>}
    </button>
  );
}
