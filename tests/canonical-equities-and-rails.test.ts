import { describe, it, expect } from "vitest";
import {
  formatComicEquityTicker,
  CANONICAL_16_ASSET_FAMILIES,
  getSovereignEquities,
  getCanonicalAssetSurfaces,
  getSovereignEquityDossier,
} from "@/lib/equity/canonical-equities";
import { getCleanEquityDetail } from "@/lib/panel-profits/assets";

describe("Canonical Equities Symbology & 16 Asset Families Canon", () => {
  it("formats canonical comic equity tickers following BNF grammar [ROOT].[ISSUE].[CLASS]", () => {
    expect(formatComicEquityTicker("Action Comics", "252", "SOV")).toBe("ACT.252.SOV");
    expect(formatComicEquityTicker("Amazing Spider-Man", "300", "SOV")).toBe("ASM.300.SOV");
    expect(formatComicEquityTicker("Batman", "251", "SOV")).toBe("BAT.251.SOV");
    expect(formatComicEquityTicker("Crime SuspenStories", "22", "SOV")).toBe("CSS.022.SOV");
    expect(formatComicEquityTicker("Incredible Hulk", "181", "SOV")).toBe("HULK.181.SOV");
    expect(formatComicEquityTicker("Teenage Mutant Ninja Turtles", "1", "SOV")).toBe("TMNT.001.SOV");
    expect(formatComicEquityTicker("Fantastic Four", "48", "SOV")).toBe("FF.048.SOV");
    expect(formatComicEquityTicker("Avengers", "4", "SOV")).toBe("AVG.004.SOV");
  });

  it("contains exactly 16 Canonical Collectible Asset Families with valid liquidity tiers", () => {
    expect(CANONICAL_16_ASSET_FAMILIES.length).toBe(16);

    const expectedCodes = [
      "SOV", "SIG", "PED", "NEW", "PRV", "RAT", "RAW", "VAR",
      "DIR", "QLF", "RST", "CNS", "PRN", "INT", "ERR", "ASH"
    ];

    const actualCodes = CANONICAL_16_ASSET_FAMILIES.map((f) => f.shortCode);
    for (const code of expectedCodes) {
      expect(actualCodes).toContain(code);
    }

    for (const family of CANONICAL_16_ASSET_FAMILIES) {
      expect(["HIGH", "MEDIUM", "SPECIALIZED", "INSTITUTIONAL"]).toContain(family.liquidityTier);
      expect(family.pricingPremiumFactor.length).toBeGreaterThan(0);
      expect(family.marketRole.length).toBeGreaterThan(0);
    }
  });

  it("fetches sovereign equities universe with real pricing and Gregory scores", async () => {
    const equities = await getSovereignEquities(20);
    expect(Array.isArray(equities)).toBe(true);
    expect(equities.length).toBeGreaterThan(0);

    const first = equities[0];
    expect(first).toHaveProperty("ticker");
    expect(first).toHaveProperty("series");
    expect(first).toHaveProperty("issueNumber");
    expect(first).toHaveProperty("referenceFmvUsd");
    expect(first.referenceFmvUsd).toBeGreaterThan(0);
    expect(first.gregoryScore).toBeGreaterThanOrEqual(180);
    expect(first.originEra).toBeDefined();
  });

  it("fetches canonical asset surfaces representing CE70 certified constituent seats", async () => {
    const seats = await getCanonicalAssetSurfaces(10);
    expect(Array.isArray(seats)).toBe(true);
    expect(seats.length).toBeGreaterThan(0);

    const seat = seats[0];
    expect(seat.seatNumber).toBeDefined();
    expect(seat.titleIssue).toBeDefined();
    expect(seat.primaryCreators).toBeDefined();
    expect(seat.gregoryScore).toBeGreaterThan(190);
  });

  it("resolves sovereign equity dossier with 16 asset classes and performance curve", async () => {
    // Resolve by ticker
    const dossier = await getSovereignEquityDossier("CSS.022.SOV");
    expect(dossier).not.toBeNull();
    if (dossier) {
      expect(dossier.series).toContain("Crime SuspenStories");
      expect(dossier.issueNumber).toBe("22");
      expect(dossier.referenceFmvUsd).toBeGreaterThan(0);
      expect(dossier.performanceHistory.length).toBe(30);
      expect(dossier.assetFamilyValuations.length).toBe(16);
      expect(dossier.qualityScores.length).toBeGreaterThan(0);
      expect(dossier.adjudicationEssay.length).toBeGreaterThan(50);
    }
  });

  it("resolves constitutional seat detail from getCleanEquityDetail", async () => {
    const seatDetail = await getCleanEquityDetail("seat-1");
    expect(seatDetail).not.toBeNull();
    if (seatDetail) {
      expect(seatDetail.seat_number).toBe(1);
      expect(seatDetail.gregory_score).toBeGreaterThan(190);
      expect(seatDetail.source).toContain("CE70");
    }
  });
});
