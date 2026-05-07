"use client";

import { useEffect, useState } from "react";
import type { Metadata } from "next";

interface FlaggedCafe {
  id: string;
  name: string;
  city: string;
  flag_count: number;
  flag_reason: string | null;
}

interface FlagReport {
  cafe_id: string;
  reason: string;
  created_at: string;
}

export default function AdminFlagsPage() {
  const [cafes, setCafes] = useState<FlaggedCafe[]>([]);
  const [reports, setReports] = useState<FlagReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/flags")
      .then(r => r.json())
      .then(d => { setCafes(d.cafes ?? []); setReports(d.reports ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function dismiss(id: string) {
    setActing(id);
    await fetch("/api/admin/flags", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setCafes(prev => prev.filter(c => c.id !== id));
    setActing(null);
  }

  async function remove(id: string) {
    if (!confirm("Permanently delete this café?")) return;
    setActing(id);
    await fetch("/api/admin/flags", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setCafes(prev => prev.filter(c => c.id !== id));
    setActing(null);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="font-serif text-2xl font-bold text-grounds-espresso mb-1">Flagged Listings</h1>
      <p className="text-grounds-brown/60 text-sm mb-8">Community-reported issues. 3+ reports auto-removes verified status.</p>

      {loading ? (
        <p className="text-grounds-brown/50 text-sm">Loading…</p>
      ) : cafes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-grounds-brown/60">No flagged listings. Queue is clear.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cafes.map(cafe => {
            const cafeReports = reports.filter(r => r.cafe_id === cafe.id);
            return (
              <div key={cafe.id} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-400">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-grounds-espresso">{cafe.name}</h3>
                      <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                        {cafe.flag_count} report{cafe.flag_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-sm text-grounds-brown/60 mb-2">{cafe.city}</p>
                    {cafeReports.length > 0 && (
                      <ul className="space-y-0.5">
                        {cafeReports.slice(0, 5).map((r, i) => (
                          <li key={i} className="text-xs text-grounds-brown/50">
                            · {r.reason} <span className="text-grounds-brown/30">({new Date(r.created_at).toLocaleDateString()})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => dismiss(cafe.id)}
                      disabled={acting === cafe.id}
                      className="px-4 py-2 text-sm bg-grounds-sage/20 text-grounds-sage font-medium rounded-lg hover:bg-grounds-sage/30 transition-colors disabled:opacity-50"
                      style={{ minHeight: 44 }}
                    >
                      {acting === cafe.id ? "…" : "Dismiss"}
                    </button>
                    <button
                      onClick={() => remove(cafe.id)}
                      disabled={acting === cafe.id}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      style={{ minHeight: 44 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
