import type { Cafe, ScoreBreakdown, FeaturedIn } from '@/types';

function calcFeaturedInScore(featured: FeaturedIn[]): number {
  if (featured.some(f => ['sprudge', 'standart', 'roast_magazine', 'worlds_100_best'].includes(f))) return 15;
  if (featured.some(f => ['guardian', 'ny_times', 'eater', 'infatuation', 'european_coffee_trip', 'barista_magazine', 'perfect_daily_grind', 'daily_coffee_news'].includes(f))) return 10;
  if (featured.some(f => ['timeout', 'atlas', 'monocle', 'tastet', 'broadsheet'].includes(f))) return 5;
  return 0;
}

export function calculateScore(cafe: Partial<Cafe> & {
  roaster?: string;
  brew_methods: string[];
  vibe_tags: string[];
  featured_in: string[];
  community_upvotes?: number;
}): ScoreBreakdown {
  const roaster_identity = cafe.roaster ? 25 : 0;

  const altBrews = ['pour-over', 'aeropress', 'syphon', 'chemex', 'french-press', 'cold-brew'];
  const brew_methods = cafe.brew_methods.some(m => altBrews.includes(m)) ? 20 : 0;

  const no_chain = 20; // All curated cafes are independent; chain check would happen at submission

  const featured_in = calcFeaturedInScore(cafe.featured_in as FeaturedIn[]);

  const community_upvotes = Math.min(cafe.community_upvotes ?? 0, 10);

  // Café is run by a coffee roaster (e.g. 49th Parallel, Pilot) — wherever the roasting happens
  const roaster_family = cafe.roaster_family ? 10 : 0;

  const total = roaster_identity + brew_methods + no_chain + featured_in + community_upvotes + roaster_family;

  return {
    roaster_identity,
    brew_methods,
    no_chain,
    featured_in,
    community_upvotes,
    roaster_family,
    total: Math.min(total, 100),
  };
}

export function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e'; // green-500
  if (score >= 70) return '#C8972A'; // grounds gold
  if (score >= 55) return '#f97316'; // orange-500
  return '#94a3b8'; // slate-400
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Exceptional';
  if (score >= 70) return 'Very Good';
  if (score >= 55) return 'Good';
  return 'Unrated';
}
