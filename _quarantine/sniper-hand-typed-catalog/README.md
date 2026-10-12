# Hand-typed multi-venue catalog (removed from the live feed)

`live_auctions.json` was generated from lots typed by hand into `build_verified_live_auctions.ts` (kept here as .txt).
The script never read any venue; its only network call checked that image URLs load.

Spot checks on 2026-10-12:
- MyComicShop and Mercari lots existed, but cert numbers, census totals, scarcity tiers and fair values were invented
  (e.g. file cert 4019283011 vs the listing's own label 4766479003).
- Atomic Avenue / Shortboxed / Heritage / ComicLink lots could not be confirmed; end times were hardcoded.
- MyComicShop's robots.txt disallows /auctions, so a live feed from it is not permitted.

Live data now comes only from eBay's Browse API through `lib/sniper/market-store.ts`.
