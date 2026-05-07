-- Freshness and closure fields (add if not already present from initial schema)
alter table public.cafes
  add column if not exists last_verified_at timestamptz,
  add column if not exists verification_source text check (verification_source in ('admin','community','google_places_api','automated')),
  add column if not exists permanently_closed boolean default false,
  add column if not exists closure_reported_at timestamptz,
  add column if not exists temporarily_closed boolean default false;

-- Community verification votes table
create table if not exists public.verification_votes (
  id uuid default uuid_generate_v4() primary key,
  cafe_id uuid references public.cafes(id) on delete cascade,
  vote text check (vote in ('yes','no')) not null,
  voter_ip text,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  -- Prevent double voting from same IP within 30 days (rough dedup)
  unique(cafe_id, voter_ip)
);

alter table public.verification_votes enable row level security;
create policy "Anyone can vote" on public.verification_votes
  for insert with check (true);

-- Function: update last_verified_at when 3 'yes' votes received
create or replace function public.check_verification_threshold()
returns trigger as $$
declare
  yes_count integer;
  no_count integer;
begin
  select count(*) into yes_count
  from public.verification_votes
  where cafe_id = NEW.cafe_id and vote = 'yes';

  select count(*) into no_count
  from public.verification_votes
  where cafe_id = NEW.cafe_id and vote = 'no';

  if yes_count >= 3 then
    update public.cafes
    set last_verified_at = now(), verification_source = 'community'
    where id = NEW.cafe_id;
  elsif no_count >= 3 then
    update public.cafes
    set verified = false, flagged = true, flag_reason = 'Community reports: possibly closed'
    where id = NEW.cafe_id;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_verification_vote
  after insert on public.verification_votes
  for each row execute procedure public.check_verification_threshold();

-- Index for freshness queries
create index if not exists idx_cafes_verification on public.cafes(last_verified_at, permanently_closed);
