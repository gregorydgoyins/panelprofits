-- Videos found for a book (YouTube search costs 100 of the 10,000 daily quota units, so answers are kept 14 days).
create table if not exists public.sniper_video_cache (
  key text primary key,
  videos jsonb not null,
  fetched_at timestamptz not null default now()
);
alter table public.sniper_video_cache enable row level security;
