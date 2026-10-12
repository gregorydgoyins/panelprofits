# Sniper architecture — instructions for AG

Owner: Greg. Written by Claude, 2026-10-12. Read this before touching anything under `lib/sniper`, `app/api/sniper`, `app/api/cron/sniper-snapshot`, `components/sniper`, or `app/sniper`.

The Sniper is a **paper-trading trainer** (play money, nothing is ever sent to a venue). A subscriber sees real auctions, sets a max bid, and later finds out whether that bid would have won against the real closing price. The shape you proposed (local snapshot, local countdown, pending queue, settlement against the real close) is right and **already built**. This document says what exists, what to keep, and what to change in your proposal.

## 1. Rules that do not bend

1. **Real data only.** Every listing, price, bid count, end time, cert number and image must come from the venue or from a recorded sale. No estimated, scaled, rounded-up or "typical" values. If a field is unknown, it is empty and the UI says so.
2. **Prices are exactly what the venue reports.** Non-USD prices are converted at the real ECB rate (`lib/sniper/fx.ts`) and the native price is kept beside the USD figure. Never adjust a venue price for display. Our own numbers (FMV, exit value, paper profit) are labelled as ours.
3. **No outcome before the clock.** Win/loss is hidden until the auction's real end time. The server enforces this (`listOrders` and `replay-store` mask pending orders), not just the UI. Buy It Now seller type is hidden until the haggle is over.
4. **Page loads never call a venue.** The UI reads the database only. Venue calls happen in scheduled jobs and in one user-triggered lookup (`/api/sniper/item-details`).
5. **Access must be permitted.** See section 2. Do not add a source until it is in the permitted column of that table.

## 2. Sources: what is allowed

Checked 2026-10-12. Re-check a site's robots.txt and terms before adding it, and record the result here.

| Venue | Finding | Allowed ingestion |
|---|---|---|
| eBay | Official Browse API, our production keys | **Yes**, via `lib/sniper/market-store.ts` only |
| ComicConnect, Metropolis | robots.txt allows `/`, but the User Agreement (§6 ix) bans robots, spiders and scrapers without written permission, and §6 xi bans copying or displaying content | **No**, until Greg has written permission or an official feed |
| MyComicShop | robots.txt disallows `/auctions` and `/newlistings` | **No** |
| Heritage, ComicLink | robots.txt disallows the pages | **No** |
| Lone Star | Blocks automated fetching | **No** |
| Hake's | robots.txt allows auction pages; terms page not read | **Not yet**: read the terms, then ask permission |
| Mercari | No public API | **No** |
| HipComic | Aggregator; terms not read | **No** until read and permitted |

Your proposal listed MyComicShop, Heritage, ComicLink, HipComic and Mercari in the background harvester. **Remove them.** A slow schedule does not change what the terms and robots rules say, and showing their listings and photos on our page is the copying their terms prohibit. Greg's intent (a trainer, no effect on their auctions) is a reason for them to grant permission, not a substitute for it.

To add a venue: (1) read robots.txt and terms, (2) get written permission or an official API/feed, (3) record it in the table above, (4) write an adapter that returns `RawAuctionListing[]` and plugs into `runSnapshot`, setting `venue` correctly.

## 3. What already exists (do not rebuild)

| Piece | Where |
|---|---|
| Scheduled harvester: eBay Browse, up to 200 lots/call, lock, 20-min backoff on 429, international rotation (GB, CA, AU, DE, FR) | `lib/sniper/market-store.ts` `runSnapshot`, `app/api/cron/sniper-snapshot` |
| Storage (Supabase, RLS on, service role only) | `sniper_listings`, `sniper_ticks`, `sniper_sales`, `sniper_runs`, `sniper_paper_orders` |
| Page reads only the database | `app/api/sniper/live-auctions` via `readLiveListings` |
| Live watch of one lot | `lib/sniper/watch.ts`, `/api/sniper/watch` |
| Closing-minute watcher (real closing prices) | `closingWatch` in `lib/sniper/paper-store.ts`, run by `/api/sniper/paper-tick` every 30 s |
| Snipe queue (armed orders) and settlement | `paper-store.ts` `armAuction`, `paperTick`; `paper.ts` `settleAuction` |
| Simulated Buy It Now haggle | `haggle.ts`, `binAction` |
| Practice rounds on closed auctions | `replay-store.ts`, `/api/sniper/replay`, `components/sniper/ReplayRoom.tsx` |
| Candles from recorded sales only | `candles.ts`, `/api/sniper/candles` |
| Schedules | pg_cron jobs `sniper-snapshot` (every 5 min) and `sniper-paper-tick` (every 30 s) |

