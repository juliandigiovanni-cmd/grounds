"use client";

import { useState } from "react";

const REPORT_REASONS = [
  "Permanently closed",
  "Wrong location",
  "Not specialty coffee",
  "Inappropriate content",
  "Other",
] as const;

type ReportReason = typeof REPORT_REASONS[number];

interface Props {
  cafeId: string;
  cafeName: string;
}

export function ReportButton({ cafeId, cafeName }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ReportReason | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    // TODO: POST to /api/report or Supabase edge function
    console.log("Report:", { cafeId, reason: selected });
    setSubmitted(true);
    setTimeout(() => { setOpen(false); setSubmitted(false); }, 2000);
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="text-xs text-grounds-brown/40 hover:text-grounds-brown/70 transition-colors"
        style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}
      >
        Report listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-lg font-bold text-grounds-espresso mb-1">Report listing</h3>
            <p className="text-sm text-grounds-brown/60 mb-4">{cafeName}</p>
            {submitted ? (
              <p className="text-center text-grounds-sage py-4">Thanks — we&apos;ll review this shortly.</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map(reason => (
                    <button
                      key={reason}
                      onClick={() => setSelected(reason)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                        selected === reason
                          ? "border-grounds-gold bg-grounds-gold/10 text-grounds-espresso"
                          : "border-grounds-brown/20 hover:bg-grounds-cream"
                      }`}
                      style={{ minHeight: 44 }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!selected}
                  className="w-full bg-grounds-espresso text-grounds-cream font-medium py-3 rounded-xl text-sm hover:bg-grounds-brown transition-colors disabled:opacity-40"
                  style={{ minHeight: 44 }}
                >
                  Submit report
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
