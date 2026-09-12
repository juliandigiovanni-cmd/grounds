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
  cntraveler: {
    label: "Condé Nast Traveler",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    tooltip: "Featured in Condé Nast Traveler — luxury travel authority",
  },
  roast_magazine: {
    label: "★ Roast Magazine",
    className: "bg-amber-900 text-amber-50 border-amber-900",
    tooltip: "Named Roaster of the Year by Roast Magazine — the trade publication for coffee roasters",
  },
  worlds_100_best: {
    label: "★ World's 100 Best",
    className: "bg-emerald-900 text-emerald-50 border-emerald-900",
    tooltip: "Ranked in The World's 100 Best Coffee Shops — the annual global list judged by coffee professionals",
  },
  european_coffee_trip: {
    label: "European Coffee Trip",
    className: "bg-teal-50 text-teal-800 border-teal-100",
    tooltip: "Featured by European Coffee Trip — the specialty café guide to Europe",
  },
  barista_magazine: {
    label: "Barista Magazine",
    className: "bg-stone-100 text-stone-800 border-stone-200",
    tooltip: "Featured in Barista Magazine — the magazine for coffee professionals",
  },
  perfect_daily_grind: {
    label: "Perfect Daily Grind",
    className: "bg-lime-50 text-lime-800 border-lime-100",
    tooltip: "Featured by Perfect Daily Grind — specialty coffee news and education",
  },
  daily_coffee_news: {
    label: "Daily Coffee News",
    className: "bg-yellow-50 text-yellow-800 border-yellow-100",
    tooltip: "Covered by Daily Coffee News — Roast Magazine's coffee industry news site",
  },
  tastet: {
    label: "Tastet",
    className: "bg-sky-50 text-sky-800 border-sky-100",
    tooltip: "Reviewed by Tastet — Montreal's independent restaurant and café guide",
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
