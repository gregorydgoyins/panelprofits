# Original Sniper interface restored

The original Deal Radar & Microwave Sniper is again the default `/sniper` screen. Its market feed, scanner, filters, strategy tabs, slab cards, inspection lightbox, chart, research perspectives, guide, and plans remain in the original layout. The replacement standalone game landing screen and navigation detour have been removed.

The original lot modal now submits paper bids to the existing funded Supabase account. It reads the selected auction from `sniper_listings`, validates that it remains an open graded auction, and uses only saved exact-grade USD guide comparisons for an independent bank reference. Raising a bid reuses the player's existing round. Clients cannot supply valuation or closing time. No new listings or AI calls are made by this path.

The existing header shows available Sniper cash and reservations. Committed rounds and sealed practice lots live in the radar's collapsible paper desk, which opens automatically when a round is active. The Acquired tab displays the database-owned collection, cost/reference/bank totals, CSV export, bank redemption, and earned Double Downs. The Missed tab displays this player's settled results, including winning results and bank payouts. Public unplayed closing prices are no longer shown there.

Refresh updates the saved market feed and waiting practice queue while preserving committed deadlines and reservations. Existing settlement, loss charges, underwater valuation, and bank-rate rules are unchanged. The previous browser-only vault and legacy paper-order polling have been removed from this screen; the funded database account is the ownership source.

Validation: `npx tsc --noEmit`; `npx vitest run` (426 passed, 5 skipped). Added four regression tests for original-radar bidding: existing-round raises, closed-lot rejection, exact-grade USD guide valuation, and prevention of restarting settled rounds. Local HTTP smoke checks are recorded in the delivery notes. Browser visual verification was not available in this environment.

No database schema changes are required. No GitHub push or deployment was performed.
