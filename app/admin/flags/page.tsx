import { SEED_CAFES } from "@/lib/seed-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Flagged Cafés — Admin | Grounds" };

// In production: check session and redirect if not admin
export default function AdminFlagsPage() {
  const flagged = SEED_CAFES.filter(c => c.flagged);

  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl font-bold text-grounds-espresso mb-2">Flagged Listings</h1>
        <p className="text-grounds-brown/60 mb-8">Review community-reported issues. 3+ reports auto-sets verified=false.</p>

        {flagged.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">✓</p>
            <p className="text-grounds-brown/60">No flagged listings. Queue is clear.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flagged.map(cafe => (
              <div key={cafe.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-grounds-espresso">{cafe.name}</h3>
                    <p className="text-sm text-grounds-brown/60">{cafe.city} · {cafe.flag_reason ?? "No reason given"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="px-4 py-2 text-sm bg-grounds-sage/20 text-grounds-sage rounded-lg hover:bg-grounds-sage/30 transition-colors" style={{ minHeight: 44 }}>
                      Dismiss
                    </button>
                    <button className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" style={{ minHeight: 44 }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
