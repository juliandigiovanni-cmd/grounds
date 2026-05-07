import { BRAND_NAME } from "@/lib/brand";

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl font-bold text-grounds-espresso mb-4">Reach specialty coffee travelers</h1>
        <p className="text-xl text-grounds-brown/70 mb-12">{BRAND_NAME} connects roasters and specialty importers with serious coffee travelers at the moment they&apos;re deciding where to go.</p>
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {[
            { tier: "City Feature", price: "TBD/mo", desc: "Top placement in one city's café list with a Featured Roaster badge." },
            { tier: "Global Feature", price: "TBD/mo", desc: "Priority placement across all city lists and homepage visibility." },
            { tier: "Roaster Profile", price: "TBD/mo", desc: "Dedicated profile page with your story, bean lineup, and linked cafés." },
          ].map(t => (
            <div key={t.tier} className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-grounds-espresso mb-1">{t.tier}</h3>
              <p className="text-grounds-gold font-medium mb-3">{t.price}</p>
              <p className="text-sm text-grounds-brown/70">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Ad Slot Diagram */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-2">Current placement availability</h2>
          <p className="text-sm text-grounds-brown/60 mb-6">Standard IAB ad units served via AdSense. City Feature slots sold directly.</p>
          <div className="space-y-4">
            {/* Mobile slots */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-grounds-brown/40 mb-2">Mobile</p>
              <div className="space-y-2">
                {[
                  {
                    label: "Bottom Banner",
                    dims: "320×50",
                    placement: "Bottom of café cards",
                    via: "AdSense",
                  },
                  {
                    label: "Medium Rectangle",
                    dims: "300×250",
                    placement: "Between list items",
                    via: "AdSense",
                  },
                ].map(slot => (
                  <div key={slot.label} className="flex items-center gap-4 rounded-xl border border-grounds-brown/10 px-4 py-3">
                    <div
                      className="flex-shrink-0 bg-grounds-gold/10 border border-grounds-gold/30 rounded text-center flex items-center justify-center text-[10px] text-grounds-gold font-mono"
                      style={{ width: 64, height: 20 }}
                    >
                      {slot.dims}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-grounds-espresso">{slot.label}</p>
                      <p className="text-xs text-grounds-brown/50">{slot.placement}</p>
                    </div>
                    <span className="text-xs text-grounds-brown/40 flex-shrink-0">{slot.via}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop slots */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-grounds-brown/40 mb-2">Desktop</p>
              <div className="space-y-2">
                {[
                  {
                    label: "Sidebar Rectangle",
                    dims: "300×250",
                    placement: "Sidebar on map & list views",
                    via: "AdSense",
                  },
                  {
                    label: "Leaderboard",
                    dims: "728×90",
                    placement: "Top of café detail pages",
                    via: "AdSense",
                  },
                ].map(slot => (
                  <div key={slot.label} className="flex items-center gap-4 rounded-xl border border-grounds-brown/10 px-4 py-3">
                    <div
                      className="flex-shrink-0 bg-grounds-gold/10 border border-grounds-gold/30 rounded text-center flex items-center justify-center text-[10px] text-grounds-gold font-mono"
                      style={{ width: 64, height: 20 }}
                    >
                      {slot.dims}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-grounds-espresso">{slot.label}</p>
                      <p className="text-xs text-grounds-brown/50">{slot.placement}</p>
                    </div>
                    <span className="text-xs text-grounds-brown/40 flex-shrink-0">{slot.via}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct-sold */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-grounds-brown/40 mb-2">Direct (sold by Grounds)</p>
              <div className="flex items-center gap-4 rounded-xl border border-grounds-gold/20 bg-grounds-gold/5 px-4 py-3">
                <div
                  className="flex-shrink-0 bg-grounds-gold/20 border border-grounds-gold/40 rounded text-center flex items-center justify-center text-[10px] text-grounds-gold font-mono"
                  style={{ width: 64, height: 20 }}
                >
                  Custom
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-grounds-espresso">City Feature</p>
                  <p className="text-xs text-grounds-brown/50">Top of city Top 5 list — Featured Roaster badge + priority card</p>
                </div>
                <span className="text-xs text-grounds-gold font-medium flex-shrink-0">Direct</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-6">Get in touch</h2>
          <form className="space-y-4">
            {["Your name", "Email", "Company / Roastery"].map(p => (
              <input key={p} type="text" placeholder={p}
                className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-grounds-gold/50"
                style={{ minHeight: 44 }}
              />
            ))}
            <textarea rows={4} placeholder="Tell us about your brand and what you're looking for..."
              className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 resize-none"
            />
            <button type="submit"
              className="w-full bg-grounds-espresso text-grounds-cream font-medium py-3 rounded-xl hover:bg-grounds-brown transition-colors"
              style={{ minHeight: 44 }}>
              Send inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
