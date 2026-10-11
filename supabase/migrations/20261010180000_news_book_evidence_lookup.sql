-- Real price evidence for one key issue, one row per source kept separate. No estimation.
create index if not exists rail_books_series_issue_lower on public.rail_books (lower(series), issue_number);

create or replace function public.news_book_evidence(p_series text, p_issue text)
returns table (
  comics_id text, series text, issue_number text, year integer,
  pp_ladder jsonb, cb_price numeric, cb_values jsonb, gc_prices jsonb, cgc_total integer
)
language sql stable
as $$
  select r.comics_id, r.series, r.issue_number, r.year, r.pp_ladder, r.cb_price, r.cb_values, r.gc_prices, r.cgc_total
  from public.rail_books r
  where lower(r.series) = lower(p_series)
    and r.issue_number = p_issue
    and coalesce(r.printing, '1') = '1'
    and coalesce(r.edition_form, 'DIRECT') <> 'VARIANT'
    and r.variant_label is null
  order by (r.pp_ladder is not null) desc, r.year asc nulls last
  limit 3;
$$;
