-- Add content moderation fields (if not already in cafes table)
alter table public.cafes add column if not exists flag_count integer default 0;

-- Create flag reports table
create table if not exists public.flag_reports (
  id uuid default uuid_generate_v4() primary key,
  cafe_id uuid references public.cafes(id) on delete cascade,
  reason text not null,
  reporter_ip text,
  created_at timestamptz default now()
);

-- Create cookie consent table for audit trail (optional but useful for GDPR)
create table if not exists public.consent_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  decision text check (decision in ('accepted','declined')) not null,
  eu_user boolean default false,
  created_at timestamptz default now()
);

-- RLS for flag reports (anyone can insert, only admins can read)
alter table public.flag_reports enable row level security;
create policy "Anyone can report" on public.flag_reports for insert with check (true);

-- Function to auto-set verified=false at 3+ reports
create or replace function public.check_flag_threshold()
returns trigger as $$
begin
  update public.cafes
  set verified = false, flagged = true
  where id = NEW.cafe_id
  and (select count(*) from public.flag_reports where cafe_id = NEW.cafe_id) >= 3;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_flag_report
  after insert on public.flag_reports
  for each row execute procedure public.check_flag_threshold();
