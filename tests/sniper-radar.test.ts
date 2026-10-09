import { describe, it, expect } from "vitest";
import { evaluateAuctionListing } from "@/lib/sniper/radar-engine";
import { RawAuctionListing, SniperFilterProfile } from "@/lib/sniper/types";

describe("Sniper Radar Engine & Anti-Bullshit Filter", () => {
  const defaultProfile: SniperFilterProfile = {
    eras: ["silver", "bronze", "copper", "modern"],
    minGrade: 9.2,
    maxGrade: 9.8,
    maxAllInBudget: 500.00,
    editions: ["all"],
    crackAndPressCandidate: true,
    damagedSlab98: true,
    signedLegendary: true,
    belowGradingCost: true,
    requireProvenSales: true,
    minDiscountPercent: 30,
    minHistoricalSalesCount: 3,
  };

  it("STRICTLY REJECTS modern facsimile reprint posing as vintage key", () => {
    const listing: RawAuctionListing = {
      id: "listing-1",
      source: "ebay",
      title: "Iron Man #128 CGC 9.8 Facsimile Edition 2023 Demon in a Bottle",
      currentBid: 35.00,
      shippingCost: 12.00,
      bidCount: 4,
      secondsRemaining: 420,
      url: "https://ebay.com/itm/1",
      imageUrl: "https://example.com/cover.jpg",
    };

    const evalResult = evaluateAuctionListing(listing, defaultProfile);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.gateFailed).toBe(2);
    expect(evalResult.rejectionReason).toContain("Trigger: 'facsimile'");
  });

  it("STRICTLY REJECTS non-collector filler (Barbie comic)", () => {
    const listing: RawAuctionListing = {
      id: "listing-2",
      source: "ebay",
      title: "Barbie Fashion #1 CGC 9.8 Marvel Comics 1991 Rare",
      currentBid: 40.00,
      shippingCost: 10.00,
      bidCount: 2,
      secondsRemaining: 300,
      url: "https://ebay.com/itm/2",
      imageUrl: "https://example.com/cover.jpg",
    };

    const evalResult = evaluateAuctionListing(listing, defaultProfile);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.gateFailed).toBe(2);
    expect(evalResult.rejectionReason).toContain("Barbie Fashion");
  });

  it("STRICTLY REJECTS unproven book with zero historical sales (Impulse Protection)", () => {
    const listing: RawAuctionListing = {
      id: "listing-3",
      source: "ebay",
      title: "Mystery Space Hero #55 CGC 9.8 Super Rare Only Copy",
      currentBid: 120.00,
      shippingCost: 15.00,
      bidCount: 1,
      secondsRemaining: 600,
      url: "https://ebay.com/itm/3",
      imageUrl: "https://example.com/cover.jpg",
    };

    const evalResult = evaluateAuctionListing(listing, defaultProfile);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.gateFailed).toBe(4);
    expect(evalResult.rejectionReason).toContain("Zero proven auction sales on record");
  });

  it("ACCEPTS Silver Age Green Lantern #7 CGC 9.4 under $150 budget with high arbitrage", () => {
    const profile: SniperFilterProfile = {
      ...defaultProfile,
      eras: ["silver"],
      minGrade: 9.4,
      maxGrade: 9.8,
      maxAllInBudget: 150.00,
      seriesWhitelist: ["green lantern"],
    };

    const listing: RawAuctionListing = {
      id: "listing-gl7",
      source: "heritage",
      title: "Green Lantern #7 CGC 9.4 1961 1st Appearance of Sinestro",
      currentBid: 95.00,
      shippingCost: 15.00,
      bidCount: 8,
      secondsRemaining: 540,
      url: "https://ha.com/itm/gl7",
      imageUrl: "https://example.com/gl7.jpg",
    };

    const evalResult = evaluateAuctionListing(listing, profile);
    expect(evalResult.passed).toBe(true);
    expect(evalResult.resolvedSeries).toBe("Green Lantern");
    expect(evalResult.resolvedIssue).toBe("7");
    expect(evalResult.resolvedGrade).toBe(9.4);
    expect(evalResult.anchorFmv).toBe(385.00);
    expect(evalResult.discountPercent).toBeGreaterThanOrEqual(60);
    expect(evalResult.verdict).toBe("STRONG_BUY_SNIPE");
    expect(evalResult.historicalComps.length).toBeGreaterThanOrEqual(3);
  });

  it("DETECTS Damaged Slab 9.8 Arbitrage ($25 Reholder Opportunity)", () => {
    const listing: RawAuctionListing = {
      id: "listing-ironman-cracked",
      source: "ebay",
      title: "Iron Man #128 CGC 9.8 1979 Demon In A Bottle - Cracked Case on Back",
      currentBid: 180.00,
      shippingCost: 15.00,
      bidCount: 12,
      secondsRemaining: 240,
      url: "https://ebay.com/itm/im128",
      imageUrl: "https://example.com/im128.jpg",
      itemDescription: "Book inside is untouched, 1-inch crack in plastic slab on lower rear corner.",
    };

    const evalResult = evaluateAuctionListing(listing, defaultProfile);
    expect(evalResult.passed).toBe(true);
    expect(evalResult.specialPlay).toBe("REHOLDER_ARBITRAGE");
    expect(evalResult.strategySummary).toContain("Cracked/Damaged 9.8 Case");
    expect(evalResult.anchorFmv).toBe(620.00);
    expect(evalResult.dollarSpread).toBeGreaterThan(350);
  });

  it("REJECTS when total all-in cost exceeds user's strict budget limit", () => {
    const profile: SniperFilterProfile = {
      ...defaultProfile,
      maxAllInBudget: 150.00,
    };

    const listing: RawAuctionListing = {
      id: "listing-thor",
      source: "ebay",
      title: "Thor #337 CGC 9.8 1983 1st Beta Ray Bill",
      currentBid: 160.00, // Bid alone is 160, all-in is ~187
      shippingCost: 15.00,
      bidCount: 22,
      secondsRemaining: 180,
      url: "https://ebay.com/itm/thor337",
      imageUrl: "https://example.com/thor337.jpg",
    };

    const evalResult = evaluateAuctionListing(listing, profile);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.gateFailed).toBe(3);
    expect(evalResult.rejectionReason).toContain("exceeds all-in budget cap");
  });

  it("DETECTS Below-Grading-Cost Arbitrage (CGC 9.8 selling at $18 vs $45+ grading fee)", () => {
    const profile: SniperFilterProfile = {
      ...defaultProfile,
      belowGradingCost: true,
      minAllInCost: 0,
      maxAllInBudget: 50.00,
    };

    const listing: RawAuctionListing = {
      id: "listing-dazzler-floor",
      source: "ebay",
      title: "Dazzler #1 CGC 9.8 Marvel Comics 1981 Bob Larkin Painted Cover",
      currentBid: 18.00,
      shippingCost: 8.00,
      bidCount: 5,
      secondsRemaining: 180,
      url: "https://ebay.com/itm/dazzler1",
      imageUrl: "https://example.com/dazzler1.jpg",
    };

    const evalResult = evaluateAuctionListing(listing, profile);
    expect(evalResult.passed).toBe(true);
    expect(evalResult.specialPlay).toBe("BELOW_GRADING_COST");
    expect(evalResult.cgcGradingCostFloor).toBe(48.00);
    expect(evalResult.allInCost).toBeLessThanOrEqual(30.00); // 18 + 8 + tax < 30
    expect(evalResult.strategySummary).toContain("Slab Cost Floor Arbitrage");
    expect(evalResult.anchorFmv).toBe(95.00);
    expect(evalResult.discountPercent).toBeGreaterThanOrEqual(65);
  });

  it("REJECTS listings below the $50 minimum investment floor", () => {
    const profile: SniperFilterProfile = {
      ...defaultProfile,
      minAllInCost: 50.00,
      maxAllInBudget: 150.00,
    };

    const listing: RawAuctionListing = {
      id: "listing-under-50",
      source: "ebay",
      title: "X-Force #1 CGC 9.8 1991 Negative Edition",
      currentBid: 25.00,
      shippingCost: 8.00,
      bidCount: 4,
      secondsRemaining: 180,
      url: "https://ebay.com/itm/xforce1",
      imageUrl: "https://example.com/xforce1.jpg",
    };

    const evalResult = evaluateAuctionListing(listing, profile);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.gateFailed).toBe(3);
    expect(evalResult.rejectionReason).toContain("minimum investment floor");
  });

  it("DETECTS Quad-Signed Harley Quinn #1 ($135+ slabbing fee sunk cost sniped at $80)", () => {
    const profile: SniperFilterProfile = {
      ...defaultProfile,
      minGrade: 9.4,
      maxGrade: 9.8,
      maxAllInBudget: 150.00,
    };

    const listing: RawAuctionListing = {
      id: "listing-harley-quad",
      source: "ebay",
      title: "Harley Quinn #1 CBCS 9.8 Quad Signed by Adam Hughes, Amanda Conner, Jimmy Palmiotti, Paul Dini",
      currentBid: 65.00,
      shippingCost: 15.00,
      bidCount: 11,
      secondsRemaining: 75,
      url: "https://ebay.com/itm/harley1quad",
      imageUrl: "https://example.com/harley1.jpg",
      itemDescription: "CBCS 9.8 yellow gold label verified signatures. 4 signatures total.",
    };

    const evalResult = evaluateAuctionListing(listing, profile);
    expect(evalResult.passed).toBe(true);
    expect(evalResult.specialPlay).toBe("BELOW_GRADING_COST");
    expect(evalResult.allInCost).toBeLessThanOrEqual(86.00); // 65 + 15 + tax ≈ 85.20
    // Fee stack: $30 base + $30 1st sig + (3 * $25) = $135 + $18 ship = $153 floor
    expect(evalResult.cgcGradingCostFloor).toBe(153.00);
    expect(evalResult.strategySummary).toContain("Multi-Sig Sunk Cost Arbitrage");
    expect(evalResult.anchorFmv).toBe(240.00);
    expect(evalResult.discountPercent).toBeGreaterThanOrEqual(60);
    expect(evalResult.verdict).toBe("STRONG_BUY_SNIPE");
  });

  it("STRICTLY REJECTS listing with missing auction image when requireImage is true", () => {
    const profile: SniperFilterProfile = {
      ...defaultProfile,
      requireImage: true,
    };

    const listing: RawAuctionListing = {
      id: "listing-no-img",
      source: "ebay",
      title: "Batman #423 CGC 9.8 Todd McFarlane Classic Cover",
      currentBid: 85.00,
      shippingCost: 12.00,
      bidCount: 9,
      secondsRemaining: 180,
      url: "https://ebay.com/itm/noimg",
      imageUrl: "", // Missing image
      certNumber: "3948102941",
    };

    const evalResult = evaluateAuctionListing(listing, profile);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.gateFailed).toBe(1);
    expect(evalResult.rejectionReason).toContain("NO IMAGE");
  });

  it("STRICTLY REJECTS listing with missing cert when requireCheckedCert is true", () => {
    const profile: SniperFilterProfile = {
      ...defaultProfile,
      requireCheckedCert: true,
    };

    const listing: RawAuctionListing = {
      id: "listing-no-cert",
      source: "ebay",
      title: "Batman #404 CGC 9.8 Year One Part 1",
      currentBid: 65.00,
      shippingCost: 12.00,
      bidCount: 5,
      secondsRemaining: 150,
      url: "https://ebay.com/itm/nocert",
      imageUrl: "https://example.com/cover.jpg",
      // certNumber omitted
    };

    const evalResult = evaluateAuctionListing(listing, profile);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.gateFailed).toBe(1);
    expect(evalResult.rejectionReason).toContain("UNVERIFIED CERT");
  });
});
