create table if not exists public.cgc_title_scarcity (
  group_id integer primary key,
  title text,
  publisher text,
  issues integer not null,
  copies bigint not null,
  avg_grade numeric(4,2),
  mean_copies_per_issue numeric(12,2),
  high_copies bigint,
  mean_high_copies_per_issue numeric(12,2),
  computed_at timestamptz not null default now()
);
create table if not exists public.cgc_issue_scarcity (
  population_id bigint primary key references public.cgc_population(population_id),
  group_id integer not null,
  total integer not null,
  avg_grade numeric(4,2),
  copies_at_or_above_series_avg integer,
  ratio_to_series_mean numeric(10,4),
  cume_rank_in_series numeric(8,6),
  series_issues integer,
  computed_at timestamptz not null default now()
);
create index if not exists cgc_issue_scarcity_group_idx on public.cgc_issue_scarcity(group_id);
alter table public.cgc_title_scarcity enable row level security;
alter table public.cgc_issue_scarcity enable row level security;
