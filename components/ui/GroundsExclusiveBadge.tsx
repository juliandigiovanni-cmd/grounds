export function GroundsExclusiveBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium bg-grounds-espresso/90 text-grounds-cream px-2 py-0.5 rounded-full"
      title="This café exists only in the Grounds database — not found on Google Maps or Yelp"
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
        <circle cx="4" cy="4" r="3" />
      </svg>
      Grounds exclusive
    </span>
  );
}
