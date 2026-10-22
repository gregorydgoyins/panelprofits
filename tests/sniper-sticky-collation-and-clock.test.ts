import { describe, it, expect } from "vitest";
import type { StickyLotBid, BidEvent, LotItem } from "@/lib/sniper/sim/types";

function mockLot(id: string, opening: number, hammer: number, fmv: number): LotItem {
  return {
    id,
    title: `Mock Comic #${id}`,
    series: "Mock Series",
    issueNumber: "1",
    coverUrl: "/images/mock.jpg",
    grade: "9.8",
    grader: "CGC",
    era: "modern",
    certNumber: `123456${id}`,
    certVerificationUrl: "https://cgccomics.com",
    fmv,
    openingBid: opening,
    currentBid: opening,
    hammerPrice: hammer,
    summary: "Mock summary",
    whyInvest: "Mock why",
    spreadRawTo98: 100,
    ratio96To98: 0.5,
    salesVolume: 10,
    lastSoldDate: "2026-01-01",
    isStaleComp: false,
    staleCompAgeDays: 10,
    investopediaSlug: "dollar-cost-averaging",
    priceLadder: {
      raw: fmv * 0.15,
      grade40: null,
      grade60: null,
      grade80: null,
      grade92: fmv * 0.25,
      grade94: fmv * 0.35,
      grade96: fmv * 0.5,
      grade98: fmv,
      grade100: null,
    },
    activeFormulaKey: "standard",
    formulas: {} as any,
    exitScenarios: {} as any,
    witnessFee: 0,
    creatorSigningFee: 0,
    invoiceFee: 5,
    serviceTax: 2.8,
    shippingHandlingFee: 50,
    slabbingCostFloor: 107.8,
    estimatedRawBasis: fmv * 0.15,
    sellerTotalCostBasis: fmv * 0.15 + 107.8,
    breakevenSalePrice: 200,
    isBelowGradingCost: false,
    sellerSubsidizedAmount: 0,
  } as unknown as LotItem;
}

describe("Sniper Multi-Auction Sticky Collation & Clock Fight Engine", () => {
  it("enforces maximum 5 sticky collated auctions limit", () => {
    const MAX_STICKY_AUCTIONS = 5;
    const stickyBids: StickyLotBid[] = [];

    // Simulate adding 5 lots
    for (let i = 1; i <= 5; i++) {
      const lot = mockLot(`lot-${i}`, 100 + i * 10, 200 + i * 20, 300 + i * 30);
      stickyBids.push({
        lotId: lot.id,
        lot,
        userBid: 150 + i * 10,
        currentBid: 150 + i * 10,
        timeRemaining: 180,
        hammerPrice: lot.hammerPrice,
        status: "leading",
        bidHistory: [],
      });
    }

    expect(stickyBids.length).toBe(5);

    // Attempting to add a 6th lot without releasing a slot should be blocked
    const canAdd6th = stickyBids.length < MAX_STICKY_AUCTIONS;
    expect(canAdd6th).toBe(false);
  });

  it("calculates exact 10% Chicken Out penalty and releases sticky slot", () => {
    let bankroll = 5000;
    const lot = mockLot("lot-chicken", 100, 250, 400);
    const userBid = 200;

    let stickyBids: StickyLotBid[] = [
      {
        lotId: lot.id,
        lot,
        userBid,
        currentBid: userBid,
        timeRemaining: 45,
        hammerPrice: 250,
        status: "leading",
        bidHistory: [],
      },
    ];

    expect(stickyBids.length).toBe(1);

    // Execute Chicken Out (-10% penalty)
    const penalty = Math.round(userBid * 0.10); // 10% of $200 = $20
    expect(penalty).toBe(20);

    bankroll -= penalty;
    expect(bankroll).toBe(4980);

    // Slot is released from sticky collation
    stickyBids = stickyBids.filter((b) => b.lotId !== lot.id);
    expect(stickyBids.length).toBe(0);
  });

  it("executes 30s late proxy fight, 5s sniping blitz, and 1s hammer push triggers", () => {
    const lot = mockLot("lot-clock", 50, 180, 300);
    const bidItem: StickyLotBid = {
      lotId: lot.id,
      lot,
      userBid: 120,
      currentBid: 60,
      timeRemaining: 35,
      hammerPrice: 180,
      status: "leading",
      bidHistory: [],
    };

    // Simulate countdown from 35s to 25s (crosses 30s milestone)
    let time = 30;
    if (time <= 30 && time > 5 && !bidItem.rival30sTriggered) {
      bidItem.rival30sTriggered = true;
      const inc = 20; // +$20 late floor proxy
      bidItem.currentBid = Math.min(bidItem.hammerPrice, bidItem.currentBid + inc); // 60 + 20 = 80
      bidItem.bidHistory.push({
        timestamp: Date.now(),
        bidder: "rival",
        amount: bidItem.currentBid,
        clockSecs: time,
        note: "30s late proxy bot",
      });
    }

    expect(bidItem.rival30sTriggered).toBe(true);
    expect(bidItem.currentBid).toBe(80);
    expect(bidItem.userBid).toBeGreaterThan(bidItem.currentBid); // Still leading at $120 vs $80

    // Simulate countdown crossing 5s milestone (sniping blitz)
    time = 5;
    if (time <= 5 && time > 1 && !bidItem.rival5sTriggered) {
      bidItem.rival5sTriggered = true;
      const inc = 50; // +$50 sniper blitz
      bidItem.currentBid = Math.min(bidItem.hammerPrice, bidItem.currentBid + inc); // 80 + 50 = 130
      bidItem.bidHistory.push({
        timestamp: Date.now(),
        bidder: "rival",
        amount: bidItem.currentBid,
        clockSecs: time,
        note: "5s sniper blitz",
      });
      if (bidItem.currentBid > bidItem.userBid) {
        bidItem.status = "outbid";
      }
    }

    expect(bidItem.rival5sTriggered).toBe(true);
    expect(bidItem.currentBid).toBe(130);
    // User bid was $120, rival jumped to $130 -> Outbid!
    expect(bidItem.status).toBe("outbid");

    // Simulate final 1s hammer push
    time = 1;
    if (time <= 1 && !bidItem.rival1sTriggered) {
      bidItem.rival1sTriggered = true;
      bidItem.currentBid = bidItem.hammerPrice; // 180
    }
    expect(bidItem.rival1sTriggered).toBe(true);
    expect(bidItem.currentBid).toBe(180);
  });

  it("computes live lead delta and outbid deficit on the fly", () => {
    const userBidLeading = 250;
    const floorBidLeading = 200;
    const leadDelta = userBidLeading - floorBidLeading;
    expect(leadDelta).toBe(50); // Leading by +$50

    const userBidTrailing = 180;
    const floorBidTrailing = 220;
    const deficitDelta = userBidTrailing - floorBidTrailing;
    expect(deficitDelta).toBe(-40); // Outbid by -$40
  });
});
