-- Adds publisher to the PSA lookup result so multi-volume titles can be disambiguated by publisher + cover year.
drop function if exists public.sniper_census_psa(jsonb);
create function public.sniper_census_psa(p_keys jsonb)
returns table (k text, title text, issue_number text, series_year integer, publisher text, total integer, grades jsonb)
language sql stable parallel safe as $$
  select q.k, p.title, p.issue_number, p.series_year, p.publisher, p.total, p.grades
  from jsonb_to_recordset(p_keys) as q(k text, title text, issue text)
  cross join lateral (
    select * from public.psa_population c
    where public.cgc_norm_title(c.title) = public.cgc_norm_title(q.title)
      and public.cgc_norm_issue(c.issue_number) = public.cgc_norm_issue(q.issue)
  ) p
$$;
grant execute on function public.sniper_census_psa(jsonb) to service_role;
