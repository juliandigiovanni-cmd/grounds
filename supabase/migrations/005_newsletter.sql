-- Newsletter subscribers
create table public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  source text default 'unknown', -- 'sidebar', 'mobile', 'submit_form', etc.
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;

-- Only service role can read/write
create policy "Service role only"
  on public.newsletter_subscribers
  for all
  using (false);
