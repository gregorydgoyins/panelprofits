-- Migration: Enable multi-universe character wiki pages and optional canonical comic binding
-- Removes the mandatory comic issue binding from ppcf_wiki_pages so character, creator, and universe
-- dossiers can exist as standalone encyclopedia records while optionally linking to their debut issue.

alter table public.ppcf_wiki_pages drop constraint if exists ppcf_wiki_pages_ppcf_id_key;
alter table public.ppcf_wiki_pages alter column ppcf_id drop not null;

-- Add index on page_type and slug for fast multi-universe wiki routing
create index if not exists ppcf_wiki_pages_type_idx on public.ppcf_wiki_pages (page_type);
create index if not exists ppcf_wiki_pages_slug_idx on public.ppcf_wiki_pages (slug);

-- Add optional universe identifier for character and lore segmentation
alter table public.ppcf_wiki_pages add column if not exists universe text default 'UNSPECIFIED';
