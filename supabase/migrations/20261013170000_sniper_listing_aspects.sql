-- Additive: exact label fields captured once per listing from the seller's own item specifics (cert, series, issue,
-- publication year, publisher, edition) so Sniper joins the census on stored fields instead of parsing titles.
alter table public.sniper_listings add column if not exists pub_year integer;
alter table public.sniper_listings add column if not exists publisher text;
alter table public.sniper_listings add column if not exists edition text;
alter table public.sniper_listings add column if not exists aspects_at timestamptz;
create index if not exists sniper_listings_aspects_pending_idx on public.sniper_listings (item_id) where aspects_at is null;
