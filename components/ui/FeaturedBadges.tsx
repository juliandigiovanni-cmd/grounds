import type { FeaturedIn } from "@/types";

const BADGE_CONFIG: Record<FeaturedIn, { label: string; className: string; tooltip: string }> = {
  sprudge: {
    label: "★ Sprudge",
    className: "bg-grounds-espresso text-grounds-cream border-grounds-espresso",
    tooltip: "Featured by Sprudge — the world's leading specialty coffee publication",
  },
  standart: {
    label: "★ Standart",
    className: "bg-slate-700 text-white border-slate-700",
    tooltip: "Featured in Standart Magazine — curated quarterly for coffee professionals",
  },
  monocle: {
    label: "Monocle",
    className: "bg-black text-white border-black",
    tooltip: "Recommended by Monocle — global quality of life authority",
  },
  atlas: {
    label: "Atlas",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    tooltip: "Listed in Atlas Coffee Guide — specialty shop discovery platform",
  },
  guardian: {
    label: "Guardian",
    className: "bg-blue-50 text-blue-800 border-blue-100",
    tooltip: "Recommended by The Guardian — UK's leading quality newspaper",
  },
  ny_times: {
    label: "NYT",
    className: "bg-gray-100 text-gray-900 border-gray-200",
    tooltip: "Featured in The New York Times — flagship US news and culture coverage",
  },
  infatuation: {
    label: "Infatuation",
    className: "bg-red-50 text-red-700 border-red-100",
    tooltip: "Reviewed by The Infatuation — trusted restaurant and café guide",
  },
  eater: {
    label: "Eater",
    className: "bg-orange-50 text-orange-700 border-orange-100",
    tooltip: "Covered by Eater — essential food and drink news network",
  },
  timeout: {
    label: "Time Out",
    className: "bg-rose-50 text-rose-700 border-rose-100",
    tooltip: "In Time Out — global city guide for culture and nightlife",
  },
};

interface Props {
  featured: FeaturedIn[];
}

export function FeaturedBadges({ featured }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {featured.map(f => {
        const config = BADGE_CONFIG[f];
        if (!config) return null;
        return (
          <span
            key={f}
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${config.className}`}
            title={config.tooltip}
          >
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
