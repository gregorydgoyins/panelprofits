-- Additive: PSA comics population report, one row per publisher + series/issue as printed by PSA.
-- PSA publishes no cover date or edition column, so the match key is title + issue + series year.
create table if not exists public.psa_population (
  id bigint generated always as identity primary key,
  publisher text not null,
  series_raw text not null,
  title text,
  issue_number text,
  series_year integer,
  grades jsonb not null,          -- e.g. {"9.8": 12, "9.6": 3, "AU": 1}; keys as printed by PSA
  total integer not null,
  captured_at timestamptz not null default now(),
  unique (publisher, series_raw)
);
create index if not exists psa_population_norm_idx
  on public.psa_population (public.cgc_norm_title(title), public.cgc_norm_issue(issue_number));
alter table public.psa_population enable row level security;
create policy "psa_population read" on public.psa_population for select using (true);
