"use client";

import { SEED_CAFES } from "@/lib/seed-data";
import Link from "next/link";

function needsOutreach(dateStr?: string): boolean {
  if (!dateStr) return true;
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  return new Date(dateStr) < twelveMonthsAgo;
}

export default function AdminOutreachPage() {
  const stale = SEED_CAFES.filter(c => needsOutreach(c.last_verified_at) && !c.permanently_closed);

  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-grounds-espresso">Outreach Queue</h1>
          <p className="text-grounds-brown/60 text-sm mt-1">Cafés not verified in 12+ months — {stale.length} listings</p>
        </div>

        {stale.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">✓</p>
            <p className="text-grounds-brown/60">All listings verified within the last 12 months.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stale.map(cafe => (
              <div key={cafe.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-grounds-espresso truncate">{cafe.name}</h3>
                  <p className="text-sm text-grounds-brown/60">
                    {cafe.city} · {cafe.last_verified_at
                      ? `Last verified: ${new Date(cafe.last_verified_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                      : "Never verified"}
                  </p>
                  {cafe.website && (
                    <a href={cafe.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-grounds-gold hover:underline">{cafe.website}</a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className="px-4 py-2 text-sm bg-grounds-espresso text-grounds-cream rounded-xl hover:bg-grounds-brown transition-colors"
                    style={{ minHeight: 44 }}
                    onClick={() => window.open(`mailto:?subject=Quick check-in from Grounds&body=Hi ${encodeURIComponent(cafe.name)} team,%0A%0AWe feature your café on Grounds — a curated specialty coffee map used by travelers worldwide.%0A%0ACould you confirm your listing is still accurate? ${encodeURIComponent(`https://www.knowyourgrounds.com/cafe/${cafe.slug}`)}%0A%0AThanks,%0AThe Grounds Team`)}
                  >
                    Send email
                  </button>
                  <Link
                    href={`/cafe/${cafe.slug}`}
                    className="px-4 py-2 text-sm border border-grounds-brown/20 text-grounds-brown rounded-xl hover:bg-grounds-cream transition-colors flex items-center"
                    style={{ minHeight: 44 }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="font-semibold text-grounds-espresso mb-2">Email Template</h2>
          <p className="text-xs text-grounds-brown/60 mb-3">Subject: Quick check-in from Grounds</p>
          <pre className="text-xs bg-grounds-cream p-4 rounded-xl text-grounds-brown/80 whitespace-pre-wrap">
{`Hi [Café Name] team,

We feature your café on Grounds (grounds.coffee) — a curated specialty coffee
map used by travelers worldwide.

We'd love to confirm your listing is still accurate. Could you take 30 seconds
to check: [grounds.coffee/cafe/SLUG]

If anything needs updating (hours, address, brew methods), just reply to this
email and we'll make the change immediately.

Thanks for being part of Know your Grounds.
— The Know your Grounds Team`}
          </pre>
        </div>
      </div>
    </div>
  );
}
