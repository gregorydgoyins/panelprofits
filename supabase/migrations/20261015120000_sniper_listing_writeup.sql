-- One researched write-up per edition (synopsis + collector case), written from web search results and kept 30 days.
create table if not exists public.sniper_listing_writeup (
  key text primary key,
  title text not null,
  content jsonb,
  written_at timestamptz,
  failed_at timestamptz
);
alter table public.sniper_listing_writeup enable row level security;
