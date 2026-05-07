import type { Metadata } from "next";
import Link from "next/link";
import { SEED_CAFES } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Revenue — Admin | Grounds" };

export default function AdminRevenuePage() {
  const verifiedCount = SEED_CAFES.filter(c => c.verified_paid).length;
  const sponsoredCount = SEED_CAFES.filter(c => c.sponsored).length;

  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-grounds-espresso mb-2">Revenue Dashboard</h1>
        <p className="text-grounds-brown/60 mb-8">Manual tracking — update monthly</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "AdSense (monthly)", value: "$—", note: "Activate to track" },
            { label: "Sponsorships (active)", value: sponsoredCount.toString(), note: "cafés sponsored" },
            { label: "Verified cafés", value: verifiedCount.toString(), note: "paid verified" },
            { label: "MRR", value: "$—", note: "Manual entry" },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-2xl font-bold text-grounds-espresso">{m.value}</p>
              <p className="text-sm font-medium text-grounds-brown mt-1">{m.label}</p>
              <p className="text-xs text-grounds-brown/50 mt-0.5">{m.note}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-grounds-espresso mb-4">Monthly Notes</h2>
          <textarea
            rows={6}
            placeholder="Log revenue milestones, deal notes, and monthly summaries here..."
            className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 resize-none bg-grounds-cream"
          />
          <button className="mt-3 px-4 py-2 bg-grounds-espresso text-grounds-cream text-sm rounded-xl hover:bg-grounds-brown transition-colors" style={{ minHeight: 44 }}>
            Save notes
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-grounds-espresso mb-3">Revenue Activation Checklist</h2>
          <ul className="space-y-2 text-sm text-grounds-brown/70">
            {[
              "[ ] Uncomment AdSense script in /app/layout.tsx",
              "[ ] Add AdSense publisher ID to .env.local",
              "[ ] Set up first sponsored cafe listing (set sponsored=true in DB)",
              "[ ] Launch Grounds Verified program (/for-cafes waitlist live)",
              "[ ] Connect first affiliate partner to /lib/affiliate.ts",
              "[ ] Add /advertise to footer nav once first paid placement is live",
            ].map(item => (
              <li key={item} className="font-mono">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
