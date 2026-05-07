export type BrewMethod = 'espresso' | 'pour-over' | 'aeropress' | 'cold-brew' | 'syphon' | 'french-press' | 'chemex';

export type VibeTags = 'laptop-friendly' | 'no-laptop' | 'standing-bar' | 'outdoor-seating' | 'dog-friendly' | 'roastery-on-site' | 'minimalist' | 'coworking';

export type FeaturedIn = 'sprudge' | 'standart' | 'monocle' | 'atlas' | 'guardian' | 'ny_times' | 'infatuation' | 'eater' | 'timeout';

export type ReviewSource = 'google' | 'yelp' | 'foursquare' | 'manual';

export type VerificationSource = 'admin' | 'community' | 'google_places_api' | 'automated';

export interface Cafe {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  address: string;
  roaster?: string;
  brew_methods: BrewMethod[];
  vibe_tags: VibeTags[];
  google_place_id?: string;
  instagram_handle?: string;
  website?: string;
  editorial_blurb: string;
  featured_in: FeaturedIn[];
  verified: boolean;
  submitted_by?: string;
  created_at: string;
  third_wave_score?: number;
  overall_rating?: number;
  review_count?: number;
  last_verified_at?: string;
  verification_source?: VerificationSource;
  permanently_closed: boolean;
  closure_reported_at?: string;
  flagged?: boolean;
  flag_reason?: string;
  sponsored?: boolean;
  sponsor_roaster_id?: string;
  verified_paid?: boolean;
  affiliate_links?: { beans_url?: string; gear_url?: string };
}

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  cafe_count: number;
  hero_image_url?: string;
  city_blurb: string;
  slug: string;
}

export interface Review {
  id: string;
  cafe_id: string;
  source: ReviewSource;
  rating: number;
  text: string;
  author: string;
  url?: string;
  created_at: string;
}

export interface AggregateScore {
  cafe_id: string;
  third_wave_score: number;
  overall_rating: number;
  review_count: number;
  last_updated: string;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface SavedCafe {
  id: string;
  user_id: string;
  cafe_id: string;
  created_at: string;
}

export interface ScoreBreakdown {
  roaster_identity: number;
  brew_methods: number;
  no_chain: number;
  featured_in: number;
  community_upvotes: number;
  roastery_on_site: number;
  total: number;
}
