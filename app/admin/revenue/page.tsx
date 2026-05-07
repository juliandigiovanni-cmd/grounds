"use client";

import { useEffect, useState } from "react";

interface RevenueData {
  subscribers: number;
  inquiries: number;
  sponsored: number;
  verifiedPaid: number;
  pendingSubmissions: number;
  totalCafes: number;
  recentInquiries: { id: string; name: string; email: string; company: string | null; created_at: string }[];
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = data ? [
    { label: "Newsletter subscribers", value: data.subscribers, note: "active" },
    { label: "Verified inquiries", value: data.inquiries, note: "from /for-cafes" },
    { label: "Sponsored cafés", value: data.sponsored, note: "live placements" },
    { label: "Paid verified", value: data.verifiedPaid, note: "Grounds Verified" },
    { label: "Total cafés", value: data.totalCafes, note: "in database" },
    { label: "Pending review", value: data.pendingSubmissions, note: "submissions" },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="font-serif text-2xl font-bold text-grounds-espresso mb-1">Revenue Dashboard</h1>
      <p className="text-grounds-brown/60 text-sm mb-8">Live data from Supabase</p>

      {loading ? (
        <p className="text-grounds-brown/50 text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {stats.map(m => (
              <div key={m.label} className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-3xl font-bold text-grounds-espresso">{m.value}</p>
                <p className="text-sm font-medium text-grounds-brown mt-1">{m.label}</p>
                <p className="text-xs text-grounds-brown/50 mt-0.5">{m.note}</p>
              </div>
            ))}
          </div>

          {data?.recentInquiries && data.recentInquiries.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="font-semibold text-grounds-espresso mb-4">Recent Verified Café Inquiries</h2>
              <div className="space-y-3">
                {data.recentInquiries.map(inq => (
                  <div key={inq.id} className="flex items-center justify-between gap-4 py-2 border-b border-grounds-brown/5 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-grounds-espresso text-sm truncate">{inq.name}</p>
                      <p className="text-xs text-grounds-brown/50">{inq.email}{inq.company ? ` · ${inq.company}` : ""}</p>
                    </div>
                    <p className="text-xs text-grounds-brown/40 shrink-0">{new Date(inq.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-grounds-espresso mb-3">Revenue Activation Checklist</h2>
            <ul className="space-y-2 text-sm text-grounds-brown/70">
              {[
                "[ ] Launch Grounds Verified program — /for-cafes waitlist is live ✓",
                "[ ] Set up first sponsored café listing (set sponsored=true in DB)",
                "[ ] Connect first affiliate partner to /lib/affiliate.ts",
                "[ ] Uncomment AdSense script in /app/layout.tsx when ready",
                "[ ] Add /advertise to footer nav once first paid placement is live",
              ].map(item => (
                <li key={item} className="font-mono text-xs">{item}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
