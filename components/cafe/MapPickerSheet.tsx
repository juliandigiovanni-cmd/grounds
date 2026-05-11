"use client";

import { useState } from "react";

interface Props {
  onSelect: (app: "apple" | "google", remember: boolean) => void;
  onClose: () => void;
}

export function MapPickerSheet({ onSelect, onClose }: Props) {
  const [remember, setRemember] = useState(true);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-grounds-cream rounded-t-2xl shadow-2xl px-6 pt-4 pb-6"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-grounds-brown/20 rounded-full" />
        </div>

        <p className="text-grounds-espresso font-semibold text-base mb-4 text-center">
          Open directions with…
        </p>

        <div className="flex flex-col gap-3 mb-5">
          <button
            onClick={() => onSelect("apple", remember)}
            className="flex items-center gap-3 w-full bg-white border border-grounds-brown/15 rounded-xl px-4 py-3.5 text-grounds-espresso font-medium text-sm active:bg-grounds-brown/5 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect width="24" height="24" rx="6" fill="#007AFF" />
              <path d="M12 5.5l2.5 4.5H9.5L12 5.5z" fill="white" />
              <circle cx="12" cy="12" r="1.5" fill="white" />
              <path d="M6 12h12M12 6v12" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
            </svg>
            Apple Maps
          </button>

          <button
            onClick={() => onSelect("google", remember)}
            className="flex items-center gap-3 w-full bg-white border border-grounds-brown/15 rounded-xl px-4 py-3.5 text-grounds-espresso font-medium text-sm active:bg-grounds-brown/5 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
              <circle cx="12" cy="9" r="2.8" fill="white" />
            </svg>
            Google Maps
          </button>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-grounds-espresso"
          />
          <span className="text-sm text-grounds-brown">Remember my choice</span>
        </label>
      </div>
    </>
  );
}
