-- CGC Population Report census, one row per CGC population record (issue/variant).
create table if not exists public.cgc_population (
  population_id bigint primary key,
  group_id integer not null,
  subcategory_id integer,
  publisher text,
  title text not null,
  issue_number text,
  issue_date text,
  year integer,
  variant text,
  is_base boolean,
  master_id text,
  total integer not null default 0,
  pop_9_0_plus integer not null default 0,
  pop jsonb not null,
  source_modified_at timestamptz,
  fetched_at timestamptz not null default now()
);
create index if not exists cgc_population_group_idx on public.cgc_population (group_id);
create index if not exists cgc_population_title_issue_idx on public.cgc_population (lower(title), issue_number, year);
alter table public.cgc_population enable row level security;
