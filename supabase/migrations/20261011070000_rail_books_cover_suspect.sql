-- Additive. Flags rail books whose stored cover came from a publisher-specific wiki NAME SEARCH
-- for a different publisher (e.g. a Marvel wiki cover on a Crusade book). cover_url is untouched.
alter table public.rail_books add column if not exists cover_suspect boolean not null default false;
comment on column public.rail_books.cover_suspect is 'true when the stored cover came from a publisher-specific wiki name search whose publisher does not match the book publisher (wrong-cover risk). Additive flag; cover_url untouched.';
-- Population (run in batches; applied live 2026-10-11): join comics on id = comics_id where comics.cover_source is a
-- marvel_/dc_/imagecomics_/valiant_/darkhorse_ source and comics.publisher is outside that publisher family,
-- skipping rows whose rail cover_source = 'google_bucket'. 4,725 rows flagged.
