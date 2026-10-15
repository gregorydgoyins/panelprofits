create table if not exists public.sniper_ebay_history (
  query_key text primary key,
  query_text text not null,
  state text not null default 'pending' check (state in ('pending','ready','failed')),
  response jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.sniper_ebay_history enable row level security;
revoke all on public.sniper_ebay_history from anon, authenticated;
grant select, insert, update on public.sniper_ebay_history to service_role;
