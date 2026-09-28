-- Migration: Multi-Universe Lore, Artifacts, Locations, and Entity Crosswalk Support
-- Expands ppcf_wiki_pages and ppcf_wiki_entity_links to support items, weapons, vehicles,
-- locations, cities, hideouts, and multiverse realities across Marvel, DC, Star Wars, and Indies.

alter table public.ppcf_wiki_pages drop constraint if exists ppcf_wiki_pages_page_type_check;
alter table public.ppcf_wiki_pages add constraint ppcf_wiki_pages_page_type_check 
  check (page_type in ('COMIC_ISSUE', 'SERIES', 'CREATOR', 'PUBLISHER', 'CHARACTER', 'STORY', 'LOCATION', 'ITEM', 'TEAM', 'VEHICLE'));

alter table public.ppcf_wiki_pages add column if not exists reality text default 'Earth-616';
alter table public.ppcf_wiki_pages add column if not exists creators text;
alter table public.ppcf_wiki_pages add column if not exists first_appearance text;

-- Expand entity types and source systems in ppcf_wiki_entity_links
alter table public.ppcf_wiki_entity_links drop constraint if exists ppcf_wiki_entity_links_entity_type_check;
alter table public.ppcf_wiki_entity_links add constraint ppcf_wiki_entity_links_entity_type_check
  check (entity_type in ('SERIES', 'CREATOR', 'PUBLISHER', 'CHARACTER', 'STORY', 'LOCATION', 'COUNTRY', 'LANGUAGE', 'ITEM', 'TEAM', 'VEHICLE'));

alter table public.ppcf_wiki_entity_links drop constraint if exists ppcf_wiki_entity_links_source_system_check;
alter table public.ppcf_wiki_entity_links add constraint ppcf_wiki_entity_links_source_system_check
  check (source_system in ('GCD', 'PANEL_PROFITS', 'COMICBASE', 'MARVEL_DB', 'DC_DB', 'STAR_WARS_DB', 'WIKI'));

create index if not exists ppcf_wiki_pages_universe_type_idx
  on public.ppcf_wiki_pages (universe, page_type);
