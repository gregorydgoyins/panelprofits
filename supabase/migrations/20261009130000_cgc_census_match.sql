-- Match CGC population census to rail books (additive).
-- cgc_norm_title: lowercase, drop "(...)" qualifiers, trailing ", The", leading article, & -> and, alnum only.
create or replace function public.cgc_norm_title(t text) returns text language sql immutable parallel safe as $$
  select regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(lower(coalesce(t,'')), '\s*\([^)]*\)', '', 'g'),
    ',\s*(the|a|an)\s*$', '', 'g'), '^(the|a|an)\s+', '', 'g'), '&', ' and ', 'g'), '[^a-z0-9]+', '', 'g') $$;
create or replace function public.cgc_norm_issue(n text) returns text language sql immutable parallel safe as $$
  select regexp_replace(regexp_replace(lower(coalesce(n,'')), '^[#\s]+', ''), '^0+(?=[0-9])', '') $$;
create index if not exists cgc_population_norm_idx on public.cgc_population (public.cgc_norm_title(title), public.cgc_norm_issue(issue_number)) where is_base is true;
create table if not exists public.rail_cgc_census (
  gcs_key text primary key,
  population_id bigint not null references public.cgc_population(population_id),
  cgc_total integer not null,
  cgc_pop_9_0_plus integer not null,
  match_basis text not null,
  matched_at timestamptz not null default now());
alter table public.rail_cgc_census enable row level security;
alter table public.rail_covered_books add column if not exists cgc_pop_9_0_plus integer;
