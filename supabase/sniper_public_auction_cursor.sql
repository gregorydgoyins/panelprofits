-- Operational pagination cursor only; auction facts remain in sniper_listings.
alter table public.sniper_vendor_fetch add column if not exists cursor_url text;
