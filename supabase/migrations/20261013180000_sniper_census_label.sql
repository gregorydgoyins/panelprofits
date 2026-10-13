-- Read-only, additive: census lookup keyed on what is printed on the slab label (title, issue, cover date M/YY).
-- Returns every edition row for that issue+cover date; the caller picks the row whose variant equals the label edition
-- (no edition on the label = the base row, variant is null).
create or replace function public.sniper_census_label(p_keys jsonb)
returns table (k text, title text, issue_number text, issue_date text, year integer, publisher text, variant text, total integer, pop jsonb)
language sql stable parallel safe as $$
  select q.k, p.title, p.issue_number, p.issue_date, p.year, p.publisher, p.variant, p.total, p.pop
  from jsonb_to_recordset(p_keys) as q(k text, title text, issue text, date text)
  cross join lateral (
    select * from public.cgc_population c
    where c.is_base is true
      and public.cgc_norm_title(c.title) = public.cgc_norm_title(q.title)
      and public.cgc_norm_issue(c.issue_number) = public.cgc_norm_issue(q.issue)
      and c.issue_date = q.date
  ) p
$$;
grant execute on function public.sniper_census_label(jsonb) to service_role;
