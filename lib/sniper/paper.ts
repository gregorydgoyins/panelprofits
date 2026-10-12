/**
 * Paper-trading settlement. An armed auction order is settled against what the real auction closed at.
 * Nothing is ever placed on a venue.
 */

/** eBay's published US bid increments. */
export function bidIncrement(price: number): number {
  if (price < 1) return 0.05;
  if (price < 5) return 0.25;
  if (price < 25) return 0.5;
  if (price < 100) return 1;
  if (price < 250) return 2.5;
  if (price < 500) return 5;
  if (price < 1000) return 10;
  if (price < 2500) return 25;
  if (price < 5000) return 50;
  return 100;
}

export type PaperOutcome = "won" | "outbid";

export interface PaperSettlement {
  outcome: PaperOutcome;
  /** what the paper order would have paid; null when outbid */
  fill: number | null;
  reason: string;
}

/**
 * Would a bid of `maxBid` placed at the very end have won an auction that really closed at `finalPrice`?
 *  - no bids at all: the first bid wins at the opening price, so any max at or above it wins
 *  - bids placed: the max must beat the closing price by one increment, and then pays that one step above it
 * This is the optimistic case: it cannot know the winner's hidden maximum, only where the price stopped.
 */
export function settleAuction(maxBid: number, finalPrice: number, finalBidCount: number): PaperSettlement {
  if (!(maxBid > 0) || !(finalPrice > 0)) return { outcome: "outbid", fill: null, reason: "no usable price" };
  if (finalBidCount <= 0) {
    return maxBid >= finalPrice
      ? { outcome: "won", fill: round2(finalPrice), reason: "no other bids; first bid takes it at the opening price" }
      : { outcome: "outbid", fill: null, reason: "max was below the opening price" };
  }
  const need = round2(finalPrice + bidIncrement(finalPrice));
  if (maxBid >= need) {
    return { outcome: "won", fill: round2(Math.min(maxBid, need)), reason: `max cleared the close of $${finalPrice.toFixed(2)} by one increment` };
  }
  return { outcome: "outbid", fill: null, reason: `closed at $${finalPrice.toFixed(2)}; needed $${need.toFixed(2)} to take the lead` };
}

/** The platform's existing exit rule: value less 13% fees and $5 shipping out, minus what was paid in. Signed; a loss is a loss. */
export function paperProfit(fmv: number | null | undefined, fillAllIn: number): number | null {
  if (!(fmv != null && fmv > 0)) return null;
  return round2(fmv * 0.87 - 5 - fillAllIn);
}

const round2 = (n: number) => Math.round(n * 100) / 100;
