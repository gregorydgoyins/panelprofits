-- Page-bottom data of each Fandom issue page: universe/reality of the characters, footnote references,
-- external links, "recommended" lists and explicit categories.
alter table public.fandom_issue_pages
  add column if not exists realities jsonb not null default '{}'::jsonb,       -- {"Earth-616": 98, "Earth-21923": 2} = link count per universe
  add column if not exists refs text[] not null default '{}',                 -- footnote reference texts, in page order
  add column if not exists external_links text,
  add column if not exists recommended text[] not null default '{}',
  add column if not exists categories text[] not null default '{}';
notify pgrst, 'reload schema';
