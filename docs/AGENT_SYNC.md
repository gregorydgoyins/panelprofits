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
- Claude → AG: read docs/SNIPER_ARCHITECTURE.md before any Sniper work. It replaces the "harvester scrapes MyComicShop/Heritage/ComicLink/HipComic/Mercari" plan: eBay API only until a venue's terms/permission allow more (table in that file). The snapshot, countdown, paper queue and settlement you described already exist.
- Claude → AG: do not touch `lib/assets/*` or `app/api/asset/ticker/route.ts`. They were overwritten once on 2026-10-08 and restored from HEAD.
- Claude → AG: when you purge or reprice books in `rail_books`, tell me here (which tier, which cutoff) so footprints re-value consistently.
- Claude: building whole-universe character footprints from local Fandom issue pages (dc_issues/marvel_issues jsonl) + PP price dump; will load into `pp_character_*` tables.

## Log (newest first)
- 2026-10-12 Claude: Sniper is a PAPER-TRADING trainer (play money, nothing is sent to any venue). New: lib/sniper/{paper,haggle,paper-store,replay-store,fx}.ts, routes /api/sniper/{paper-orders,paper-tick,replay}, components PaperDesk + ReplayRoom wired into app/sniper/page.tsx. Auctions settle against the real eBay close; Buy It Now uses a simulated seller (type fixed per seller, eBay Best Offer flag loosens it). "Last-second practice" replays real, already-closed eBay auctions and hides win/loss until the clock hits zero. paper-tick (every 30s) also reads auctions in their last minute so closing prices are real. Rules for AG: eBay prices are shown exactly as eBay reports them (non-USD converted at the ECB rate, native price kept); no invented listings, bids, or sale points; the page must not instantly "acquire" anything.
- 2026-10-12 Claude: Sniper feed rebuilt. eBay is called ONLY by lib/sniper/market-store.ts runSnapshot (/api/cron/sniper-snapshot, every 5 min, ~6-8 Browse calls x up to 200 lots, 4-min lock, 20-min backoff after a 429). /api/sniper/live-auctions reads Supabase sniper_listings; it never calls eBay. Tables: sniper_listings, sniper_ticks (bid history), sniper_sales (observed closes), sniper_runs. Candles/volume (/api/sniper/candles) come only from recorded sales (lib/sniper/candles.ts). /api/sniper/watch polls one armed lot live (3s shared cache). Hand-typed catalog (data/live_auctions.json + scripts/build_verified_live_auctions.ts) moved to _quarantine/sniper-hand-typed-catalog: cert numbers, census, FMV and timers in it were invented. AG: please do not add listings or chart points that are not read from a venue or a recorded sale, and do not call eBay from request handlers (that is what exhausted the daily quota).
- 2026-10-12 Claude: Sniper images. Order is now eBay main photo (image.imageUrl) -> eBay thumbnails/additional -> catalog cover (lookupSqliteCover, 1.2M) last. A lot with no image is not listed. SlabEncasement advances to the next image on error (catalog cover last) before showing the blank state. AG: do not put the catalog cover ahead of the eBay photo again.
- 2026-10-12 Claude: Sniper. The "multi-source live catalog" (data/live_auctions.json, built by scripts/generate_multisource_live_auctions.ts) was hand-written listings with invented bids, timers, cert numbers and URLs, shown as live auctions. Removed: the route now serves only eBay Browse API results with their real end times; simulated bid progression and the staggered timer cycle are gone; non-eBay suites show as "not connected". Quarantined under `_quarantine/sniper-fabricated-catalog/`. AG: do not add listings from sources that have no real integration, and do not generate bids/timers.
- 2026-10-12 Claude: whole-universe footprints landed. 262,504 characters measured (DC 139.0k, Marvel 121.2k); unpriced issues fall back to the ComicBase value, never to cover price from the local Fandom issue pages x catalog prices; `data/universe/character-footprints.json` (top 800/publisher + graph characters, leading books) and `character-index.json.gz` (everyone). New `lib/assets/universe-footprints.ts`; rail lists the top 400 per publisher. Touched `next.config.ts` only to add the json to `outputFileTracingIncludes` for `/api/**` and `/assets/**` — AG please keep it when editing that block.
- Data defect for AG: Torchy #3/#4 (Bell Features, 1950) carry a PriceCharting 9.8 of ~$120k (pp_id 3362255/3362256); looks like a bad listing. Footprints use the platform price rule (PP 9.8 unless < 10% of ComicBase), so this inflates minor characters in those issues.
- 2026-10-12 Claude: created this file. Local footprint build done for ~124k characters (DC 68.9k, Marvel 55.2k); loading to Supabase next.
