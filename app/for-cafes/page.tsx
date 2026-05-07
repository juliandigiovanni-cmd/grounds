import { BRAND_NAME } from "@/lib/brand";

export default function ForCafesPage() {
  return (
    <div className="min-h-screen bg-grounds-cream">
      {/* Hero */}
      <div className="bg-grounds-espresso text-grounds-cream px-6 py-16 text-center">
        <p className="text-grounds-gold text-sm font-medium uppercase tracking-widest mb-4">Grounds Verified</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Your café, in front of <br/>the right travelers</h1>
        <p className="text-grounds-cream/70 text-lg max-w-xl mx-auto">
          {BRAND_NAME} is used by specialty coffee travelers deciding where to go before they land.
          Verified cafés get priority placement and tools to keep their profile accurate.
        </p>
      </div>

      {/* Benefits */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {[
            {
              icon: "🏆",
              title: "Priority Placement",
              desc: "Appear at the top of city lists and search results. Travelers see you first.",
            },
            {
              icon: "✓",
              title: "Grounds Verified Badge",
              desc: "A badge that tells travelers your listing is current, accurate, and actively managed.",
            },
            {
              icon: "📊",
              title: "Profile Analytics",
              desc: "See how many travelers viewed your profile, saved your café, or requested directions.",
            },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <p className="text-4xl mb-3">{b.icon}</p>
              <h3 className="font-serif text-lg font-bold text-grounds-espresso mb-2">{b.title}</h3>
              <p className="text-sm text-grounds-brown/70">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="text-center mb-12">
          <span className="inline-block bg-grounds-gold/15 text-grounds-espresso text-sm font-medium px-4 py-2 rounded-full border border-grounds-gold/30">
            Early access — founding member pricing available
          </span>
        </div>

        {/* Waitlist form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-xl mx-auto">
          <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-2">Join the waitlist</h2>
          <p className="text-grounds-brown/60 text-sm mb-6">We&apos;re onboarding cafés city by city. Get early access and founding member pricing.</p>
          <form className="space-y-4">
            {[
              { name: "cafe", placeholder: "Café name" },
              { name: "email", placeholder: "Your email", type: "email" },
              { name: "city", placeholder: "City" },
              { name: "website", placeholder: "Website (optional)", type: "url" },
            ].map(f => (
              <input key={f.name} type={f.type ?? "text"} placeholder={f.placeholder}
                className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 bg-grounds-cream"
                style={{ minHeight: 44 }}
              />
            ))}
            <button type="submit"
              className="w-full bg-grounds-espresso text-grounds-cream font-medium py-3 rounded-xl hover:bg-grounds-brown transition-colors"
              style={{ minHeight: 44 }}>
              Request early access
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
