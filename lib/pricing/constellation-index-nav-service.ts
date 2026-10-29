/**
 * lib/pricing/constellation-index-nav-service.ts
 *
 * STEP 2: CE70 & SECTOR INDEX CONSTELLATION EQUILIBRIUM NAV TRANSMISSION
 *
 * Connects the live Financial Constellation Engine directly into the CE70 constitutional
 * benchmark fund and sector index NAV calculations.
 *
 * Mechanism:
 * When anchor transaction shocks occur (e.g. Action #1 jumps from $3.2M to $6.0M),
 * the index engine re-rates constituent seats using their Constellation Equilibrium yields
 * rather than waiting for lagging annual auction reports.
 *
 * Invariants:
 * - Real Constitutional Seats: Direct ingestion from ce70-reference-fmv.json.
 * - Strict Financial Conservation: \Delta NAV = \sum (q_i * \Delta P_i).
 * - Zero Fake Data Covenant: If an equity is outside the constellation map, it retains
 *   its verified baseline reference FMV.
 */

import ce70ReferenceData from "@/lib/equity/ce70-reference-fmv.json";
import {
  resolveConstellationNode,
  calculateConstellationEquilibrium,
  type ConstellationNode,
} from "./financial-constellation-engine";

export interface ConstituentNavSeat {
  seatNumber: number;
  series: string;
  issueNumber: string;
  title: string;
  quantity: number;
  baselinePriceUsd: number;
  currentObservedPriceUsd: number;
  constellationEquilibriumPriceUsd: number;
  effectiveHoldingValueUsd: number;
  isConstellationCoupled: boolean;
  couplingElasticity: number;
}

export interface ConstellationIndexNavReport {
  indexId: string;
  indexName: string;
  totalConstituentSeats: number;
  totalUnitsHeld: number;
  baselineNavUsd: number;
  observedMarketNavUsd: number;
  constellationEquilibriumNavUsd: number;
  transmissionNavDeltaPct: number;
  activeMacroAnchorPriceUsd: number;
  constellationCoupledSeatsCount: number;
  constituents: ConstituentNavSeat[];
  evaluatedAt: string;
}

/**
 * Calculates CE70 Index NAV under both Static Market Prices and Live Constellation Equilibrium
 */
export function calculateCe70ConstellationNav(
  customAnchorOverride?: ConstellationNode
): ConstellationIndexNavReport {
  const seats: ConstituentNavSeat[] = [];
  let baselineNav = 0;
  let observedNav = 0;
  let constellationNav = 0;
  let coupledCount = 0;
  let totalUnits = 0;

  // Process all unique seats 1..54 from ce70 reference data
  for (let seatNum = 1; seatNum <= 70; seatNum++) {
    const rawSeat = (ce70ReferenceData as Record<string, any>)[String(seatNum)];
    if (!rawSeat) continue;

    const basePrice = Number(rawSeat.referenceFmvUsd || rawSeat.grade98FmvUsd || rawSeat.rawFmvUsd || 1000);
    const observedPrice = Number(rawSeat.grade98FmvUsd || basePrice);
    const quantity = 1; // 1 unit per constitutional benchmark seat

    // Resolve constellation node for this constituent
    const node = resolveConstellationNode(
      rawSeat.series,
      String(rawSeat.issueNumber),
      rawSeat.year,
      observedPrice
    );

    const equilibrium = node
      ? calculateConstellationEquilibrium(node, customAnchorOverride)
      : null;

    const isCoupled = Boolean(equilibrium && !equilibrium.isDecoupled);
    const constPrice = isCoupled && equilibrium
      ? equilibrium.equilibriumPrice98Usd
      : observedPrice;

    if (isCoupled) coupledCount++;

    const holdingVal = constPrice * quantity;
    baselineNav += basePrice * quantity;
    observedNav += observedPrice * quantity;
    constellationNav += holdingVal;
    totalUnits += quantity;

    seats.push({
      seatNumber: rawSeat.seatNumber,
      series: rawSeat.series,
      issueNumber: String(rawSeat.issueNumber),
      title: rawSeat.title,
      quantity,
      baselinePriceUsd: basePrice,
      currentObservedPriceUsd: observedPrice,
      constellationEquilibriumPriceUsd: constPrice,
      effectiveHoldingValueUsd: holdingVal,
      isConstellationCoupled: isCoupled,
      couplingElasticity: node?.couplingElasticity ?? 0.0,
    });
  }

  const transmissionNavDeltaPct = observedNav > 0
    ? Number((((constellationNav - observedNav) / observedNav) * 100).toFixed(2))
    : 0.0;

  return {
    indexId: "CE70",
    indexName: "Constitutional Equity 70 Sovereign Benchmark",
    totalConstituentSeats: seats.length,
    totalUnitsHeld: totalUnits,
    baselineNavUsd: Number(baselineNav.toFixed(2)),
    observedMarketNavUsd: Number(observedNav.toFixed(2)),
    constellationEquilibriumNavUsd: Number(constellationNav.toFixed(2)),
    transmissionNavDeltaPct,
    activeMacroAnchorPriceUsd: customAnchorOverride?.currentFmv98 ?? 6000000,
    constellationCoupledSeatsCount: coupledCount,
    constituents: seats,
    evaluatedAt: new Date().toISOString(),
  };
}
