-- Read-only, additive: join slabs to GoCollect realized-sale prices for the SAME grader + label type + grade.
create index if not exists gocollect_books_norm_idx on public.gocollect_books (public.cgc_norm_title(title), public.cgc_norm_issue(issue_number));
create or replace function public.sniper_gocollect_batch(p_keys jsonb)
returns table (k text, slug text, title text, grader text, label_type text, grade text, sales_count integer,
               last_sold_date date, last_sold_price numeric, fmv numeric, avg_1y numeric, n_1y integer, avg_90d numeric, n_90d integer, avg_30d numeric, n_30d integer)
language sql stable parallel safe as $$
  select q.k, b.slug, b.title, p.grader, p.label_type, p.grade, p.sales_count, p.last_sold_date, p.last_sold_price, p.fmv,
         p.avg_1y, p.n_1y, p.avg_90d, p.n_90d, p.avg_30d, p.n_30d
  from jsonb_to_recordset(p_keys) as q(k text, title text, issue text, date text, grader text, label text, grade text)
  join public.gocollect_books b
    on public.cgc_norm_title(b.title) = public.cgc_norm_title(q.title)
   and public.cgc_norm_issue(b.issue_number) = public.cgc_norm_issue(q.issue)
   and (coalesce(q.date, '') = '' or b.cover_date = q.date)
  join public.gocollect_prices p
    on p.slug = b.slug and p.grader = lower(q.grader) and lower(p.label_type) = lower(q.label) and p.grade = q.grade
$$;
grant execute on function public.sniper_gocollect_batch(jsonb) to service_role;
