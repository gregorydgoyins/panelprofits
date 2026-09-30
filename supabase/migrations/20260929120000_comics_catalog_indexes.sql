-- Indexes for public.comics (3,481,445 live rows), added additively.
--
-- public.comics predates tracked migrations and is never altered by them (see the
-- "NEVER touches public.comics" note in 20260918230000_graded_comics_system.sql), so no
-- index on it has ever been created through this migration history. Whatever indexes
-- exist today (if any) were created directly against the live database, untracked. This
-- migration is additive schema only (indexes), not data, so it is safe to track normally.
--
-- Each index below is tied to a real, existing query in the codebase (grepped for
-- `.from("comics")` / `.from('comics')` across lib/ and app/):
--
--   * series / title / publisher fuzzy search — lib/comics/queries.ts (getComics: ilike
--     "%q%" on series, ilike "%pub%" on publisher), lib/comics/census.ts (ilike series),
--     lib/gpa/matching.ts (matchComic: ilike "%word%" on series OR title). These are all
--     leading-and-trailing-wildcard ILIKE patterns, which a plain btree index cannot serve
--     (btree only helps a right-anchored "prefix%" pattern). A pg_trgm GIN index is the
--     correct Postgres tool for arbitrary-substring ILIKE and is what these three call
--     sites actually need — this is an index recommendation for search that already
--     exists in the app, not a new search feature.
--   * issue_number equality — lib/comics/queries.ts (getComics), lib/comics/census.ts
--     (getComicCensus), lib/gpa/matching.ts (matchComic) all do `.eq("issue_number", ...)`.
--   * comicbase_price — lib/comics/queries.ts (getFeaturedComics): `.not("comicbase_price",
--     "is", null).gt("comicbase_price", 50)`. A partial index (WHERE comicbase_price IS NOT
--     NULL) matches this filter directly and stays small relative to the 2,190,181 rows
--     with no pricing at all.
--   * baseline_grade_9_8_value + cover_url — lib/panel-profits/assets.ts (getAssetRegistry):
--     `.not("cover_url", "is", null).order("baseline_grade_9_8_value", { ascending: false,
--     nullsFirst: false })`. A partial index (WHERE cover_url IS NOT NULL) ordered on
--     baseline_grade_9_8_value DESC matches this filter+sort directly.
--   * created_at — lib/dashboard/queries.ts (getMarketIntelligence):
--     `.order("created_at", { ascending: false })`.
--
-- Not indexed: `id` (already the primary key), and comics.id `eq()` lookups used
-- everywhere else (lib/comics/covers.ts, lib/panel-profits/assets.ts, app/api/comics/[id]/
-- cover/route.ts) are already served by the primary key.
--
-- NOTE ON APPLYING THIS: these statements use plain CREATE INDEX (matching this repo's
-- existing migration style — no other migration in this repo uses CONCURRENTLY). On a
-- live 3.48M-row table, a plain CREATE INDEX holds a write lock on public.comics for the
-- duration of the build (the GIN trigram indexes in particular can take a while at this
-- row count). If comics is written to concurrently in production, consider running these
-- statements one at a time with CREATE INDEX CONCURRENTLY (which cannot run inside a
-- transaction block) via the Supabase SQL editor instead of applying this file verbatim.

create extension if not exists pg_trgm;

-- Fuzzy substring search (ILIKE '%...%') on series/title/publisher.
create index if not exists comics_series_trgm_idx
  on public.comics using gin (series gin_trgm_ops);

create index if not exists comics_title_trgm_idx
  on public.comics using gin (title gin_trgm_ops);

create index if not exists comics_publisher_trgm_idx
  on public.comics using gin (publisher gin_trgm_ops);

-- Exact issue_number filter.
create index if not exists comics_issue_number_idx
  on public.comics (issue_number);

-- getFeaturedComics: priced-subset filter (1,291,264 of 3,481,445 rows have pricing).
create index if not exists comics_comicbase_price_priced_idx
  on public.comics (comicbase_price)
  where comicbase_price is not null;

-- getAssetRegistry: covered comics ordered by baseline 9.8 valuation.
create index if not exists comics_baseline98_with_cover_idx
  on public.comics (baseline_grade_9_8_value desc)
  where cover_url is not null;

-- getMarketIntelligence: newest-first feed.
create index if not exists comics_created_at_idx
  on public.comics (created_at desc);
