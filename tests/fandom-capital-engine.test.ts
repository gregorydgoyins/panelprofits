import { describe, it, expect } from "vitest";
import {
  executeFandomCapitalEngine,
  estimateGenerationalCohorts,
  calculateEmotionalYield,
  type FandomMetricsInput,
} from "@/lib/pricing/fandom-capital-engine";

describe("Phase 1: Fandom Capital & Generational Demand Engine Verification Suite", () => {
  it("verifies generational cohort shifting across Golden vs Modern eras", () => {
    const goldenCohorts = estimateGenerationalCohorts("Golden", 1940);
    expect(goldenCohorts.boomerPct).toBeGreaterThan(0.40);
    expect(goldenCohorts.genZPct).toBeLessThan(0.10);
    expect(goldenCohorts.dominantCohort).toBe("BOOMER_SILVER");

    const modernCohorts = estimateGenerationalCohorts("Modern", 2015, "THEATRICAL_BLOCKBUSTER");
    expect(modernCohorts.genZPct).toBeGreaterThan(0.25);
    expect(modernCohorts.renewalVelocityScore).toBeGreaterThan(60);
  });

  it("calculates emotional yield ensuring older blue chips generate strong psychological dividends", () => {
    const goldenYield = calculateEmotionalYield("Golden", 85, true);
    const modernYield = calculateEmotionalYield("Modern", 45, false);

    expect(goldenYield).toBeGreaterThan(0.06); // > 6.0% annual non-financial dividend
    expect(modernYield).toBeLessThan(0.04);
    expect(goldenYield).toBeGreaterThan(modernYield);
  });

  it("models fandom breadth, intensity, and collector conversion without synthetic hallucination", () => {
    const input: FandomMetricsInput = {
      comicId: "2386994",
      series: "The Incredible Hulk",
      issue: "181",
      era: "Bronze",
      publicationYear: 1974,
      totalCensusPop: 16000,
      trailing12mSalesCount: 150,
      searchInterestIndex: 92,
      adaptationPresence: "THEATRICAL_BLOCKBUSTER",
      yearsSinceLastMediaAdaptation: 1,
    };

    const profile = executeFandomCapitalEngine(input);

    expect(profile.fandomBreadthScore).toBe(92);
    expect(profile.fandomPersistenceScore).toBeGreaterThan(70);
    expect(profile.fandomCapitalTier).toBe("BLUE_CHIP_MONUMENT");
    expect(profile.emotionalYieldAnnualRate).toBeGreaterThan(0.04);
    expect(profile.expectedQualifiedDemandUnits).toBeDefined();
    expect(profile.expectedQualifiedDemandUnits!).toBeGreaterThan(150);
  });

  it("correctly identifies zealot cult core and dormant legacies", () => {
    const cultInput: FandomMetricsInput = {
      comicId: "cult-ec",
      series: "Vault of Horror",
      issue: "12",
      era: "Golden",
      publicationYear: 1950,
      totalCensusPop: 180,
      trailing12mSalesCount: 2, // Ultra low churn -> high intensity
      searchInterestIndex: 35, // Low general breadth
    };

    const cultProfile = executeFandomCapitalEngine(cultInput);
    expect(cultProfile.fandomIntensityScore).toBeGreaterThan(80);
    expect(cultProfile.fandomCapitalTier).toBe("ZEALOT_CULT_CORE");
  });
});
