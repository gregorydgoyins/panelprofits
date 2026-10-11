alter table public.pp_series_rows add column load_dup boolean not null default false;
update public.pp_series_rows set load_dup = true where row_id between 100001 and 125000;
create view public.pp_series_rows_clean with (security_invoker = true) as select * from public.pp_series_rows where not load_dup;
comment on column public.pp_series_rows.load_dup is 'true = second accidental import of part4 (row_id 100001-125000); identical copy of row_id 75001-100000. Kept, not deleted; excluded by view pp_series_rows_clean.';
