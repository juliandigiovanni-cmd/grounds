"use client";

import { getScoreColor, getScoreLabel } from "@/lib/scoring";
import { useState } from "react";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function ScoreBadge({ score, size = "md", showTooltip = true }: Props) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center font-bold rounded-md ${sizeClasses[size]} cursor-help`}
        style={{ backgroundColor: `${color}20`, color, border: `1.5px solid ${color}40` }}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        onClick={(e) => { e.stopPropagation(); setTooltipVisible(v => !v); }}
        aria-label={`Grounds Score: ${score} — ${label}`}
      >
        {score}
        <span className="ml-1 text-current opacity-60 text-xs font-normal">GS</span>
      </span>
      {showTooltip && tooltipVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-grounds-espresso text-grounds-cream text-xs rounded-lg p-3 shadow-xl z-50">
          <p className="font-bold mb-1">Grounds Score: {score}/100</p>
          <p className="opacity-80 leading-relaxed">Our curation signal: named roaster (25pts), filter brew methods (20pts), independent (20pts), press coverage (15pts), roastery on-site (10pts), community upvotes (10pts).</p>
          <a href="/about/score" className="text-grounds-gold mt-1 block hover:underline" onClick={e => e.stopPropagation()}>How is this calculated? →</a>
          <a href="/submit" className="text-grounds-gold/80 mt-1 block hover:underline" onClick={e => e.stopPropagation()}>Disagree with this score? Tell us why →</a>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-grounds-espresso" />
        </div>
      )}
    </div>
  );
}
