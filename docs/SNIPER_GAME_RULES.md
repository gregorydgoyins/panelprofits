# Sniper funded training game

## Implemented

The primary /sniper view now uses the funded game. Its market research radar remains available on the same route. Radar polling and its clocks are suspended while the player uses the game.

- Starting balance is S$10,000, created once. Signed-in Supabase players use their verified user ID; passcode-only visitors use a signed, persistent HttpOnly device cookie. A guest who clears that cookie starts a different account; sign in for cross-device continuity.
- Real stored venue lots and confirmed historical sales share a queue. Source mode, original closing date, source URL, benchmark and outcome are withheld until the player's round settles. No new listing acquisition is required.
- Waiting lots have no running clock. All training lots open at S$1, a disclosed game amount rather than an actual venue bid. A first accepted bid starts a historical round's server deadline; a live round follows the real venue deadline. Historical durations range from 30 seconds to 15 minutes, matching the live queue's closing window.
- Bids are direct offers, not proxy maxima. Every accepted bid is immediately committed in revision one. Raises replace the previous amount; they are not added together. Funds are reserved against concurrent bids. Accepted bids cannot be cancelled.
- The database clock determines acceptance with fractional-second precision. The UI shows hundredths and estimates transport delay; browser time cannot extend a deadline. Late or rejected bids are not charged.
- A bid strictly above the recorded close wins the training comparison. A tie loses to the incumbent. This compares recorded prices, not an unknowable real winner's hidden maximum.
- Committed eBay game rounds invoke the existing close observer near the deadline, in the background. Only a successful post-close venue response can populate their final price. Other venues remain pending until confirmed evidence arrives; no last-seen guess is substituted.
- At settlement, charge the final accepted bid once. A win adds the virtual comic; a loss adds nothing. A live round needs a confirmed sale or a venue close read at/after closing. A stale pre-close reading is insufficient. Missing evidence keeps the round pending; after 24 hours its reservation is released without a guessed result or charge.
- Refresh replaces only waiting offers. It preserves active deadlines, commitments, cash, results and owned comics. Skipped lots are recorded so they do not immediately recycle.
- All game commands lock the player's account and settle cash and ownership in one transaction. Repeated settlement and redemption cannot charge or pay twice.
- Existing sniper_paper_orders remains the bid and ownership record; sniper_paper_accounts holds cash and progression. Legacy unfunded write and browser-timed replay endpoints are retired; those APIs cannot expose new game rows.

## Bank and collection

Acquisition cost never determines bank value. An independently supported live reference can come from saved exact-grade guide comparisons. Without such a reference, the original recorded close is the conservative bank reference, explicitly identified as a historical/venue close rather than current FMV. Research coverage still depends on available stored evidence.

Bank offer = supported reference × the rate fixed when the asset is awarded:

| Settled round | Bank rate |
| --- | --- |
| 1–10 | 100% |
| 11–25 | 90% |
| 26–50 | 75% |
| 51 onward | 50% |

One Double Down is earned per five wins. It doubles the independently calculated bank offer, consumes the award, and never doubles purchase cost. Both offers are shown before redemption.

A bank sale credits cash and removes the asset atomically. A run ends only when no cash, commitments or owned comics remain. No automatic cash reset is provided.

- Lose with a final S$104 bid: S$9,896 remains, with no comic.
- Win at S$106 with a supported S$212 reference: S$9,894 plus the comic. Redeem at 100% to hold S$10,106 and no comic.
- Pay S$1,600 for a S$106 reference: normal redemption pays S$106. Even an earned Double Down pays only S$212.

## Revision two: designed, not implemented

1. Candidate bids validate available funds and server receipt. They reserve exposure without declaring the player committed.
2. A provisional leader starts a three-second high-bid hold clock. The auction clock and standing are separate.
3. Holding the lead for three seconds commits the bid. Leading at closing commits immediately, preserving last-fraction-of-a-second play. A higher bid replaces the committed amount only when it satisfies the same rule.
4. Being stomped before commitment releases the provisional increase; any older committed bid remains reserved. A proposal that never commits does not create a new losing charge.
5. Being outbid after commitment allows a raise; otherwise settlement charges the final committed amount. A committed bid cannot be withdrawn to evade risk.
6. Market pressure uses authentic recorded steps when available. Otherwise, a clearly simulated private opponent schedule and limits are fixed before bidding. The computer must not alter its ceiling simply to defeat the player or present simulated steps as historical observations.
7. A S$10,000 bid on a multimillion-dollar comic is overtaken as predetermined competition arrives. A S$6.6 million bid can lead only if the player has sufficient available funds. Size alone is not an error; price relative to evidence is what matters.
8. Return only permitted current quotes and standing. Never expose hidden ceilings, historical closing data or a reversible formula that reveals the benchmark.

Revision two should also add the Sniper huddle: independent NPC quotes and player offers with atomic cash/asset transfer and disclosed terms. No inert huddle button or fake trader is included in revision one.

## Verification

TypeScript and the standard Vitest suite passed: 422 tests passed, five skipped. The existing live asset-ticker integration can take ~38 seconds in this runtime; its individual timeout is 60 seconds and its assertions are unchanged.

Transactional regression checks use real stored sale evidence and roll back all fixture rows. They cover reservations, raises, overspending, late bids, losing charges, winning ownership, refresh safety, duplicate settlement/redemption, underwater valuation, Double Down and profitable capture accounting.

Local Next HTTP checks verified the access gate, S$10,000 initialization, sealed queue, accepted bid, refresh preserving its deadline, rejected overspending and /sniper HTTP 200. Commands measured about 0.4–0.9 seconds after optimization in the completed run. No real venue order or paid generation was sent.

Browser visual automation was unavailable: this runtime lacked Chromium and its download returned an invalid archive. No screenshot verification is claimed.
