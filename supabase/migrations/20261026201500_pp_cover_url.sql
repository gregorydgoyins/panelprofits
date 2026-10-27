-- Port the cover link for each pp comic into its own column on pp_series_rows_full.
-- Source: quarantine.comics_20261026.highres_cover_url, matched on id = pp_id. Empty links stay null; the few links that look
-- like placeholder images (no real cover) are not copied, so a missing cover stays missing.
begin;
set local statement_timeout = '900s';
alter table public.pp_series_rows_full add column if not exists pp_cover_url text;
update public.pp_series_rows_full f
   set pp_cover_url = c.highres_cover_url
  from quarantine.comics_20261026 c
 where c.id = f.pp_id::text
   and f.pp_cover_url is null
   and btrim(coalesce(c.highres_cover_url,'')) <> ''
   and c.highres_cover_url ~* '^https?://'
   and c.highres_cover_url !~* '(placeholder|no[-_ ]?image|dummy|example\.com|lorem|via\.placeholder)';
commit;
