-- Migration: CBR Market Lexicon & Investopedia Financial Thematic Foundation
-- Creates public.ppcf_market_lexicon and adds 'LEXICON' page_type to ppcf_wiki_pages

alter table public.ppcf_wiki_pages drop constraint if exists ppcf_wiki_pages_page_type_check;
alter table public.ppcf_wiki_pages add constraint ppcf_wiki_pages_page_type_check 
  check (page_type in ('COMIC_ISSUE', 'SERIES', 'CREATOR', 'PUBLISHER', 'CHARACTER', 'STORY', 'LOCATION', 'ITEM', 'TEAM', 'VEHICLE', 'LEXICON'));

create table if not exists public.ppcf_market_lexicon (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  slug text not null unique,
  category text not null,
  investopedia_definition text not null,
  panel_profits_translation text not null,
  canonical_formula text,
  comic_example text,
  anti_patterns text,
  is_core_canon boolean not null default true,
  investopedia_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ppcf_market_lexicon_slug_idx on public.ppcf_market_lexicon (slug);
create index if not exists ppcf_market_lexicon_cat_idx on public.ppcf_market_lexicon (category);

alter table public.ppcf_market_lexicon enable row level security;
drop policy if exists "ppcf_market_lexicon_read" on public.ppcf_market_lexicon;
create policy "ppcf_market_lexicon_read" on public.ppcf_market_lexicon for select using (true);

revoke insert, update, delete on table public.ppcf_market_lexicon from anon, authenticated;
