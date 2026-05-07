"use client";

import { useEffect, useState } from "react";

interface Submission {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  website: string | null;
  instagram_handle: string | null;
  editorial_blurb: string;
  created_at: string;
  verified: boolean;
}

export default function AdminSubmissionsPage() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then(r => r.json())
      .then(d => { setRows(d.submissions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function approve(id: string) {
    setApproving(id);
    await fetch("/api/admin/submissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setRows(prev => prev.map(r => r.id === id ? { ...r, verified: true } : r));
    setApproving(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this submission?")) return;
    setDeleting(id);
    await fetch("/api/admin/submissions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setRows(prev => prev.filter(r => r.id !== id));
    setDeleting(null);
  }

  const pending = rows.filter(r => !r.verified);
  const approved = rows.filter(r => r.verified);

  return (
    <div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-grounds-brown/50 text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-grounds-brown/50 text-sm">No submissions yet.</p>
            <p className="text-grounds-brown/30 text-xs mt-1">They'll appear here when visitors submit via /submit</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xs font-semibold text-grounds-brown/50 uppercase tracking-wide mb-4">
                  Pending Review ({pending.length})
                </h2>
                <div className="space-y-4">
                  {pending.map(s => (
                    <SubmissionCard key={s.id} s={s} onApprove={approve} onDelete={remove} approving={approving === s.id} deleting={deleting === s.id} />
                  ))}
                </div>
              </section>
            )}
            {approved.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-grounds-brown/50 uppercase tracking-wide mb-4">
                  Approved ({approved.length})
                </h2>
                <div className="space-y-3">
                  {approved.map(s => (
                    <SubmissionCard key={s.id} s={s} onApprove={approve} onDelete={remove} approving={approving === s.id} deleting={deleting === s.id} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ s, onApprove, onDelete, approving, deleting }: {
  s: Submission;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  approving: boolean;
  deleting: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${s.verified ? "border-grounds-sage" : "border-grounds-gold"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-grounds-espresso">{s.name}</h3>
            {s.verified && <span className="text-xs bg-grounds-sage/20 text-grounds-sage px-2 py-0.5 rounded-full font-medium">Approved</span>}
          </div>
          <p className="text-sm text-grounds-brown/60 mb-2">{s.city}{s.address ? ` · ${s.address}` : ""}</p>
          {s.editorial_blurb && s.editorial_blurb !== "Submitted for review." && (
            <p className="text-sm text-grounds-brown/70 italic mb-2">"{s.editorial_blurb}"</p>
          )}
          <div className="flex gap-3 text-xs text-grounds-brown/40">
            {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="hover:text-grounds-gold underline truncate max-w-[200px]">{s.website}</a>}
            {s.instagram_handle && <span>@{s.instagram_handle}</span>}
            <span>{new Date(s.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {!s.verified && (
            <button
              onClick={() => onApprove(s.id)}
              disabled={approving}
              className="text-xs px-3 py-1.5 bg-grounds-gold text-grounds-espresso font-medium rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {approving ? "…" : "Approve"}
            </button>
          )}
          <button
            onClick={() => onDelete(s.id)}
            disabled={deleting}
            className="text-xs px-3 py-1.5 bg-grounds-brown/10 text-grounds-brown rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
