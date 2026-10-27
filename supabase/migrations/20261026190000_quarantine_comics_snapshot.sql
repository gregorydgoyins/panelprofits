-- Full snapshot of public.comics (untranslated PriceCharting-shaped data) into a private schema.
-- Non-destructive: public.comics and panel_profits_comics are unchanged and still live.
create schema if not exists quarantine;
revoke all on schema quarantine from anon, authenticated;
create table if not exists quarantine.comics_20261026 as table public.comics;
alter table quarantine.comics_20261026 enable row level security;
revoke all on quarantine.comics_20261026 from anon, authenticated;
