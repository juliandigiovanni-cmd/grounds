import { SEED_CAFES } from "@/lib/seed-data";
import { CafeCard } from "@/components/cafe/CafeCard";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-grounds-espresso mb-6">All Cafés</h1>
        <div className="space-y-2">
          {SEED_CAFES.sort((a, b) => (b.third_wave_score ?? 0) - (a.third_wave_score ?? 0)).map(cafe => (
            <div key={cafe.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <CafeCard cafe={cafe} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
