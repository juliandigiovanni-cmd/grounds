"use client";

import { useState } from "react";
import { SEED_CAFES } from "@/lib/seed-data";
import Link from "next/link";

const STYLE_GUIDE = [
  "Max 20 words",
  "Present tense",
  "Lead with what makes it worth a detour",
  "Never use the word 'cozy'",
  "No superlatives (best, greatest, most amazing)",
  "Specific > general: name the roaster, the method, the thing",
];

export default function AdminBlurbsPage() {
  const [blurbs, setBlurbs] = useState<Record<string, string>>(
    Object.fromEntries(SEED_CAFES.map(c => [c.id, c.editorial_blurb]))
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const handleSave = (id: string) => {
    // In production: PATCH to Supabase
    console.log("Save blurb:", id, blurbs[id]);
    setSaved(s => ({ ...s, [id]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2000);
  };

  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/admin/flags" className="text-sm text-grounds-gold hover:underline mb-4 block">← Admin</Link>
        <h1 className="font-serif text-3xl font-bold text-grounds-espresso mb-2">Editorial Blurbs</h1>
        <p className="text-grounds-brown/60 mb-6">One interface to maintain all editorial voice. These are the product&apos;s soul.</p>

        {/* Style guide */}
        <div className="bg-grounds-espresso text-grounds-cream rounded-2xl p-5 mb-8">
          <h2 className="font-semibold mb-3 text-grounds-gold">Style Guide</h2>
          <ul className="space-y-1">
            {STYLE_GUIDE.map(rule => (
              <li key={rule} className="text-sm text-grounds-cream/80 flex items-start gap-2">
                <span className="text-grounds-gold mt-0.5">→</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {SEED_CAFES.map(cafe => {
            const wordCount = blurbs[cafe.id]?.split(/\s+/).filter(Boolean).length ?? 0;
            const tooLong = wordCount > 20;
            return (
              <div key={cafe.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-grounds-espresso">{cafe.name}</h3>
                    <p className="text-xs text-grounds-brown/50">{cafe.city}</p>
                  </div>
                  <span className={`text-xs font-medium ${tooLong ? "text-red-500" : "text-grounds-brown/40"}`}>
                    {wordCount}/20 words
                  </span>
                </div>
                <textarea
                  value={blurbs[cafe.id] ?? ""}
                  onChange={e => setBlurbs(b => ({ ...b, [cafe.id]: e.target.value }))}
                  rows={2}
                  className={`w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${
                    tooLong
                      ? "border-red-300 focus:ring-red-200"
                      : "border-grounds-brown/20 focus:ring-grounds-gold/50"
                  }`}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleSave(cafe.id)}
                    className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                      saved[cafe.id]
                        ? "bg-grounds-sage text-white"
                        : "bg-grounds-espresso text-grounds-cream hover:bg-grounds-brown"
                    }`}
                    style={{ minHeight: 36 }}
                  >
                    {saved[cafe.id] ? "Saved ✓" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
