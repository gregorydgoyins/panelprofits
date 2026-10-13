-- Additive: GoCollect sales/price data captured per book, grader, label type and grade.
-- Each grader/label has its own values; nothing here converts one grader's price into another's.
create table if not exists public.gocollect_books (
  slug text primary key,
  item_id bigint,
  title text,
  issue_number text,
  publisher text,
  cover_date text,
  captured_at timestamptz not null default now()
);
create table if not exists public.gocollect_prices (
  slug text not null references public.gocollect_books(slug) on delete cascade,
  grader text not null,            -- cgc | cbcs | psa
  label_type text not null,        -- as GoCollect names it: Universal, Signature, Certified/Blue, Signed, Standard, ...
  grade text not null,             -- e.g. 9.8
  census integer,                  -- null = GoCollect shows N/A (no census)
  sales_count integer,
  last_sold_date date,
  last_sold_price numeric,
  fmv numeric,                     -- GoCollect FMV where shown (CGC), else null
  avg_1y numeric, n_1y integer,
  avg_90d numeric, n_90d integer,
  avg_30d numeric, n_30d integer,
  source text not null default 'gocollect',
  captured_at timestamptz not null default now(),
  primary key (slug, grader, label_type, grade)
);
create index if not exists gocollect_books_item_idx on public.gocollect_books (lower(title), issue_number);
alter table public.gocollect_books enable row level security;
alter table public.gocollect_prices enable row level security;
create policy "gocollect_books read" on public.gocollect_books for select using (true);
create policy "gocollect_prices read" on public.gocollect_prices for select using (true);
