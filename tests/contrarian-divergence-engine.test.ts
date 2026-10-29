import { describe, it, expect } from "vitest";
import {
  executeContrarianDivergenceEngine,
} from "../lib/pricing/contrarian-divergence-engine";

describe("Phase 5: Traditional & Contrarian Strategy Engines Verification Suite", () => {
  it("fires APEX_CAPITULATION_BUY when Z < -1.8 sigma, RSI < 32, and Margin of Safety >= 20%", () => {
    const signal = executeContrarianDivergenceEngine({
      comicId: "blue-chip-oversold",
      series: "Incredible Hulk",
      issue: "181",
      currentFmvUsd: 8200,
      marketPriceDeltaPct90d: -32.0,
      fundamentalDemandDeltaPct90d: 5.0,
      priceZScore90d: -2.1,
      rsi14: 24.5, // deeply oversold capitulation
      marginOfSafetyPct: 28.0,
      dealerExecutionFloor: 7500,
    });

    expect(signal.signalTier).toBe("APEX_CAPITULATION_BUY");
    expect(signal.actionRecommendation).toBe("EXECUTE_IMMEDIATE_BUY");
    expect(signal.divergenceSpread).toBeGreaterThan(2.0); // Demand up, price down
  });

  it("triggers FALLING_KNIFE_DO_NOT_CATCH when drop is severe (Z < -1.8) but RSI momentum has not bottomed", () => {
    const signal = executeContrarianDivergenceEngine({
      comicId: "superman-falling",
      series: "Superman",
      issue: "7",
      currentFmvUsd: 12000,
      marketPriceDeltaPct90d: -30.0,
      fundamentalDemandDeltaPct90d: -10.0,
      priceZScore90d: -2.0,
      rsi14: 42.0, // still dropping, momentum has NOT bottomed below 32
      marginOfSafetyPct: 15.0,
      dealerExecutionFloor: 9000,
    });

    expect(signal.signalTier).toBe("FALLING_KNIFE_DO_NOT_CATCH");
    expect(signal.actionRecommendation).toBe("WAIT_FOR_SUPPORT_CONFIRMATION");
  });

  it("detects FADE_EUPHORIC_SPIKE when price is stretched far beyond fundamental demand", () => {
    const signal = executeContrarianDivergenceEngine({
      comicId: "hype-book",
      series: "Secret Wars",
      issue: "8",
      currentFmvUsd: 450,
      marketPriceDeltaPct90d: 85.0,
      fundamentalDemandDeltaPct90d: 5.0,
      priceZScore90d: 2.6,
      rsi14: 78.0,
      marginOfSafetyPct: -25.0,
      dealerExecutionFloor: 280,
    });

    expect(signal.signalTier).toBe("FADE_EUPHORIC_SPIKE");
    expect(signal.actionRecommendation).toBe("TAKE_PROFITS");
  });
});
