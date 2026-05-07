export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl font-bold text-grounds-espresso mb-2">Submit a Café</h1>
        <p className="text-grounds-brown/70 mb-8">Know a great specialty café we should feature? Tell us about it.</p>
        <form className="space-y-6">
          {[
            { id: "name", label: "Café Name", placeholder: "Stumptown Coffee" },
            { id: "city", label: "City", placeholder: "Portland, OR" },
            { id: "address", label: "Address", placeholder: "4525 SE Division St" },
            { id: "website", label: "Website", placeholder: "https://...", type: "url" },
            { id: "instagram", label: "Instagram Handle", placeholder: "@..." },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-grounds-espresso mb-1">{f.label}</label>
              <input id={f.id} type={f.type ?? "text"} placeholder={f.placeholder}
                className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 bg-white"
                style={{ minHeight: 44 }}
              />
            </div>
          ))}
          <div>
            <label htmlFor="blurb" className="block text-sm font-medium text-grounds-espresso mb-1">Why is it worth the detour? (optional)</label>
            <textarea id="blurb" rows={3} placeholder="Lead with what makes it special..."
              className="w-full border border-grounds-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-grounds-gold/50 bg-white resize-none"
            />
          </div>
          <button type="submit"
            className="w-full bg-grounds-espresso text-grounds-cream font-medium py-3 px-6 rounded-xl hover:bg-grounds-brown transition-colors"
            style={{ minHeight: 44 }}>
            Submit for Review
          </button>
        </form>
      </div>
    </div>
  );
}
