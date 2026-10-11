alter table public.pp_price_stage add column if not exists created_at timestamptz not null default now();
