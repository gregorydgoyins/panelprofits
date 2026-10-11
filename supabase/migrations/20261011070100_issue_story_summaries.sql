-- Additive cache of verifiable per-issue story descriptions (wiki / catalog sources) with attribution.
create table if not exists public.issue_story_summaries (
  comic_key text primary key,
  series text not null,
  issue_number text not null,
  year integer,
  publisher text,
  summary text,
  story_title text,
  source text,
  source_url text,
  license text,
  checked_at timestamptz not null default now()
);
comment on table public.issue_story_summaries is 'Cache of verifiable per-issue story descriptions (wiki / catalog sources) with attribution. summary null = every source was checked and none had one (negative cache; re-checked after expiry).';
alter table public.issue_story_summaries enable row level security;
