-- Fandom issue-page content for comics matched in fandom_pp_match (Marvel Database, DC Database).
-- One row per wiki page; variants of an issue share a page. Source text is CC BY-SA (Fandom); the url is kept for attribution.
create table if not exists public.fandom_issue_pages (
  wiki            text not null,
  page_title      text not null,
  url             text not null,
  cover_date      text,
  editor_in_chief text,
  stories         jsonb not null default '[]'::jsonb,  -- [{n, title, synopsis, credits:{writer:[..],penciler:[..],...}, characters:[..]}]
  characters      text[] not null default '{}',
  fetched_at      timestamptz not null default now(),
  primary key (wiki, page_title)
);
alter table public.fandom_issue_pages enable row level security;
drop policy if exists fandom_issue_pages_read on public.fandom_issue_pages;
create policy fandom_issue_pages_read on public.fandom_issue_pages for select using (true);
notify pgrst, 'reload schema';
