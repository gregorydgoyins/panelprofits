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

  it("assigns authentic distinct cover artwork without brittle generic placeholders", async () => {
    const equities = await getSovereignEquities(20);
    const covers = equities.map((e) => e.coverUrl).filter(Boolean);
    expect(covers.length).toBeGreaterThan(0);

    // Ensure none are using the old brittle 526.jpg placeholder
    for (const cover of covers) {
      expect(cover).not.toContain("526.jpg");
    }

    // Ensure multiple distinct issues have distinct cover URLs
    const uniqueCovers = new Set(covers);
    expect(uniqueCovers.size).toBeGreaterThan(5);
  });

  it("assigns distinct authentic cover art to canonical asset seats", async () => {
    const seats = await getCanonicalAssetSurfaces(15);
    const seatCovers = seats.map((s) => s.coverUrl).filter(Boolean);
    expect(seatCovers.length).toBeGreaterThan(0);

    for (const cover of seatCovers) {
      expect(cover).not.toContain("526.jpg");
    }

    const uniqueSeatCovers = new Set(seatCovers);
    expect(uniqueSeatCovers.size).toBeGreaterThan(5);
  });

  it("provides canonical era colors and dynamic rimlight tokens across all eras", async () => {
    const { getEraColors, withAlpha } = await import("@/lib/design-system/colors");
    const eras = ["platinum", "golden", "atomic", "silver", "bronze", "copper", "modern", "independent", "postmodern"];

    for (const era of eras) {
      const colors = getEraColors(era);
      expect(colors).toBeDefined();
      expect(colors.border).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.bg).toContain("rgba");
      expect(colors.glow).toContain("rgba");
    }

    // withAlpha helper test
    expect(withAlpha("#C9A227", 0.5)).toContain("rgba");
  });

  it("renders EquitiesRail with animated equity-cards, authentic covers, and era rimlights", async () => {
    const { EquitiesRail } = await import("@/components/shell/equities-rail");
    const { renderToString } = await import("react-dom/server");

    const sampleEquities = [
      {
        id: "eq-1",
        seatNumber: 1,
        seatType: "PRIMARY_DOMESTIC",
        ticker: "ACT.252.SOV",
        series: "Action Comics",
        issueNumber: "252",
        title: "Action Comics #252",
        originEra: "SILVER",
        productionAge: "SILVER",
        lineage: "Superman Lineage",
        referenceGrade: "9.8",
        referenceFmvUsd: 48500,
        priceFormatted: "$48,500",
        gregoryScore: 196.4,
        deltaPercent: 0.68,
        status: "ACTIVE",
        coverUrl: "/covers/action_comics_252.jpg",
        canonicalIssueId: null,
      },
      {
        id: "eq-2",
        seatNumber: 2,
        seatType: "PRIMARY_DOMESTIC",
        ticker: "BAT.251.SOV",
        series: "Batman",
        issueNumber: "251",
        title: "Batman #251",
        originEra: "BRONZE",
        productionAge: "BRONZE",
        lineage: "Batman Lineage",
        referenceGrade: "9.8",
        referenceFmvUsd: 8500,
        priceFormatted: "$8,500",
        gregoryScore: 194.2,
        deltaPercent: 0.42,
        status: "ACTIVE",
        coverUrl: "/covers/batman_251.jpg",
        canonicalIssueId: null,
      },
    ];

    const React = await import("react");
    const html = renderToString(React.createElement(EquitiesRail, { items: sampleEquities }));

    expect(html).toContain("EQUITIES");
    expect(html).toContain("CE70");
    expect(html).toContain("equity-card");
    expect(html).toContain("--rim");
    expect(html).toContain("ACT.252.SOV");
    expect(html).toContain("Action Comics");
    expect(html).toContain("$48,500");
    expect(html).toContain("/covers/action_comics_252.jpg");
    expect(html).toContain("equities-marquee-track");
  });

  it("renders AssetsRail with canonical non-equity asset surfaces across 16 families and 56 surfaces", async () => {
    const { AssetsRail } = await import("@/components/shell/assets-rail");
    const { renderToString } = await import("react-dom/server");
    const React = await import("react");

    const html = renderToString(React.createElement(AssetsRail));

    expect(html).toContain("ASSETS");
    expect(html).toContain("16 FAMILIES · 56 SURFACES");
    expect(html).toContain("DERIVATIVES · FUNDS · INDICES · MUNI BONDS · ALTER EGOS");
    expect(html).toContain("assets-marquee-track");
    expect(html).toContain("Mjolnir");
    expect(html).toContain("Batmobile");
  });
});

