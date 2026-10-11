alter table public.rail_covered_books
  add column if not exists era text,
  add column if not exists era_basis text,
  add column if not exists year_basis text,
  add column if not exists edition_form text,
  add column if not exists printing text,
  add column if not exists variant_label text;
