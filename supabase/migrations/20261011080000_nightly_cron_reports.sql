-- Additive audit log for automated nightly synchronization and validation reports.
create table if not exists public.nightly_cron_reports (
  id uuid primary key default gen_random_uuid(),
  executed_at timestamptz not null default now(),
  status text not null,
  duration_ms integer not null default 0,
  report jsonb not null,
  created_at timestamptz not null default now()
);

comment on table public.nightly_cron_reports is 'Daily/nightly automated audit and synchronization reports generated via Vercel Cron.';

alter table public.nightly_cron_reports enable row level security;

-- Policy: Allow service role full access
create policy if not exists "Service role full access on nightly_cron_reports"
  on public.nightly_cron_reports
  for all
  using (true)
  with check (true);
