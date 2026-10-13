-- Same lookup, but the edition is matched inside SQL (label edition = variant, no edition = base row) so a batch can
-- never overflow the 1000-row API cap on issues that have dozens of edition rows.
create or replace function public.sniper_census_label(p_keys jsonb)
returns table (k text, title text, issue_number text, issue_date text, year integer, publisher text, variant text, total integer, pop jsonb)
language sql stable parallel safe as $$
  select q.k, p.title, p.issue_number, p.issue_date, p.year, p.publisher, p.variant, p.total, p.pop
  from jsonb_to_recordset(p_keys) as q(k text, title text, issue text, date text, edition text)
  cross join lateral (
    select * from public.cgc_population c
    where c.is_base is true
      and public.cgc_norm_title(c.title) = public.cgc_norm_title(q.title)
      and public.cgc_norm_issue(c.issue_number) = public.cgc_norm_issue(q.issue)
      and c.issue_date = q.date
      and case when coalesce(btrim(q.edition), '') = '' then c.variant is null
               else lower(regexp_replace(coalesce(c.variant, ''), '[^a-zA-Z0-9]+', '', 'g'))
                  = lower(regexp_replace(q.edition, '[^a-zA-Z0-9]+', '', 'g')) end
  ) p
$$;
grant execute on function public.sniper_census_label(jsonb) to service_role;
