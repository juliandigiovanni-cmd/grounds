export default function AboutScorePage() {
  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl font-bold text-grounds-espresso mb-4">The Grounds Score</h1>
        <p className="text-xl text-grounds-brown/70 mb-8">
          A transparent, 0–100 curation signal for specialty coffee quality. Unlike crowd ratings, it rewards craft — not popularity.
        </p>

        {/* Why we score */}
        <div className="bg-grounds-espresso/5 border border-grounds-brown/10 rounded-2xl p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-grounds-espresso mb-2">Why does this exist?</h2>
          <p className="text-sm text-grounds-brown/70 leading-relaxed">
            Google Maps treats Starbucks and a single-origin pour-over bar exactly the same — both get 4.5 stars.
            The Grounds Score exists to signal craft without being subjective.
            It rewards what we think matters: knowing your roaster, brewing with intention, and not being a chain.
            The methodology is fully public and scores cannot be purchased.
          </p>
        </div>

        <div className="space-y-6">
          {[
            { label: "Roaster Identity", pts: 25, desc: "Named single-origin sourcing or a visible roaster identity on the menu. This signals curation over commodity." },
            { label: "Alternative Brew Methods", pts: 20, desc: "Pour-over, AeroPress, syphon, Chemex, or similar. Cafés that offer alternatives take brewing seriously." },
            { label: "Independent (No Chain)", pts: 20, desc: "Full points for independent cafés. Chain-affiliated venues are excluded from Grounds entirely." },
            { label: "Editorial Features", pts: 15, desc: "Sprudge/Standart: 15pts. Guardian/NYT/Eater/Infatuation: 10pts. Time Out/equivalent: 5pts." },
            { label: "Community Upvotes", pts: 10, desc: "Verified user signals from travelers who've actually visited. Capped at 10pts to prevent gaming." },
            { label: "Roastery On-Site", pts: 10, desc: "When roasting happens on premises, you're getting beans at peak freshness." },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
              <div className="text-2xl font-bold text-grounds-gold w-12 shrink-0">+{item.pts}</div>
              <div>
                <h3 className="font-semibold text-grounds-espresso mb-1">{item.label}</h3>
                <p className="text-sm text-grounds-brown/70">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Example score calculation */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-grounds-espresso mb-4">Example: The Coffee Collective, Copenhagen</h2>
          <div className="space-y-2">
            {[
              { label: "Named roaster (The Coffee Collective)", pts: 25, max: 25 },
              { label: "Pour-over + Chemex + Espresso", pts: 20, max: 20 },
              { label: "Independent — no chain", pts: 20, max: 20 },
              { label: "Featured in Sprudge + Standart", pts: 15, max: 15 },
              { label: "Community upvotes (7)", pts: 7, max: 10 },
              { label: "Roastery on-site", pts: 10, max: 10 },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="flex-1 text-sm text-grounds-brown">{row.label}</div>
                <div className="text-sm font-medium text-grounds-gold w-12 text-right">+{row.pts}</div>
                <div className="w-24 bg-grounds-cream rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-grounds-gold rounded-full" style={{ width: `${(row.pts / row.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-grounds-brown/10 flex items-center justify-between">
            <span className="font-semibold text-grounds-espresso">Total Score</span>
            <span className="text-2xl font-bold text-grounds-gold">97 / 100</span>
          </div>
        </div>

        <p className="mt-12 text-sm text-grounds-brown/50 text-center">
          Disagree with a score? <a href="/submit" className="text-grounds-gold hover:underline">Tell us why →</a>
        </p>
      </div>
    </div>
  );
}
