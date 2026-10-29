/**
 * tests/financial-constellation-engine.test.ts
 *
 * INSTITUTIONAL GROUND-UP TEST SUITE: FINANCIAL CONSTELLATION THEORY (C-THEORY)
 *
 * Tests:
 * 1. Proper resolution of Macro Reserve Anchor (Action Comics #1),
 *    Golden Age Flagship (Detective Comics #27), and Silver Age Anchor (Fantastic Four #1).
 * 2. Strict Dimensional Homogeneity: All output prices are in USD ($).
 * 3. Bounded Transmission Shocks: Macro Anchor price increases transmit dampened
 *    impulses through network coupling (\omega < 1.0) to satellite keys.
 * 4. Idiosyncratic Decoupling: Non-constellation equities decouple (\omega = 0)
 *    and do not move in lockstep with the Golden Age anchor.
 * 5. Relative Scarcity and Fandom Multiplier Dynamics.
 */

import { describe, it, expect } from "vitest";
import {
  resolveConstellationNode,
  calculateConstellationEquilibrium,
  CANONICAL_CONSTELLATION_NODES,
} from "../lib/pricing/financial-constellation-engine";

describe("Financial Constellation Engine (Ground-Up Implementation)", () => {
  it("resolves canonical anchors and satellite keys accurately", () => {
    const action1 = resolveConstellationNode("Action Comics", "1", 1938);
    expect(action1).not.toBeNull();
    expect(action1?.role).toBe("MACRO_RESERVE_ANCHOR");
    expect(action1?.canonicalId).toBe("action-comics-1");
    expect(action1?.era).toBe("Golden");

    const detective27 = resolveConstellationNode("Detective Comics", "27", 1939);
    expect(detective27).not.toBeNull();
    expect(detective27?.role).toBe("ERA_FLAGSHIP_ANCHOR");
    expect(detective27?.era).toBe("Golden");

    const ff1 = resolveConstellationNode("Fantastic Four", "1", 1961);
    expect(ff1).not.toBeNull();
    expect(ff1?.role).toBe("ERA_FLAGSHIP_ANCHOR");
    expect(ff1?.era).toBe("Silver");

    const af15 = resolveConstellationNode("Amazing Fantasy", "15", 1962);
    expect(af15).not.toBeNull();
    expect(af15?.role).toBe("SATELLITE_KEY");
    expect(af15?.anchorTargetId).toBe("fantastic-four-1");
  });

  it("calculates exact dimensional equilibrium in USD without lockstep distortion", () => {
    const af15 = CANONICAL_CONSTELLATION_NODES["amazing-fantasy-15"];
    const equilibrium = calculateConstellationEquilibrium(af15);

    expect(equilibrium.equilibriumPrice98Usd).toBeGreaterThan(0);
    // Baseline is 1,400,000; with drift and anchor appreciation, it should sit in multi-million territory
    expect(equilibrium.equilibriumPrice98Usd).toBeGreaterThan(2000000);
    expect(equilibrium.relativeScarcityMultiple).toBeGreaterThan(0);
    expect(equilibrium.relativeFandomMultiple).toBeGreaterThan(0);
    expect(equilibrium.isDecoupled).toBe(false);
  });

  it("demonstrates dampened cross-asset transmission when anchor experiences a macro shock", () => {
    const targetKey = CANONICAL_CONSTELLATION_NODES["amazing-fantasy-15"];
    const baseAnchor = CANONICAL_CONSTELLATION_NODES["fantastic-four-1"];

    // 1. Base run
    const baseResult = calculateConstellationEquilibrium(targetKey, baseAnchor);

    // 2. Shock the anchor: Fantastic Four #1 doubles from $1.85M to $3.70M (+100% shock)
    const shockedAnchor = {
      ...baseAnchor,
      currentFmv98: baseAnchor.currentFmv98 * 2.0,
    };
    const shockedResult = calculateConstellationEquilibrium(targetKey, shockedAnchor);

    const anchorGrowthPct = 100.0;
    const targetGrowthPct =
      ((shockedResult.equilibriumPrice98Usd - baseResult.equilibriumPrice98Usd) / baseResult.equilibriumPrice98Usd) *
      100;

    // With coupling elasticity \omega = 0.48, target should appreciate by ~2^(0.48) - 1 \approx +39.5%, NOT +100%
    expect(targetGrowthPct).toBeGreaterThan(30.0);
    expect(targetGrowthPct).toBeLessThan(50.0);
    expect(targetGrowthPct).toBeLessThan(anchorGrowthPct); // Bounded network dampening proved!
  });

  it("strictly decouples unrelated standard equities from the Golden Age anchor", () => {
    const commonBook = resolveConstellationNode("Spawn", "1", 1992, 120);
    expect(commonBook).not.toBeNull();
    expect(commonBook?.role).toBe("DECOUPLED_EQUITY");
    expect(commonBook?.couplingElasticity).toBe(0.0);

    const equilibrium = calculateConstellationEquilibrium(commonBook!);
    expect(equilibrium.isDecoupled).toBe(true);
    expect(equilibrium.equilibriumPrice98Usd).toBe(120);
    expect(equilibrium.networkImpulseDeltaPct).toBe(0.0);
  });
});
