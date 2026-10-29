import { describe, it, expect } from "vitest";
import {
  executeFloatLiquidityEngine,
  computeAmihudIlliquidity,
  estimateMarketImpact,
} from "../lib/pricing/float-liquidity-engine";

describe("Phase 2: Physical Supply & Equity Float Engine Verification Suite", () => {
  it("strictly separates surviving physical census from circulating market float", () => {
    // Spider-Man #300 example:
    // Total Census 9.8s + high grade: 1000 copies
    // Only 50 completed sales across auction houses in trailing 12 months.
    const profile = executeFloatLiquidityEngine({
      comicId: "test-asm-300",
      series: "Amazing Spider-Man",
      issue: "300",
      era: "Modern",
      totalCensusPop: 1000,
      trailing12mSalesCount: 50,
      benchmarkFmvUsd: 4200,
    });

    expect(profile.totalCensusPop).toBe(1000);
    expect(profile.circulatingFloatCopies).toBe(38); // 50 * 0.75 = 37.5 -> 38
    expect(profile.vaultedHordeCount).toBe(962);
    expect(profile.circulatingFloatPct).toBe(3.8); // 3.8% of the total supply is actually circulating
    expect(profile.floatTurnoverRatio).toBe(20.0); // 1000 / 50 = 20.0
    expect(profile.floatTurnoverVelocityTier).toBe("LOW_TURNOVER_DORMANT");
  });

  it("calculates Amihud Illiquidity ratio correctly from realized transaction history", () => {
    // 3 completed sales showing price movements and volume
    const txs = [
      { date: "2026-01-15", grade: "9.8" as const, priceUsd: 4000, volumeUnits: 1 },
      { date: "2026-04-10", grade: "9.8" as const, priceUsd: 4200, volumeUnits: 1 },
      { date: "2026-07-22", grade: "9.8" as const, priceUsd: 3900, volumeUnits: 1 },
    ];

    const illiq = computeAmihudIlliquidity(txs);
    expect(illiq.observationDays).toBe(3);
    expect(illiq.illiqValue).not.toBeNull();
    expect(illiq.illiqValue!).toBeGreaterThan(0);
    expect(illiq.interpretation).toBe("DEEP_INSTITUTIONAL_LIQUIDITY");
  });

  it("returns UNMEASURED for illiquidity and impact when trading data is absent", () => {
    const unmeasuredProfile = executeFloatLiquidityEngine({
      comicId: "action-1",
      series: "Action Comics",
      issue: "1",
      era: "Golden",
      totalCensusPop: 75,
      trailing12mSalesCount: undefined,
    });

    expect(unmeasuredProfile.floatTurnoverVelocityTier).toBe("UNMEASURED");
    expect(unmeasuredProfile.circulatingFloatCopies).toBeNull();
    expect(unmeasuredProfile.amihudIlliquidity.interpretation).toBe("UNMEASURED");
    expect(unmeasuredProfile.marketImpact.liquidityTier).toBe("UNMEASURED");
    expect(unmeasuredProfile.marketImpact.oneUnitImpactPct).toBeNull();
  });

  it("models non-linear market impact for 1-unit and 5-unit liquidation blocks", () => {
    const impact = estimateMarketImpact(
      15, // 15 circulating float copies
      20, // 20 annual sales
      { illiqValue: 0.25, observationDays: 5, averageDollarVolumePerTrade: 1500, interpretation: "BALANCED_ORDER_DEPTH" },
      "Bronze"
    );

    expect(impact.liquidityTier).toBe("MODERATE_LIQUIDITY");
    expect(impact.oneUnitImpactPct).toBeGreaterThan(0);
    expect(impact.fiveUnitImpactPct).toBeGreaterThan(impact.oneUnitImpactPct!);
    expect(impact.estimatedWholesaleHaircutPct).toBe(25.0);
  });
});
