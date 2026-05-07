"use client";

import { useState } from "react";

interface Props {
  cafeId: string;
  lastVerifiedAt?: string;
}

function isStale(dateStr?: string): boolean {
  if (!dateStr) return true;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(dateStr) < sixMonthsAgo;
}

export function VerificationPrompt({ cafeId, lastVerifiedAt }: Props) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  if (!isStale(lastVerifiedAt) || voted) {
    return voted ? (
      <p className="text-xs text-grounds-sage">Thanks for verifying! 🙏</p>
    ) : null;
  }

  const handleVote = async (vote: "yes" | "no") => {
    setVoted(vote);
    // POST to API route
    await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cafeId, vote }),
    }).catch(() => {});
  };

  return (
    <div className="mt-3 p-3 bg-grounds-gold/10 border border-grounds-gold/20 rounded-xl flex items-center gap-3">
      <p className="text-xs text-grounds-brown flex-1">Is this café still open?</p>
      <button
        onClick={(e) => { e.stopPropagation(); handleVote("yes"); }}
        className="text-xs font-medium px-3 py-1.5 bg-grounds-sage text-white rounded-lg hover:bg-grounds-sage/90 transition-colors"
        style={{ minHeight: 36 }}
      >
        Yes ✓
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleVote("no"); }}
        className="text-xs font-medium px-3 py-1.5 bg-grounds-brown/20 text-grounds-brown rounded-lg hover:bg-grounds-brown/30 transition-colors"
        style={{ minHeight: 36 }}
      >
        Not sure
      </button>
    </div>
  );
}
