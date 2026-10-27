-- GoCollect CPI book lists. public.gocollect_cpi_books was referenced by gocollect_cpi_apply()
-- (20261010150000) but never created, so every weekly RPC call failed and the cron silently fell
-- back to upserting only index values. Additive and idempotent; no existing data is touched.
create table if not exists public.gocollect_cpi_books (
  id uuid primary key default gen_random_uuid(),
  age_category text not null,
  index_slug text,
  title text not null,
  gocollect_item_id text,
  gocollect_url text,
  is_active boolean not null default true,
  date_added date,
  date_removed date,
  created_at timestamptz not null default now()
);

create unique index if not exists gocollect_cpi_books_slug_item_uq
  on public.gocollect_cpi_books (index_slug, gocollect_item_id) where gocollect_item_id is not null;

-- Public catalog data like gocollect_cpi: server (service role) writes; no user-owned rows.
alter table public.gocollect_cpi_books enable row level security;
drop policy if exists gocollect_cpi_books_read on public.gocollect_cpi_books;
create policy gocollect_cpi_books_read on public.gocollect_cpi_books for select using (true);
