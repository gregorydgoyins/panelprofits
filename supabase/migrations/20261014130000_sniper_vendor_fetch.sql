-- One row per (vendor, book): when it was last asked for sold sales and what came back, so a book is fetched at most once a week.
create table if not exists public.sniper_vendor_fetch (
  key text primary key,
  fetched_at timestamptz not null default now(),
  status text not null,
  http_status int,
  items int not null default 0,
  sales int not null default 0
);
alter table public.sniper_vendor_fetch enable row level security;
