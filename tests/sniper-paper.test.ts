import { describe, expect, it } from "vitest";
import { hashSeed, respondToOffer, rng, sellerProfile, MAX_ROUNDS } from "../lib/sniper/haggle";
import { bidIncrement, paperProfit, settleAuction } from "../lib/sniper/paper";

describe("simulated seller haggling", () => {
  it("gives a seller the same type every time", () => {
    const a = sellerProfile("comic_king_77", true);
    const b = sellerProfile("Comic_King_77", true);
    expect(a.archetype).toBe(b.archetype);
    expect(a.maxDiscount).toBe(b.maxDiscount);
  });

  it("spreads sellers across all five types in roughly the intended proportions", () => {
    const n = 4000;
    const c: Record<string, number> = { firm: 0, fair: 0, dealer: 0, motivated: 0, wildcard: 0 };
    for (let i = 0; i < n; i++) c[sellerProfile(`seller-${i}`, false).archetype]++;
    expect(Math.abs(c.firm / n - 0.25) < 0.04).toBe(true);
    expect(Math.abs(c.fair / n - 0.35) < 0.04).toBe(true);
    expect(Math.abs(c.dealer / n - 0.2) < 0.04).toBe(true);
    expect(Math.abs(c.motivated / n - 0.12) < 0.03).toBe(true);
    expect(Math.abs(c.wildcard / n - 0.08) < 0.03).toBe(true);
  });

  it("is more permissive when the listing advertises Best Offer", () => {
    let on = 0, off = 0;
    for (let i = 0; i < 500; i++) {
      on += sellerProfile(`s${i}`, true).maxDiscount;
      off += sellerProfile(`s${i}`, false).maxDiscount;
    }
    expect(on > off).toBe(true);
  });

  it("replays the same reply for the same seed and differs across seeds", () => {
    const p = sellerProfile("dealer_dan", true);
    const x = respondToOffer({ ask: 200, offer: 175, round: 1, profile: p, seed: "o1" });
    const y = respondToOffer({ ask: 200, offer: 175, round: 1, profile: p, seed: "o1" });
    expect(JSON.stringify(x)).toBe(JSON.stringify(y));
    const outcomes = new Set<string>();
    for (let i = 0; i < 60; i++) outcomes.add(respondToOffer({ ask: 200, offer: 180, round: 1, profile: { ...p, maxDiscount: 0.15, counters: true }, seed: `s${i}` }).result);
    expect(outcomes.size > 1).toBe(true);
  });

  it("accepts the asking price and refuses an insulting offer", () => {
    const p = sellerProfile("anyone", true);
    expect(respondToOffer({ ask: 100, offer: 100, round: 1, profile: p, seed: "a" }).result).toBe("accepted");
    expect(respondToOffer({ ask: 100, offer: 40, round: 1, profile: p, seed: "a" }).result).toBe("declined");
  });

  it("a counter always sits between the offer and the ask", () => {
    const p = { archetype: "dealer" as const, label: "", maxDiscount: 0.2, counters: true };
    let seen = 0;
    for (let i = 0; i < 200; i++) {
      const r = respondToOffer({ ask: 300, offer: 255, round: 1, profile: p, seed: `c${i}` });
      if (r.result === "countered") {
        seen++;
        expect(r.price! > 255 && r.price! <= 300).toBe(true);
      }
    }
    expect(seen > 0).toBe(true);
  });

  it("a firm seller never counters and nobody counters on the last round", () => {
    const firm = { archetype: "firm" as const, label: "", maxDiscount: 0.03, counters: false };
    for (let i = 0; i < 100; i++) expect(respondToOffer({ ask: 100, offer: 90, round: 1, profile: firm, seed: `f${i}` }).result === "countered").toBe(false);
    const dealer = { archetype: "dealer" as const, label: "", maxDiscount: 0.2, counters: true };
    for (let i = 0; i < 100; i++) expect(respondToOffer({ ask: 100, offer: 85, round: MAX_ROUNDS, profile: dealer, seed: `l${i}` }).result === "countered").toBe(false);
  });

  it("a higher offer is never less likely to be accepted", () => {
    const p = { archetype: "fair" as const, label: "", maxDiscount: 0.12, counters: true };
    for (let i = 0; i < 100; i++) {
      const lo = respondToOffer({ ask: 100, offer: 92, round: 1, profile: p, seed: `m${i}` }).result === "accepted";
      const hi = respondToOffer({ ask: 100, offer: 97, round: 1, profile: p, seed: `m${i}` }).result === "accepted";
      expect(lo && !hi).toBe(false);
    }
  });

  it("seeded generator is repeatable", () => {
    const a = rng(hashSeed("x")), b = rng(hashSeed("x"));
    expect(a()).toBe(b());
  });
});

describe("paper auction settlement against the real close", () => {
  it("uses eBay's published increments", () => {
    expect(bidIncrement(0.5)).toBe(0.05);
    expect(bidIncrement(4.99)).toBe(0.25);
    expect(bidIncrement(24.99)).toBe(0.5);
    expect(bidIncrement(99.99)).toBe(1);
    expect(bidIncrement(249.99)).toBe(2.5);
    expect(bidIncrement(500)).toBe(10);
    expect(bidIncrement(5000)).toBe(100);
  });

  it("wins at one step above the close when the max clears it, and pays no more than the max", () => {
    const s = settleAuction(150, 120, 9);
    expect(s.outcome).toBe("won");
    expect(s.fill).toBe(122.5);
    const tight = settleAuction(121, 120, 9); // needs 122.50
    expect(tight.outcome).toBe("outbid");
    const capped = settleAuction(122.5, 120, 9);
    expect(capped.fill).toBe(122.5);
  });

  it("an auction nobody bid on is won at its opening price by any max at or above it", () => {
    expect(settleAuction(50, 40, 0).fill).toBe(40);
    expect(settleAuction(30, 40, 0).outcome).toBe("outbid");
  });

  it("refuses to settle without a usable price", () => {
    expect(settleAuction(0, 100, 3).outcome).toBe("outbid");
    expect(settleAuction(100, 0, 3).outcome).toBe("outbid");
  });

  it("paper profit uses the platform exit rule and keeps losses negative", () => {
    expect(paperProfit(1000, 600)).toBe(265);
    expect(paperProfit(100, 120)! < 0).toBe(true);
    expect(paperProfit(null, 50)).toBeNull();
  });
});
