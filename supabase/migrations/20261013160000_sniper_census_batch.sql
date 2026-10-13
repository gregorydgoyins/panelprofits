-- Read-only, additive: batch census lookup for Sniper using the existing normalized-title/issue partial index.
-- Base edition only (variant is null): CGC lists every edition as its own row, so editions are never mixed in.
-- Returns every matching volume so the caller can require an exact year match.
create or replace function public.sniper_census_batch(p_keys jsonb)
returns table (k text, title text, issue_number text, year integer, total integer, pop jsonb)
language sql stable parallel safe as $$
  select q.k, p.title, p.issue_number, p.year, p.total, p.pop
  from jsonb_to_recordset(p_keys) as q(k text, title text, issue text)
  cross join lateral (
    select * from public.cgc_population c
    where c.is_base is true
      and public.cgc_norm_title(c.title) = public.cgc_norm_title(q.title)
      and public.cgc_norm_issue(c.issue_number) = public.cgc_norm_issue(q.issue)
      and c.variant is null
  ) p
$$;
grant execute on function public.sniper_census_batch(jsonb) to service_role;
