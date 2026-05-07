"use client";

import { useEffect, useState } from "react";

interface Subscriber {
  id: string;
  email: string;
  source: string;
  subscribed_at: string;
}

export default function AdminNewsletterPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then(r => r.json())
      .then(d => { setRows(d.subscribers ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const bySource = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.source] = (acc[r.source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-serif text-2xl font-bold text-grounds-espresso mb-1">Newsletter</h1>
      <p className="text-grounds-brown/60 text-sm mb-6">{rows.length} subscriber{rows.length !== 1 ? "s" : ""} total</p>

      {Object.keys(bySource).length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {Object.entries(bySource).map(([src, count]) => (
            <div key={src} className="bg-white rounded-xl px-4 py-2 shadow-sm text-sm">
              <span className="font-medium text-grounds-espresso">{count}</span>
              <span className="text-grounds-brown/50 ml-1">from {src}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-grounds-brown/50 text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-grounds-brown/50 text-sm">No subscribers yet.</p>
          <p className="text-grounds-brown/30 text-xs mt-1">The signup widget is live on the map sidebar and about page.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grounds-brown/10 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-grounds-brown/50 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-grounds-brown/50 uppercase tracking-wide">Source</th>
                <th className="px-4 py-3 text-xs font-semibold text-grounds-brown/50 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-grounds-brown/5 last:border-0 hover:bg-grounds-cream/50">
                  <td className="px-4 py-3 text-grounds-espresso font-medium">{r.email}</td>
                  <td className="px-4 py-3 text-grounds-brown/50">{r.source}</td>
                  <td className="px-4 py-3 text-grounds-brown/40">{new Date(r.subscribed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