## 4. Mapping your design onto it

**Harvester.** Keep the idea, change the cadence per venue. eBay runs every 5 minutes. A once-a-day capture is too stale: the stored "current bid" would be hours old when shown. Whatever the cadence, the UI shows "bid as of {time}", the countdown uses the real `end_time`, and listings older than 45 minutes are not shown as live (`LISTING_STALE_MS`).

**Local storage.** Supabase, not local SQLite. The app runs on Vercel and has no persistent disk.

**Countdown terminal.** Already reads `end_time` from the database. Do not add client-side calls to any venue.

**Snipe queue.** Orders are `armed` in `sniper_paper_orders` (not `PENDING_SETTLEMENT`). While armed, the API shows no result.

**Settlement.** For eBay the closing watcher reads the lot in its last seconds and just after the close, then `paperTick` settles. The win rule is **not** `max > hammer`:

- Bids exist: win if `max >= final + one bid increment` (eBay's published table, `bidIncrement`), and the fill is `min(max, final + increment)`.
- No bids: win at the opening price if `max >= price`.
- This is the optimistic case: we cannot know the winner's hidden maximum, only where the price stopped. The result screen says so.
- Compare **all-in** cost: price plus shipping, plus buyer's premium for auction houses (for example ComicConnect: 15%, minimum $19). Never compare the hammer price alone against a bid that will cost more at checkout.
- If the closing price cannot be read, the order becomes `unresolved` and is not scored. Never guess it.

For a non-eBay venue, settlement is only possible with a permitted source of the final price (an official feed, or results the venue lets us use). Without one, that venue's lots cannot be scored and should not be offered as snipeable.

**Verdict wording.** The ledger uses WON / OUTBID / MISSED with the real closing price beside it. A winning order is added to the Vault once (guarded by `pp_sniper_vaulted_orders`), at the paper fill price plus shipping.

## 5. Please do not

- Add scrapers or crawlers for any venue marked **No** above.
- Call eBay (or any venue) from a page load or a normal API handler.
- Invent bids, timers, cert numbers, sellers, images, or "sold" prices. The old `data/live_auctions.json` catalog was exactly this and is quarantined in `_quarantine/`.
- Reveal win or loss, or seller type, before the clock or the haggle ends.
- Multiply, round, floor or "smooth" a venue price.
- Recreate `executePaperSnipe`-style instant "acquired" buttons.
- Overwrite `lib/sniper/market-store.ts`, `paper-store.ts`, `replay-store.ts`, `watch.ts` without logging it in `docs/AGENT_SYNC.md`.

## 6. Open items you can take

1. **FMV multipliers** in `resolveAuctionDbMetadata` are invented. Replace with recorded sales or mark the value as unavailable.
2. **Venue permission requests**: Greg decides who to ask (ComicConnect, Metropolis, Hake's). Once a written yes exists, build the adapter per section 2.
3. **Server-side passcode gate** for `/sniper`: the production page currently prints the passcode. Gate on the server.
4. **Tests** for `closingWatch` and `replay-store` (current tests cover settlement and haggling only).

## 7. Acceptance checklist

- [ ] No source outside the permitted column is fetched anywhere.
- [ ] Every displayed price equals the venue's price (USD) or the venue's native price with the ECB conversion shown.
- [ ] While an auction is live, no API response contains the armed order's result.
- [ ] A lot with no readable closing price ends `unresolved`, not scored.
- [ ] All-in cost (shipping, buyer's premium) is used in every win/loss comparison.
- [ ] `npx tsc --noEmit` clean (ignore the existing `NewsPanel.tsx` error) and `tests/sniper-*.test.ts` pass.
- [ ] `docs/AGENT_SYNC.md` updated.
