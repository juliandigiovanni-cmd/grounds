export function SponsoredBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium text-grounds-gold border border-grounds-gold/40 bg-grounds-gold/10 px-2 py-0.5 rounded-full"
      title="Featured Roaster — sponsored placement. Grounds Score is unaffected."
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="text-grounds-gold" aria-hidden="true">
        <path d="M4 0L4.9 2.8H8L5.6 4.5L6.5 7.3L4 5.6L1.5 7.3L2.4 4.5L0 2.8H3.1L4 0Z" />
      </svg>
      Featured Roaster
    </span>
  );
}
