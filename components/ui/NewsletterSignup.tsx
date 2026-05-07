"use client";

import { useState } from "react";

interface Props {
  source?: string;
  variant?: "sidebar" | "compact";
}

export function NewsletterSignup({ source = "unknown", variant = "sidebar" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });
    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <div className="text-center py-1">
        <p className="text-xs font-medium text-grounds-gold">You're in ☕</p>
        <p className="text-xs text-grounds-brown/50 mt-0.5">We'll let you know when new cities drop.</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 border border-grounds-brown/20 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-grounds-gold/50"
          style={{ minHeight: 36 }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-grounds-espresso text-grounds-cream text-xs font-medium px-3 py-2 rounded-lg hover:bg-grounds-brown transition-colors disabled:opacity-60 shrink-0"
          style={{ minHeight: 36 }}
        >
          {status === "loading" ? "…" : "Notify me"}
        </button>
      </form>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-grounds-brown/10">
      <p className="text-xs font-semibold text-grounds-espresso mb-0.5">New cities dropping soon</p>
      <p className="text-xs text-grounds-brown/50 mb-2">Get notified when we add your next destination.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 border border-grounds-brown/20 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-grounds-gold/50"
          style={{ minHeight: 36 }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-grounds-espresso text-grounds-cream text-xs font-medium px-3 py-2 rounded-lg hover:bg-grounds-brown transition-colors disabled:opacity-60 shrink-0"
          style={{ minHeight: 36 }}
        >
          {status === "loading" ? "…" : "Notify me"}
        </button>
      </form>
      {status === "error" && <p className="text-xs text-red-500 mt-1">Something went wrong — try again.</p>}
    </div>
  );
}
