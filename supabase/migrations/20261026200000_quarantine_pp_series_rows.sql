-- Quarantine public.pp_series_rows (50 columns, superseded by pp_series_rows_full). Moved intact, not dropped:
-- all rows kept. Restore with: alter table quarantine.pp_series_rows set schema public;
create schema if not exists quarantine;
revoke all on schema quarantine from anon, authenticated;
alter table public.pp_series_rows set schema quarantine;
