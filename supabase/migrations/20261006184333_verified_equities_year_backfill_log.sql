create table public.verified_equities_year_backfill_log (
  id bigint generated always as identity primary key,
  verified_equities_id text not null,
  source_product_id text not null,
  old_publication_year int,
  new_publication_year int not null,
  year_source text not null default 'pp_series_rows.pp_publication_year',
  applied_at timestamptz not null default now()
);
alter table public.verified_equities_year_backfill_log enable row level security;
comment on table public.verified_equities_year_backfill_log is 'Audit of publication_year values filled into verified_equities where it was NULL. Revert: update verified_equities set publication_year=null where id in (select verified_equities_id from this table).';
