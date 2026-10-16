# Public auction collection

The collector reads the three auction catalogs supplied for October 2026. It never logs in or submits bids. Auction configuration lives in `lib/sniper/public-auction-catalog.ts`.

From the Panel Profits repository on the Mac:

```bash
git pull origin rail-covered-books
npm ci
npx playwright install chromium
npm run sniper:auctions -- --browser --save
```

The visible browser uses a fresh, unsigned-in session. It renders public pages normally; it does not solve or bypass security challenges. If a source refuses the browser request, the run reports the failure and continues with the other sources. No authenticated browser profile is required or read.

Without `--browser`, the collector uses ordinary server HTTP. Without `--save`, it reads and reports without writing auction rows. `--venue=comiclink`, `--venue=mycomicshop`, or `--venue=heritage` selects one catalog. `--max-pages=500` is the default maximum; reaching it reports `complete:false` rather than claiming a complete import.

The collector follows source-published next-page links and deduplicates lots by source item ID. It records exact closing timestamps with timezone conversion, the observed current or starting bid, grade, title, source URL, image when published, and observation time. Missing individual closing timestamps or prices are counted and excluded. A session date, relative countdown, estimated value, or asking price is never substituted for a lot's closing deadline or completed sale.

Before saving, the importer requires a unique stored first-print comic identity, grade 8.5 or better, a dated stored raw guide of at least $17, and an original USD cover price below that raw guide. Unknown or ambiguous identity/edition/valuation is excluded. The existing `sniper_listings` table holds admitted lots and its exact comic pointer; the existing radar query provides equal allocation across represented sites. No parallel auction database is created.

The snapshot cron attempts bounded HTTP collection in background work, resuming published pagination using `sniper_vendor_fetch.cursor_url`. Blocked sources back off for one hour. Lot opening continues to read stored rows only.

## Verification limits

On the hosted development runner, the supplied ComicLink URL returns HTTP 402, Heritage returns HTTP 403, and MyComicShop returns an Incapsula challenge. ComicLink's public first-page text and its next-page link were independently readable through web retrieval; its Aliens #1 CGC 9.8 lot supplies the timestamp regression fixture. Full live HTML parsing and all-page completion have not been verified for these three catalogs. In particular, MyComicShop and Heritage HTML layouts must be checked against readable source responses before treating their imports as complete. The program reports failures or missing fields instead of importing inferred values.
