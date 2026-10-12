# Agent sync — read before editing, append before you stop

Two agents write to this repo: **Claude (Cowork)** and **Antigravity (AG)**. Greg pushes; neither of us pushes.
Rule: if a file is listed under another agent's "Owns", do not edit it — leave a note under "Requests" instead.
Update this file in the same commit as any change to ownership.

## Claude owns (assets rail: instruments, characters, outcomes, footprints)
- `lib/assets/**` (outcomes, prediction-markets, characters, universe, roster, footprint, instruments, underlyings, entity-graph, shocks, shock-propagation, types, surfaceConfig, canon-formulas)
- `app/api/asset/ticker/route.ts`
- `lib/assets/initial-assets.ts` (any file under `lib/assets/`)
- `tests/assets-*.test.ts`, `tests/outcomes.test.ts`, `tests/universe.test.ts`, `tests/roster.test.ts`, `tests/footprint.test.ts`, `tests/surface-coverage.test.ts`, `tests/shock-propagation.test.ts`, `tests/canon-formulas.test.ts`, `tests/market-dynamics.test.ts`
- Supabase objects prefixed `pp_character_*`, `pp_universe_*`, `pp_footprint_*`, `pp_issue_book`, `pp_story_*`
- Local build outputs: `ingestion/CHARACTER_FOOTPRINT_2026-10-11/`

## AG owns (catalog, pricing tiers, ingestion, covers, eBay)
- `ingestion/**` loaders and price pipelines, `scripts/**`
- `rail_books`, `ppcf_*`, `fandom_*` base tables and the canonical market-tier logic (OTC / STD / PREMIUM)
- eBay Browse feed, cover sqlite wiring, series/publisher fixes
- Anything equities-rail (comic issue pages, `components/detail/equity/**`)

## Shared contracts (change only by writing a Request first)
- Book price used by footprints = the same price `rail_books` serves; if the tier/purge logic changes what a book is worth, say so here.
- Book identity: `pp_id` (Panel Profits id) ↔ `fandom_pp_match` ↔ GCD issue id. Do not renumber.

## Requests / handoffs (newest first; delete when done)
- Claude → AG: do not touch `lib/assets/*` or `app/api/asset/ticker/route.ts`. They were overwritten once on 2026-10-08 and restored from HEAD.
- Claude → AG: when you purge or reprice books in `rail_books`, tell me here (which tier, which cutoff) so footprints re-value consistently.
- Claude: building whole-universe character footprints from local Fandom issue pages (dc_issues/marvel_issues jsonl) + PP price dump; will load into `pp_character_*` tables.

## Log (newest first)
- 2026-10-12 Claude: whole-universe footprints landed. 262,504 characters measured (DC 139.0k, Marvel 121.2k); unpriced issues fall back to the ComicBase value, never to cover price from the local Fandom issue pages x catalog prices; `data/universe/character-footprints.json` (top 800/publisher + graph characters, leading books) and `character-index.json.gz` (everyone). New `lib/assets/universe-footprints.ts`; rail lists the top 400 per publisher. Touched `next.config.ts` only to add the json to `outputFileTracingIncludes` for `/api/**` and `/assets/**` — AG please keep it when editing that block.
- Data defect for AG: Torchy #3/#4 (Bell Features, 1950) carry a PriceCharting 9.8 of ~$120k (pp_id 3362255/3362256); looks like a bad listing. Footprints use the platform price rule (PP 9.8 unless < 10% of ComicBase), so this inflates minor characters in those issues.
- 2026-10-12 Claude: created this file. Local footprint build done for ~124k characters (DC 68.9k, Marvel 55.2k); loading to Supabase next.
