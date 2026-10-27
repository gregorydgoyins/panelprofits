-- First appearances and deaths named on each Fandom issue page (from the page's own {{1st}} and {{Death}} markers).
alter table public.fandom_issue_pages
  add column if not exists first_appearances text[] not null default '{}',
  add column if not exists deaths text[] not null default '{}';
notify pgrst, 'reload schema';
