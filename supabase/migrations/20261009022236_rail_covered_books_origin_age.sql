alter table public.rail_covered_books add column if not exists age text, add column if not exists origin_year int, add column if not exists origin_era text, add column if not exists origin_basis text;
create or replace function public.pp_fill_rail_origin(k int) returns int language plpgsql as $f$
declare n int;
begin
update rail_covered_books r set
  age = pp_era(r.year),
  origin_year = coalesce(o.issue1_year, o.gcd_year_began, o.min_year),
  origin_era = pp_era(coalesce(o.issue1_year, o.gcd_year_began, o.min_year)),
  origin_basis = case when o.issue1_year is not null then 'issue_1' when o.gcd_year_began is not null then 'gcd_series_year_began' when o.min_year is not null then 'earliest_dated_issue' end
from comics c join rail_series_origin o on o.series=c.series and o.volume=coalesce(c.volume,'')
where c.id=r.comics_id and abs(hashtext(r.gcs_key))%20=k;
get diagnostics n = row_count; return n; end $f$;
