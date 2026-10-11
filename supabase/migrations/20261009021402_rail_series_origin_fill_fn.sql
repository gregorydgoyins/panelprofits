create or replace function public.pp_fill_series_origin(k int) returns int language plpgsql as $f$
declare n int;
begin
with t as (select series, volume from rail_series_origin where basis is null and abs(hashtext(series||'|'||volume))%40=k),
u as (select t.series, t.volume,
  (select min(c.publication_year) from comics c where c.series=t.series and coalesce(c.volume,'')=t.volume and c.issue_number ~ '^0*1$' and c.publication_year is not null) i1,
  (select min(case when c.gcd_data->>'GCD - gcd_series.year_began' ~ '^\d{4}$' then (c.gcd_data->>'GCD - gcd_series.year_began')::int end) from comics c where c.series=t.series and coalesce(c.volume,'')=t.volume and c.gcd_data is not null) gy,
  (select min(c.publication_year) from comics c where c.series=t.series and coalesce(c.volume,'')=t.volume and c.publication_year is not null) my
 from t)
update rail_series_origin o set issue1_year=u.i1, gcd_year_began=u.gy, min_year=u.my,
  basis=case when u.i1 is not null then 'issue_1' when u.gy is not null then 'gcd_series_year_began' when u.my is not null then 'earliest_dated_issue' else 'none' end
from u where o.series=u.series and o.volume=u.volume;
get diagnostics n = row_count; return n; end $f$;
