-- Read-only, additive: PSA census lookup by normalized title + issue (all series volumes returned; caller applies the year rule).
create or replace function public.sniper_census_psa(p_keys jsonb)
returns table (k text, title text, issue_number text, series_year integer, total integer, grades jsonb)
language sql stable parallel safe as $$
  select q.k, p.title, p.issue_number, p.series_year, p.total, p.grades
  from jsonb_to_recordset(p_keys) as q(k text, title text, issue text)
  cross join lateral (
    select * from public.psa_population c
    where public.cgc_norm_title(c.title) = public.cgc_norm_title(q.title)
      and public.cgc_norm_issue(c.issue_number) = public.cgc_norm_issue(q.issue)
  ) p
$$;
grant execute on function public.sniper_census_psa(jsonb) to service_role;
