/**
 * Simulated seller haggling for paper-trading Buy It Now purchases.
 *
 * Nothing here talks to a venue. A seller's type is fixed by who they are (hash of the seller name), so the same
 * seller always behaves the same way; what varies is the mood they are in on each offer, which is rolled from a seed
 * stored with the order so every negotiation can be replayed exactly.
 *
 * eBay's real "Best Offer" flag on the listing shifts the odds: a seller who advertises offers is more permissive than
 * one who does not.
 */

export type Archetype = "firm" | "fair" | "dealer" | "motivated" | "wildcard";

export interface SellerProfile {
  archetype: Archetype;
  label: string;
  /** The most this seller will ever knock off the asking price, as a fraction (0.10 = 10%). */
  maxDiscount: number;
  /** Whether they answer a low offer with a counter instead of a flat no. */
  counters: boolean;
}

const TYPES: Array<{ a: Archetype; weight: number; maxDiscount: number; counters: boolean; label: string }> = [
  { a: "firm", weight: 0.25, maxDiscount: 0.03, counters: false, label: "Firm: price is the price" },
  { a: "fair", weight: 0.35, maxDiscount: 0.1, counters: true, label: "Fair: will move a little" },
  { a: "dealer", weight: 0.2, maxDiscount: 0.15, counters: true, label: "Dealer: expects an offer" },
  { a: "motivated", weight: 0.12, maxDiscount: 0.25, counters: true, label: "Motivated: wants it gone" },
  { a: "wildcard", weight: 0.08, maxDiscount: 0, counters: true, label: "Wildcard: could be anything" },
];

/** Small fast seeded generator (mulberry32). Same seed, same sequence. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash to a 32-bit seed. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A seller's type: stable for a given seller, and more permissive when the listing advertises Best Offer. */
export function sellerProfile(seller: string, bestOfferEnabled: boolean): SellerProfile {
  const r = rng(hashSeed(`seller|${seller.toLowerCase()}`));
  const roll = r();
  let acc = 0;
  let pick = TYPES[0];
  for (const t of TYPES) {
    acc += t.weight;
    if (roll < acc) { pick = t; break; }
  }
  let maxDiscount = pick.a === "wildcard" ? 0.02 + r() * 0.38 : pick.maxDiscount;
  const counters = pick.a === "wildcard" ? r() < 0.5 : pick.counters;
  // A seller who never switched on Best Offer is less likely to bend; one who did is more likely.
  maxDiscount *= bestOfferEnabled ? 1.15 : 0.6;
  return { archetype: pick.a, label: pick.label, maxDiscount: Math.round(maxDiscount * 1000) / 1000, counters };
}

export type HaggleResult = "accepted" | "countered" | "declined";

export interface HaggleReply {
  result: HaggleResult;
  /** price the seller will sell at: the offer when accepted, their counter when countered */
  price: number | null;
  message: string;
  round: number;
}

export const MAX_ROUNDS = 3;

const cents = (n: number) => Math.round(n * 100) / 100;
const halfDollar = (n: number) => Math.round(n * 2) / 2;

/**
 * One offer. The seller rolls a mood (how permissive they feel right now), which sets today's lowest acceptable price
 * between the asking price and their lowest-ever price. An offer at or above it is accepted. Below it, a seller who
 * counters meets the buyer part way; a seller who does not says no. Offers under half the ask are refused outright.
 */
export function respondToOffer(args: { ask: number; offer: number; round: number; profile: SellerProfile; seed: string }): HaggleReply {
  const { ask, offer, round, profile } = args;
  const r = rng(hashSeed(`${args.seed}|round${round}`));
  const mood = r(); // 0 = stingy today, 1 = generous today
  const floor = cents(ask * (1 - profile.maxDiscount * mood));

  if (offer >= ask) return { result: "accepted", price: cents(ask), message: "Sold at the asking price.", round };
  if (offer < ask * 0.5) return { result: "declined", price: null, message: "That's not a serious offer.", round };
  if (offer >= floor) return { result: "accepted", price: cents(offer), message: "Deal. It's yours at that price.", round };

  const reach = ask * (1 - profile.maxDiscount * 1.3); // beyond this they don't even counter
  if (profile.counters && round < MAX_ROUNDS && offer >= reach) {
    const counter = Math.min(cents(ask), Math.max(cents(floor), halfDollar(ask - (ask - offer) * 0.5)));
    if (counter > offer) return { result: "countered", price: counter, message: `Can't do that, but I'd take $${counter.toFixed(2)}.`, round };
  }
  return { result: "declined", price: null, message: profile.archetype === "firm" ? "Price is firm." : "Too low for me.", round };
}
