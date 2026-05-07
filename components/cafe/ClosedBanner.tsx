interface Props {
  closureDate?: string;
}

export function ClosedBanner({ closureDate }: Props) {
  const date = closureDate
    ? new Date(closureDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
      <span className="text-xl">🚫</span>
      <div>
        <p className="text-sm font-semibold text-red-700">Permanently Closed</p>
        {date && (
          <p className="text-xs text-red-500">Closed as of {date}</p>
        )}
        <p className="text-xs text-red-400 mt-0.5">Archived for reference — this café is no longer operating.</p>
      </div>
    </div>
  );
}
