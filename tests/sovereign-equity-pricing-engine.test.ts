import { describe, it, expect } from "vitest";
import {
  executeSovereignPricingEngine,
  computeWilderRsi14,
  computeAnnualizedVol,
  computeMaxDrawdown,
  type SovereignMonthlySnapshot,
  type SovereignPricingEngineInput,
} from "@/lib/pricing/sovereign-equity-pricing-engine";

describe("Sovereign Canonical Equity Pricing Engine Verification Suite", () => {
  it("verifies Wilder RSI-14 edge behavior and numerical accuracy", () => {
    // Monotonically increasing prices -> RSI should be 100
    const rising = Array.from({ length: 20 }, (_, i) => 10 + i * 2);
    expect(computeWilderRsi14(rising)).toBe(100);

    // Monotonically decreasing prices -> RSI should be near 0
    const falling = Array.from({ length: 20 }, (_, i) => 50 - i * 2);
    expect(computeWilderRsi14(falling)).toBeLessThan(10);
  });

  it("verifies Annualized Volatility and Maximum Drawdown calculation", () => {
    // 6-month price series with known drawdown
    const prices = [100, 150, 120, 90, 110, 130];
    const vol = computeAnnualizedVol(prices);
    const mdd = computeMaxDrawdown(prices);

    expect(vol).toBeDefined();
    expect(vol!).toBeGreaterThan(0.3); // High volatility
    // Peak was 150, trough was 90 -> ((150 - 90) / 150) * 100 = 40.0%
    expect(mdd).toBe(40.0);
  });

  it("executes full 60-month multi-grade sovereign pricing engine on landmark equity", () => {
    // Simulate 60 monthly snapshots (Nov 2021 to Oct 2026) for Incredible Hulk #181 (1974)
    const snapshots: SovereignMonthlySnapshot[] = [];
    const baseEpoch = Date.parse("2021-11-01T00:00:00Z");

    let pRaw = 1200.0;
    let p80 = 3500.0;
    let p92 = 6000.0;
    let p98 = 35000.0;

    for (let i = 0; i < 60; i++) {
      const epochMs = baseEpoch + i * 30.4375 * 86_400_000;
      // Cycle: 2021 peak -> 2022-2023 cooldown -> 2024-2026 solid stabilization
      if (i < 8) {
        pRaw += 50;
        p80 += 150;
        p92 += 250;
        p98 += 1500;
      } else if (i < 26) {
        pRaw -= 20;
        p80 -= 60;
        p92 -= 120;
        p98 -= 600;
      } else {
        pRaw += 15;
        p80 += 40;
        p92 += 75;
        p98 += 450;
      }

      snapshots.push({
        date: new Date(epochMs).toISOString().slice(0, 10),
        epochMs,
        pricesByGrade: {
          RAW: Number(pRaw.toFixed(2)),
          "8.0": Number(p80.toFixed(2)),
          "9.2": Number(p92.toFixed(2)),
          "9.8": Number(p98.toFixed(2)),
        },
      });
    }

    const input: SovereignPricingEngineInput = {
      comicId: "2386994",
      series: "The Incredible Hulk",
      issue: "181",
      publicationYear: 1974,
      monthlySnapshots: snapshots,
      rawPurchaseCost: 1800.0,
      censusPopByGrade: {
        "9.8": 88,
        "9.2": 612,
        "8.0": 1420,
      },
    };

    const output = executeSovereignPricingEngine(input);

    // 1. Era Verification
    expect(output.era).toBe("Bronze");
    expect(output.portfolioRiskSummary.liquidityAnchorGrade).toBe("9.2");
    expect(output.snapshotCount).toBe(60);
    expect(output.timeHorizonYears).toBeGreaterThan(4.8);

    // 2. Complete 14-Grade Matrix Verification
    const gMatrix = output.gradeMatrix;
    expect(gMatrix["RAW"].currentFmv).toBeGreaterThan(1500);
    expect(gMatrix["8.0"].currentFmv).toBeGreaterThan(4000);
    expect(gMatrix["9.2"].currentFmv).toBeGreaterThan(7000);
    expect(gMatrix["9.8"].currentFmv).toBeGreaterThan(40000);

    // Verify non-observed grades were interpolated via elastic ratios
    expect(gMatrix["9.4"].currentFmv).toBeGreaterThan(gMatrix["9.2"].currentFmv);
    expect(gMatrix["9.6"].currentFmv).toBeGreaterThan(gMatrix["9.4"].currentFmv);
    expect(gMatrix["9.8"].currentFmv).toBeGreaterThan(gMatrix["9.6"].currentFmv);
    expect(gMatrix["10.0"].currentFmv).toBeGreaterThan(gMatrix["9.8"].currentFmv);

    // 3. Multi-Horizon Momenta Verification
    expect(gMatrix["9.8"].momenta.macro5yPct).toBeDefined();
    expect(gMatrix["9.8"].momenta.change30dPct).toBeDefined();
    expect(gMatrix["9.8"].annualizedVolatility).toBeGreaterThan(0.05);
    expect(gMatrix["9.8"].maxDrawdownPct).toBeGreaterThan(10);
    expect(gMatrix["9.8"].sma20).toBeDefined();
    expect(gMatrix["9.8"].rsi14).toBeDefined();

    // 4. Grading Arbitrage Ladder Verification with Transition Probability
    expect(output.gradingArbitrageLadder.length).toBeGreaterThan(3);
    const opt98 = output.gradingArbitrageLadder.find((opt) => opt.targetGrade === "9.8");
    expect(opt98).toBeDefined();
    expect(opt98!.gradingAlphaSpread).toBeGreaterThan(30000);
    expect(opt98!.targetGradeProbability).toBe(0.25);
    expect(opt98!.expectedNetProfit).toBeGreaterThan(5000);
    expect(opt98!.marginOfSafetyPct).toBeGreaterThan(90);
    expect(opt98!.isFavorable).toBe(true);
  });

  it("verifies unindexed census defaults to UNINDEXED, not false MODERATE", () => {
    const input: SovereignPricingEngineInput = {
      comicId: "test-unindexed",
      series: "Spawn",
      issue: "1",
      publicationYear: 1992,
      publisher: "Image Comics",
      monthlySnapshots: [
        {
          date: "2026-01-01",
          epochMs: Date.parse("2026-01-01T00:00:00Z"),
          pricesByGrade: { RAW: 25, "9.8": 150 },
        },
      ],
      // No census population supplied
    };

    const output = executeSovereignPricingEngine(input);
    expect(output.era).toBe("Independent");
    expect(output.portfolioRiskSummary.scarcityTier).toBe("UNINDEXED");
  });

  it("strictly enforces Zero Fake Data Covenant on unmeasured volatility and zero completed trades", () => {
    const input: SovereignPricingEngineInput = {
      comicId: "zero-data-check",
      series: "Amazing Spider-Man",
      issue: "300",
      publicationYear: 1988,
      publisher: "Marvel Comics",
      completedSalesCount: 0, // Zero observed auction transactions
      monthlySnapshots: [
        {
          date: "2026-10-01",
          epochMs: Date.parse("2026-10-01T00:00:00Z"),
          pricesByGrade: { RAW: 200, "9.8": 2800 },
        },
      ],
      censusPopByGrade: { "9.8": 1500 },
    };

    const output = executeSovereignPricingEngine(input);

    // 1. Prediction interval must be null when volatility cannot be measured (only 1 snapshot)
    expect(output.gradeMatrix["9.8"].annualizedVolatility).toBeNull();
    expect(output.gradeMatrix["9.8"].valuationDecomposition.predictionInterval80).toBeNull();

    // 2. Provenance tag must be VALUATION_SNAPSHOT when completed trades = 0
    expect(output.gradeMatrix["9.8"].provenanceTag).toBe("VALUATION_SNAPSHOT");

    // 3. CTR must be null and tier must be NO_OBSERVED_TRADES when trades = 0, NOT fabricated 1
    expect(output.contrarianStrategies.censusTurnoverRatio).toBeNull();
    expect(output.contrarianStrategies.turnoverVelocityTier).toBe("NO_OBSERVED_TRADES");
  });
});
