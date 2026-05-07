"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ConsentState = "pending" | "accepted" | "declined";

export function CookieConsent() {
  const [state, setState] = useState<ConsentState | null>(null);
  const [isEU, setIsEU] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("grounds_cookie_consent");
    if (stored === "accepted" || stored === "declined") {
      setState(stored as ConsentState);
    } else {
      setState("pending");
    }
    // EU detection via simple timezone heuristic (server-side CF-IPCountry is more accurate in production)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTzPrefixes = ["Europe/"];
    setIsEU(euTzPrefixes.some(p => tz.startsWith(p)));
  }, []);

  const accept = () => {
    localStorage.setItem("grounds_cookie_consent", "accepted");
    setState("accepted");
    // Initialize analytics/ads here when consent is granted
  };

  const decline = () => {
    localStorage.setItem("grounds_cookie_consent", "declined");
    setState("declined");
  };

  if (state !== "pending") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 md:bottom-6 md:left-6 md:right-auto md:max-w-sm">
      <div className="bg-grounds-espresso text-grounds-cream rounded-2xl p-5 shadow-2xl">
        <p className="text-sm leading-relaxed mb-3">
          {isEU
            ? "We use cookies for analytics and to improve your experience. Under GDPR, you have the right to accept or decline."
            : "We use cookies to improve your experience and show relevant content."}
          {" "}
          <Link href="/privacy" className="underline text-grounds-gold hover:text-grounds-cream">Privacy Policy</Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 bg-grounds-gold text-grounds-espresso font-medium py-2 px-4 rounded-xl text-sm hover:bg-grounds-gold/90 transition-colors"
            style={{ minHeight: 44 }}
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="flex-1 bg-grounds-cream/10 text-grounds-cream font-medium py-2 px-4 rounded-xl text-sm hover:bg-grounds-cream/20 transition-colors border border-grounds-cream/20"
            style={{ minHeight: 44 }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
