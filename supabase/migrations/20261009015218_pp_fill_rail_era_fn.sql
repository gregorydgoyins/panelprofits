create or replace function public.pp_fill_rail_era(k int) returns int language plpgsql as $f$
declare n int;
begin
with s as (
 select r.gcs_key,
  coalesce(r.year, c.publication_year) y0,
  case when c.gcd_data->>'GCD - gcd_series.year_began' ~ '^\d{4}$' then (c.gcd_data->>'GCD - gcd_series.year_began')::int end yb,
  case when c.gcd_data->>'GCD - gcd_series.year_ended' ~ '^\d{4}$' then (c.gcd_data->>'GCD - gcd_series.year_ended')::int end ye,
  c.direct_or_variant dov, c.printing pr, nullif(btrim(c.cover_variant),'') cv
 from rail_covered_books r join comics c on c.id=r.comics_id
 where abs(hashtext(r.gcs_key))%20=k
), d as (
 select gcs_key, coalesce(y0, case when yb is not null and ye=yb then yb end) y,
  case when y0 is not null then 'source_date' when yb is not null and ye=yb then 'gcd_series_single_year' end yb_basis, yb, ye, dov, pr, cv from s
)
update rail_covered_books r set year=d.y, year_basis=d.yb_basis,
  era=coalesce(pp_era(d.y), case when d.yb is not null and d.ye is not null and pp_era(d.yb)=pp_era(d.ye) then pp_era(d.yb) end),
  era_basis=case when d.y is not null then 'year' when d.yb is not null and d.ye is not null and pp_era(d.yb)=pp_era(d.ye) then 'gcd_series_range' end,
  edition_form=case when lower(coalesce(d.dov,'')) like '%news%' then 'NEWSSTAND' when lower(coalesce(d.dov,'')) like '%variant%' or d.cv is not null then 'VARIANT' when coalesce(nullif(d.pr,''),'1') not in ('1','1st') then 'REPRINT' else 'DIRECT' end,
  printing=nullif(d.pr,''), variant_label=d.cv
from d where d.gcs_key=r.gcs_key;
get diagnostics n = row_count; return n; end $f$;
