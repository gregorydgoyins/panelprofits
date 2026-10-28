import { describe, it, expect } from "vitest";
import {
  calculateGradingCallOption,
  calculateAnnualizedVolatility,
  calculateMaxDrawdown,
  calculateSma,
  calculateEma,
  analyzeQuantitativeEquity,
  type MonthlyPricePoint,
} from "@/lib/pricing/quantitative-valuation";

describe("Quantitative Valuation & Technicals Engine", () => {
  it("calculates Black-Scholes call option metrics for comic grading arbitrage", () => {
    // e.g. Raw comic is $250, target CGC 9.8 is $1,200, grading+pressing strike cost is $75 ($325 total)
    const rawPrice = 250;
    const targetGradedPrice = 1200;
    const strikeCost = 325;
    const volatility = 0.35; // 35% annualized volatility

    const option = calculateGradingCallOption(rawPrice, targetGradedPrice, strikeCost, volatility, 0.5, 0.045);

    expect(option.targetGradedPrice).toBe(1200);
    expect(option.strikeCost).toBe(325);
    expect(option.intrinsicValue).toBe(875); // 1200 - 325
    expect(option.callOptionValue).toBeGreaterThan(option.intrinsicValue);
    expect(option.gradingAlphaSpread).toBe(875);
    expect(option.isGradingArbitrageFavorable).toBe(true);
  });

  it("calculates annualized volatility and max drawdown correctly", () => {
    // 6 months of prices: 100, 120, 110, 140, 90, 105
    const prices = [100, 120, 110, 140, 90, 105];
    const vol = calculateAnnualizedVolatility(prices);
    const mdd = calculateMaxDrawdown(prices);

    expect(vol).toBeDefined();
    expect(vol!).toBeGreaterThan(0.2); // Sizable volatility
    // Max peak was 140, dropped to 90 -> ((140 - 90) / 140) * 100 = 35.71%
    expect(mdd).toBe(35.71);
  });

  it("calculates moving averages across horizons", () => {
    const prices = [10, 20, 30, 40, 50];
    expect(calculateSma(prices, 3)).toBe(40); // (30 + 40 + 50) / 3 = 40
    expect(calculateEma(prices, 3)).toBeDefined();
  });

  it("runs full quantitative equity diagnostics across 60 monthly coordinates", () => {
    // Construct 60 synthetic monthly points simulating 5 years (Nov 2021 to Oct 2026)
    const points: MonthlyPricePoint[] = [];
    const baseTime = Date.parse("2021-11-01T00:00:00Z");

    let p = 50.0;
    for (let i = 0; i < 60; i++) {
      const epochMs = baseTime + i * 30.5 * 86_400_000;
      // Simulate post-2021 peak, 2022-2023 dip, and 2024-2026 recovery
      if (i < 10) p += 5.0; // Bull run to ~100
      else if (i < 30) p -= 2.0; // Drawdown to ~60
      else p += 1.5; // Steady recovery to ~105

      points.push({
        date: new Date(epochMs).toISOString().slice(0, 10),
        epochMs,
        priceUsd: Number(p.toFixed(2)),
      });
    }

    const diagnostics = analyzeQuantitativeEquity(points, "9.8");

    expect(diagnostics).not.toBeNull();
    expect(diagnostics!.sampleSize).toBe(60);
    expect(diagnostics!.currentPrice).toBeGreaterThan(100);
    expect(diagnostics!.momenta.macro5yPct).toBeGreaterThan(50);
    expect(diagnostics!.annualizedVolatility).toBeGreaterThan(0);
    expect(diagnostics!.sma20).toBeDefined();
    expect(diagnostics!.sma50).toBeDefined();
    expect(diagnostics!.rsi14).toBeDefined();
    expect(diagnostics!.cagr5y).toBeDefined();
    expect(diagnostics!.marketRegime).toBeDefined();
  });
});
