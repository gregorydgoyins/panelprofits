create schema if not exists quarantine;
revoke all on schema quarantine from anon, authenticated;
alter table public.fandom_issue set schema quarantine;
alter table public.pp_canonical_identity_reconciliation set schema quarantine;
alter table public.pp_gcd_link_staging set schema quarantine;
alter table public.rail_equities_prev_20261006 set schema quarantine;
alter table public.mid_tier_clients set schema quarantine;
comment on schema quarantine is 'Tables moved out of public with no code, view, function, trigger or FK dependents. Reversible: ALTER TABLE quarantine.<t> SET SCHEMA public. Drop only on explicit approval.';
