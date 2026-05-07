"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

type Status = "idle" | "loading" | "success" | "error";

export default function SubmitPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      city: fd.get("city") as string,
      address: fd.get("address") as string,
      website: fd.get("website") as string,
      instagram: fd.get("instagram") as string,
      blurb: fd.get("blurb") as string,
      submitterEmail: fd.get("email") as string,
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-grounds-cream flex flex-col">
        <header className="bg-grounds-espresso text-grounds-cream px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-grounds-cream/70 hover:text-grounds-cream text-sm">← Map</Link>
          <Logo variant="light" size="sm" />
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">☕</div>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">Thanks for the tip!</h2>
            <p className="text-grounds-brown/70 mb-6">
              We review every submission personally. If it makes the cut, it&apos;ll show up on the map within a few days.
            </p>
            <Link href="/" className="inline-block bg-grounds-espresso text-grounds-cream px-6 py-3 rounded-xl font-medium hover:bg-grounds-brown transition-colors">
              Back to the Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    { id: "name", label: "Café Name *", placeholder: "Stumptown Coffee", required: true },
    { id: "city", label: "City *", placeholder: "Portland, OR", required: true },
    { id: "address", label: "Address", placeholder: "4525 SE Division St" },
    { id: "website", label: "Website", placeholder: "https://...", type: "url" },
    { id: "instagram", label: "Instagram Handle", placeholder: "@..." },
    { id: "email", label: "Your email (we'll notify you if it goes live)", placeholder: "you@example.com", type: "email" },
  ];

  return (
    <div className="min-h-screen bg-grounds-cream flex flex-col">
      <header className="bg-grounds-espresso text-grounds-cream px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-grounds-cream/70 hover:text-grounds-cream text-sm">← Map</Link>
        <Logo variant="light" size="sm" />
      </header>
      <div className="max-w-xl mx-auto w-full px-6 py-12">
        <h1 className="font-serif text-3xl font-bold text-grounds-espresso mb-2">Submit a Café</h1>
        <p className="text-grounds-brown/70 mb-8">
          Know a great specialty café we should feature? We review every submission and add the best ones ourselves.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-grounds-espresso mb-1">
                {f.label}
              </label>
              <input
                id={f.id}
                name={f.id}
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                required={f.required}
                className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 bg-white"
                style={{ minHeight: 44 }}
              />
            </div>
          ))}

          <div>
            <label htmlFor="blurb" className="block text-sm font-medium text-grounds-espresso mb-1">
              Why is it worth the detour?
            </label>
            <textarea
              id="blurb"
              name="blurb"
              rows={3}
              placeholder="Lead with what makes it special — the roaster, the vibe, the specific drink..."
              className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 bg-white resize-none"
            />
          </div>

          {status === "error" && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-grounds-espresso text-grounds-cream font-medium py-3 px-6 rounded-xl hover:bg-grounds-brown transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ minHeight: 44 }}
          >
            {status === "loading" ? "Submitting…" : "Submit for Review"}
          </button>

          <p className="text-xs text-grounds-brown/40 text-center">
            We read every submission. Only the best make the map.
          </p>
        </form>
      </div>
    </div>
  );
}
