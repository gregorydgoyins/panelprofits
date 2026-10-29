import { describe, it, expect } from "vitest";
import {
  executeCrossAssetTransmissionEngine,
  computeReflexivityPhi,
} from "../lib/pricing/cross-asset-transmission-engine";

describe("Phase 6: Cross-Asset Transmission & Market Reflexivity Engine Verification Suite", () => {
  it("models Soros reflexivity feedback coefficient Phi in low-float high-demand environments", () => {
    // 15 copies float, demand surge 40%, price up 20%
    const reflexivity = computeReflexivityPhi(20.0, 40.0, 15, 25);

    expect(reflexivity.reflexivityCoefficientPhi).toBeGreaterThan(1.2);
    expect(reflexivity.isSelfReinforcingLoop).toBe(true);
    expect(reflexivity.marketRegime).toBe("SUPER_REFLEXIVE_SQUEEZE");
  });

  it("constructs multi-asset structured ETF baskets from underlying atomic sovereign equities", () => {
    const equities = [
      {
        comicId: "af-15",
        series: "Amazing Fantasy",
        issue: "15",
        era: "Silver" as const,
        currentFmv98: 450000,
        circulatingFloat: 12,
        annualVolume: 8,
        annualizedVolatility: 18.2,
      },
      {
        comicId: "hk-181",
        series: "Incredible Hulk",
        issue: "181",
        era: "Bronze" as const,
        currentFmv98: 8500,
        circulatingFloat: 35,
        annualVolume: 45,
        annualizedVolatility: 22.4,
      },
      {
        comicId: "asm-300",
        series: "Amazing Spider-Man",
        issue: "300",
        era: "Modern" as const,
        currentFmv98: 4200,
        circulatingFloat: 50,
        annualVolume: 75,
        annualizedVolatility: 25.1,
      },
    ];

    const report = executeCrossAssetTransmissionEngine(equities);

    expect(report.atomicEquitiesEvaluated).toBe(3);
    expect(report.basketIndices.length).toBe(1);
    expect(report.basketIndices[0].indexId).toBe("CE70-CANONICAL");
    expect(report.basketIndices[0].compositeNavUsd).toBe(462700);
    expect(report.whaleLiquidationShock50UnitsUsd).toBeDefined();
    expect(report.aggregateAumCapacityUsd).toBeGreaterThan(1000000);
  });

  it("preserves Zero Fake Data Covenant by returning UNMEASURED when inputs are absent", () => {
    const report = executeCrossAssetTransmissionEngine([]);
    expect(report.atomicEquitiesEvaluated).toBe(0);
    expect(report.systemicReflexivity.marketRegime).toBe("UNMEASURED");
    expect(report.whaleLiquidationShock50UnitsUsd).toBeNull();
  });
});
