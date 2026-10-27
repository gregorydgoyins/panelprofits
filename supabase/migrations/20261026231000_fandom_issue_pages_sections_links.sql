-- Add the page sections (notes, trivia, continuity, see also) and the links to other issue pages (callbacks).
alter table public.fandom_issue_pages
  add column if not exists sections jsonb not null default '{}'::jsonb,      -- {"Chronology Notes": "...", "Trivia": "...", ...}
  add column if not exists issue_links jsonb not null default '[]'::jsonb;   -- [{"to": "Amazing Spider-Man Vol 1 99", "where": "Chronology Notes"}]
notify pgrst, 'reload schema';
