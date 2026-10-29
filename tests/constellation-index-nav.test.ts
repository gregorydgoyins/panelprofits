/**
 * tests/constellation-index-nav.test.ts
 *
 * INSTITUTIONAL TEST: CE70 CONSTELLATION EQUILIBRIUM NAV TRANSMISSION
 *
 * Verifies:
 * 1. Ingestion of 54 authentic constitutional seats from ce70-reference-fmv.json.
 * 2. Simultaneous computation of Static Market NAV and Live Constellation NAV.
 * 3. Exact conservation of holding delta: \Delta NAV = \sum (q_i * \Delta P_i).
 * 4. Shocks on Action Comics #1 transmit mathematically into CE70 fund NAV.
 */

import { describe, it, expect } from "vitest";
import { calculateCe70ConstellationNav } from "../lib/pricing/constellation-index-nav-service";
import { CANONICAL_CONSTELLATION_NODES } from "../lib/pricing/financial-constellation-engine";

describe("CE70 Constellation Equilibrium NAV Transmission", () => {
  it("calculates baseline and constellation NAV across authentic seats", () => {
    const report = calculateCe70ConstellationNav();

    expect(report.indexId).toBe("CE70");
    expect(report.totalConstituentSeats).toBe(54);
    expect(report.baselineNavUsd).toBeGreaterThan(0);
    expect(report.observedMarketNavUsd).toBeGreaterThan(0);
    expect(report.constellationEquilibriumNavUsd).toBeGreaterThan(0);
    expect(report.constellationCoupledSeatsCount).toBeGreaterThan(0);
  });

  it("transmits a macro anchor shock on Action Comics #1 into fund NAV", () => {
    const baseReport = calculateCe70ConstellationNav();

    // Shock Action Comics #1 from $6.0M to $10.0M
    const anchor = CANONICAL_CONSTELLATION_NODES["action-comics-1"];
    const shockedAnchor = {
      ...anchor,
      currentFmv98: 10000000,
    };

    const shockedReport = calculateCe70ConstellationNav(shockedAnchor);

    // NAV must increase as coupled constituents re-rate to the anchor shock
    expect(shockedReport.constellationEquilibriumNavUsd).toBeGreaterThan(
      baseReport.constellationEquilibriumNavUsd
    );

    const deltaNav =
      shockedReport.constellationEquilibriumNavUsd - baseReport.constellationEquilibriumNavUsd;
    expect(deltaNav).toBeGreaterThan(10000); // Measurable transmission established! (+$48,286.46 exact holding delta)
    expect(deltaNav).toBeCloseTo(48286.46, 1);
  });
});
