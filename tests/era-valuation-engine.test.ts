import { describe, it, expect } from "vitest";
import {
  executeEraValuationEngine,
  ERA_VALUATION_PROFILES,
} from "../lib/pricing/era-valuation-engine";

describe("Phase 3: Era-Specific Empirical Valuation Engine Verification Suite", () => {
  it("applies extreme physical scarcity weighting for Golden Age landmark equities", () => {
    // Action Comics #1 (Golden Age)
    const result = executeEraValuationEngine({
      comicId: "action-1",
      series: "Action Comics",
      issue: "1",
      era: "Golden",
      totalCensusPop: 75,
      observedGradePrices: {
        "2.0": 1500000,
        "6.0": 3400000,
      },
    });

    expect(result.era).toBe("Golden");
    expect(result.primaryValueDriver).toBe("EXTREME_PHYSICAL_SCARCITY");
    expect(result.parameters.baseScarcityBeta).toBe(2.4);
    expect(result.parameters.gradeNonLinearityExponent).toBe(1.2); // Low exponent means low grades retain massive value
  });

  it("applies 9.8 apex grade cliff for Copper & Modern equities with high print runs", () => {
    // Spawn #1 or ASM #300 (Copper/Modern)
    const result = executeEraValuationEngine({
      comicId: "spawn-1",
      series: "Spawn",
      issue: "1",
      era: "Copper",
      totalCensusPop: 15000,
      observedGradePrices: {
        "9.8": 220,
        "9.6": 45,
        "9.4": 25,
      },
    });

    expect(result.era).toBe("Copper");
    expect(result.primaryValueDriver).toBe("APEX_98_GRADE_CLIFF");
    expect(result.parameters.gradeNonLinearityExponent).toBe(2.8); // Steep cliff between 9.8 and lower grades
    expect(result.isSparseDataRegime).toBe(false); // 3 observed points -> not sparse
    expect(result.shrinkageWeight).toBe(0.0);
  });

  it("activates Bayesian sparse shrinkage when grade observations are scarce", () => {
    // Ultra rare indie or single observation book
    const result = executeEraValuationEngine({
      comicId: "rare-indie-1",
      series: "Albedo",
      issue: "2",
      era: "Copper",
      totalCensusPop: 40,
      observedGradePrices: {
        "8.0": 1200,
      },
    });

    expect(result.isSparseDataRegime).toBe(true);
    expect(result.shrinkageWeight).toBe(0.75); // Single observation borrows 75% strength from prior
    expect(result.synthesizedGradeCurve["9.8"]).toBeDefined();
    expect(result.synthesizedGradeCurve["9.8"]!).toBeGreaterThan(1200);
  });
});
