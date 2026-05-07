-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Cities table
create table public.cities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  country text not null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  cafe_count integer default 0,
  hero_image_url text,
  city_blurb text,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Cafes table
create table public.cafes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  city text not null,
  country text not null,
  address text,
  roaster text,
  brew_methods text[] default '{}',
  vibe_tags text[] default '{}',
  google_place_id text,
  instagram_handle text,
  website text,
  editorial_blurb text,
  featured_in text[] default '{}',
  verified boolean default false,
  submitted_by uuid references auth.users(id),
  created_at timestamptz default now(),
  last_verified_at timestamptz,
  verification_source text check (verification_source in ('admin','community','google_places_api','automated')),
  permanently_closed boolean default false,
  closure_reported_at timestamptz,
  flagged boolean default false,
  flag_reason text,
  sponsored boolean default false,
  sponsor_roaster_id uuid,
  verified_paid boolean default false,
  affiliate_links jsonb default '{}'
);

-- Reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  cafe_id uuid references public.cafes(id) on delete cascade,
  source text check (source in ('google','yelp','foursquare','manual')) not null,
  rating numeric(3,1),
  text text,
  author text,
  url text,
  created_at timestamptz default now()
);

-- Aggregate scores table
create table public.aggregate_scores (
  cafe_id uuid references public.cafes(id) on delete cascade primary key,
  third_wave_score integer check (third_wave_score between 0 and 100),
  overall_rating numeric(3,1),
  review_count integer default 0,
  last_updated timestamptz default now()
);

-- Saved cafes table
create table public.saved_cafes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  cafe_id uuid references public.cafes(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, cafe_id)
);

-- Verified cafe waitlist
create table public.verified_waitlist (
  id uuid default uuid_generate_v4() primary key,
  cafe_name text not null,
  email text not null,
  city text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.cafes enable row level security;
alter table public.reviews enable row level security;
alter table public.saved_cafes enable row level security;
alter table public.cities enable row level security;

-- Public read access for cafes and cities
create policy "Public can read cafes" on public.cafes for select using (true);
create policy "Public can read cities" on public.cities for select using (true);
create policy "Public can read reviews" on public.reviews for select using (true);
create policy "Public can read scores" on public.aggregate_scores for select using (true);

-- Authenticated users can manage their saved cafes
create policy "Users manage own saved cafes" on public.saved_cafes
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index idx_cafes_city on public.cafes(city);
create index idx_cafes_slug on public.cafes(slug);
create index idx_cafes_score on public.aggregate_scores(third_wave_score desc);
