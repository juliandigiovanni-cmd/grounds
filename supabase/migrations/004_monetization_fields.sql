-- Sponsorship and verified program fields
alter table public.cafes
  add column if not exists sponsored boolean default false,
  add column if not exists sponsor_roaster_id uuid,
  add column if not exists verified_paid boolean default false,
  add column if not exists affiliate_links jsonb default '{}';

-- Verified cafe waitlist
create table if not exists public.verified_waitlist (
  id uuid default uuid_generate_v4() primary key,
  cafe_name text not null,
  email text not null,
  city text,
  website text,
  created_at timestamptz default now()
);

-- Advertiser inquiries
create table if not exists public.advertiser_inquiries (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  company text,
  message text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_cafes_sponsored on public.cafes(sponsored) where sponsored = true;
create index if not exists idx_cafes_verified_paid on public.cafes(verified_paid) where verified_paid = true;
