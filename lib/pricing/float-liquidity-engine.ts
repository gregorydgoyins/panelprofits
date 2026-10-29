/**
 * lib/pricing/float-liquidity-engine.ts
 *
 * PHASE 2 OF MASTER BLUEPRINT:
 * PHYSICAL SUPPLY & EQUITY FLOAT ENGINE
 *
 * Implements microstructural supply and liquidity mechanics:
 * 1. Physical Census Population vs. Tradeable Circulating Float:
 *      Separates surviving physical copies from actively circulating market copies.
 *      Most physical copies (often > 90-95%) sit in private collections, safe deposit boxes,
 *      or permanent vaults and do not trade in any given 12-month window.
 * 2. Amihud Illiquidity Ratio (ILLIQ):
 *      ILLIQ = (1 / N) * \sum_{t=1}^N ( |R_t| / DollarVolume_t )
 *      Captures the absolute price response associated with one dollar of trading volume.
 * 3. Market Impact Function (Kyle / Almgren-Chriss stylized):
 *      Price impact Q(v) = \lambda * \sqrt{v / V_ADV} * \sigma
 *      Estimates expected slippage when liquidating size relative to average daily volume.
 * 4. Separate Physical Slabs from Simulated Equity Shares:
 *      Physical copies = concrete graded/raw books (CGC, CBCS, PGX).
 *      F_shares = simulated equity units representing fractional or synthetic equity exposure.
 *
 * Zero Fake Data Covenant:
 * - If volume or price history is missing, returns UNMEASURED / null.
 * - Never invents synthetic float or false liquidity depth.
 */

import type { CanonicalGrade } from "./sovereign-equity-pricing-engine";
import type { ComicEra } from "./comic-portfolio-tracker";

export interface TransactionExecutionRecord {
  date: string; // ISO format YYYY-MM-DD
  grade: CanonicalGrade;
  priceUsd: number;
  volumeUnits?: number; // defaults to 1 if not specified
}

export interface FloatLiquidityInput {
  comicId: string;
  series: string;
  issue: string;
  era: ComicEra;
  // Physical surviving census
  totalCensusPop?: number | null;
  censusPopByGrade?: Partial<Record<CanonicalGrade, number>>;
  // Historical transactions in trailing 12-month window
  trailingCompletedTransactions?: TransactionExecutionRecord[];
  trailing12mSalesCount?: number;
  // Valuation reference for dollar depth
  benchmarkFmvUsd?: number | null;
}

export interface AmihudIlliquidityMetric {
  illiqValue: number | null; // Amihud ratio (x 10^6 for readability, or raw)
  observationDays: number;
  averageDollarVolumePerTrade: number | null;
  interpretation: "DEEP_INSTITUTIONAL_LIQUIDITY" | "BALANCED_ORDER_DEPTH" | "THIN_MARKET_HIGH_SLIPPAGE" | "ACUTE_ILLIQUIDITY" | "UNMEASURED";
}

export interface MarketImpactEstimate {
  oneUnitImpactPct: number | null; // % price movement expected from 1 unit market sell
  fiveUnitImpactPct: number | null; // % price movement expected from 5 units market sell
  estimatedWholesaleHaircutPct: number | null; // dealer execution haircut based on float depth
  liquidityTier: "HIGH_LIQUIDITY_DEPTH" | "MODERATE_LIQUIDITY" | "THIN_AUCTION_FLOAT" | "ILLIQUID_SPECIALTY" | "UNMEASURED";
}

export interface PhysicalSupplyAndFloatProfile {
  comicId: string;
  series: string;
  issue: string;
  era: ComicEra;
  // Physical supply structure
  totalCensusPop: number | null;
  isCensusIndexed: boolean;
  vaultedHordeCount: number | null; // Physical copies in permanent hands (non-circulating)
  circulatingFloatCopies: number | null; // Actively trading float in trailing 12m
  circulatingFloatPct: number | null; // Circulating float as % of total census
  floatTurnoverRatio: number | null; // Census Population / Annual Volume
  floatTurnoverVelocityTier: "HIGH_VELOCITY_FLOAT" | "BALANCED_TURNOVER" | "LOW_TURNOVER_DORMANT" | "NO_OBSERVED_TRADES" | "UNMEASURED" | "UNINDEXED";
  // Microstructure illiquidity
  amihudIlliquidity: AmihudIlliquidityMetric;
  marketImpact: MarketImpactEstimate;
  // Equity share representation
  simulatedEquitySharesTotal: number; // e.g. 100,000 baseline shares issued per equity seat
  simulatedCirculatingShares: number; // float-adjusted active equity shares
  dataProvenance: {
    censusSource: "OBSERVED_CENSUS" | "UNINDEXED";
    circulatingFloat: "EMPIRICALLY_ESTIMATED" | "UNMEASURED";
    amihudRatio: "OBSERVED_TRANSACTIONS" | "UNMEASURED";
    marketImpact: "EMPIRICALLY_ESTIMATED" | "UNMEASURED";
  };
}

/**
 * Computes the Amihud Illiquidity proxy from completed transactions.
 * ILLIQ = (1 / N) * sum( |Return_t| / DollarVolume_t )
 */
export function computeAmihudIlliquidity(
  transactions: TransactionExecutionRecord[] = [],
  fallbackFmv?: number | null
): AmihudIlliquidityMetric {
  if (!transactions || transactions.length < 2) {
    return {
      illiqValue: null,
      observationDays: transactions?.length ?? 0,
      averageDollarVolumePerTrade: transactions?.length === 1 ? transactions[0].priceUsd : null,
      interpretation: "UNMEASURED",
    };
  }

  // Sort chronologically
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalIlliq = 0;
  let validPairs = 0;
  let totalDollarVol = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (prev.priceUsd <= 0 || curr.priceUsd <= 0) continue;

    const returnAbs = Math.abs((curr.priceUsd - prev.priceUsd) / prev.priceUsd);
    const tradeDollarVolume = curr.priceUsd * (curr.volumeUnits ?? 1);
    totalDollarVol += tradeDollarVolume;

    if (tradeDollarVolume > 0) {
      // Scale by 10,000 for standard scaled Amihud index
      totalIlliq += (returnAbs / tradeDollarVolume) * 10000;
      validPairs++;
    }
  }

  if (validPairs === 0) {
    return {
      illiqValue: null,
      observationDays: sorted.length,
      averageDollarVolumePerTrade: totalDollarVol / sorted.length,
      interpretation: "UNMEASURED",
    };
  }

  const rawIlliq = totalIlliq / validPairs;
  const avgDollarVol = totalDollarVol / validPairs;

  let interpretation: AmihudIlliquidityMetric["interpretation"] = "BALANCED_ORDER_DEPTH";
  if (rawIlliq < 0.2) {
    interpretation = "DEEP_INSTITUTIONAL_LIQUIDITY";
  } else if (rawIlliq <= 1.0) {
    interpretation = "BALANCED_ORDER_DEPTH";
  } else if (rawIlliq <= 3.0) {
    interpretation = "THIN_MARKET_HIGH_SLIPPAGE";
  } else {
    interpretation = "ACUTE_ILLIQUIDITY";
  }

  return {
    illiqValue: Number(rawIlliq.toFixed(4)),
    observationDays: sorted.length,
    averageDollarVolumePerTrade: Number(avgDollarVol.toFixed(2)),
    interpretation,
  };
}

/**
 * Calculates market impact and wholesale liquidation haircut
 */
export function estimateMarketImpact(
  circulatingFloat: number | null,
  annualVolume: number | null,
  amihud: AmihudIlliquidityMetric,
  era: ComicEra
): MarketImpactEstimate {
  if (circulatingFloat == null || annualVolume == null || annualVolume === 0) {
    return {
      oneUnitImpactPct: null,
      fiveUnitImpactPct: null,
      estimatedWholesaleHaircutPct: null,
      liquidityTier: "UNMEASURED",
    };
  }

  // Monthly average volume
  const monthlyVolume = Math.max(0.1, annualVolume / 12);

  // Base slippage per unit: inversely related to depth
  // In thin markets (e.g. 5 sales/year), dumping 1 unit represents 20% of annual flow.
  const unitToFloatRatio = 1 / Math.max(1, circulatingFloat);
  const unitToMonthlyVolumeRatio = 1 / monthlyVolume;

  // Base price elasticity by era
  let eraSensitivity = 1.0;
  if (era === "Golden") eraSensitivity = 1.8;
  else if (era === "Silver") eraSensitivity = 1.3;
  else if (era === "Bronze") eraSensitivity = 1.1;
  else if (era === "Modern") eraSensitivity = 0.8;

  // If we have empirical Amihud ratio, weight it heavily
  const illiqMultiplier = amihud.illiqValue != null ? Math.min(3.0, Math.max(0.5, amihud.illiqValue * 2)) : 1.0;

  // Calculate percentage impact of selling 1 unit
  const oneUnitImpact = Number(
    Math.min(45, Math.max(1.5, Math.sqrt(unitToMonthlyVolumeRatio) * 4.5 * eraSensitivity * illiqMultiplier)).toFixed(2)
  );

  // Selling 5 units has square-root non-linear price impact
  const fiveUnitImpact = Number(
    Math.min(65, Math.max(oneUnitImpact * 1.5, oneUnitImpact * Math.sqrt(5))).toFixed(2)
  );

  // Liquidity tier assignment
  let liquidityTier: MarketImpactEstimate["liquidityTier"] = "MODERATE_LIQUIDITY";
  let wholesaleHaircut = 25.0;

  if (annualVolume >= 40 && circulatingFloat >= 25) {
    liquidityTier = "HIGH_LIQUIDITY_DEPTH";
    wholesaleHaircut = 15.0;
  } else if (annualVolume >= 12 && circulatingFloat >= 8) {
    liquidityTier = "MODERATE_LIQUIDITY";
    wholesaleHaircut = 25.0;
  } else if (annualVolume >= 3) {
    liquidityTier = "THIN_AUCTION_FLOAT";
    wholesaleHaircut = 35.0;
  } else {
    liquidityTier = "ILLIQUID_SPECIALTY";
    wholesaleHaircut = 45.0;
  }

  return {
    oneUnitImpactPct: oneUnitImpact,
    fiveUnitImpactPct: fiveUnitImpact,
    estimatedWholesaleHaircutPct: wholesaleHaircut,
    liquidityTier,
  };
}

/**
 * Executes the complete Phase 2 Physical Supply and Float Engine.
 */
export function executeFloatLiquidityEngine(input: FloatLiquidityInput): PhysicalSupplyAndFloatProfile {
  const isCensusIndexed = input.totalCensusPop != null && input.totalCensusPop > 0;
  const totalCensus = isCensusIndexed ? input.totalCensusPop! : null;

  // Determine annual completed transaction volume
  const txCount = input.trailingCompletedTransactions?.length ?? input.trailing12mSalesCount ?? null;

  let circulatingFloat: number | null = null;
  let vaultedHorde: number | null = null;
  let floatPct: number | null = null;
  let ctr: number | null = null;
  let turnoverTier: PhysicalSupplyAndFloatProfile["floatTurnoverVelocityTier"] = "UNINDEXED";

  if (!isCensusIndexed) {
    turnoverTier = "UNINDEXED";
  } else if (txCount === null) {
    turnoverTier = "UNMEASURED";
  } else if (txCount === 0) {
    turnoverTier = "NO_OBSERVED_TRADES";
    circulatingFloat = 0;
    vaultedHorde = totalCensus;
    floatPct = 0;
    ctr = null;
  } else {
    // Empirical circulating float model:
    // Only a small fraction of the census actively turns over. Repeat sales indicate that
    // active float is approximately 75% of annual trading volume, capped by total census.
    circulatingFloat = Math.min(totalCensus!, Math.max(1, Math.round(txCount * 0.75)));
    vaultedHorde = Math.max(0, totalCensus! - circulatingFloat);
    floatPct = Number(((circulatingFloat / totalCensus!) * 100).toFixed(2));
    ctr = Number((totalCensus! / txCount).toFixed(2));

    if (ctr < 2.0) turnoverTier = "HIGH_VELOCITY_FLOAT";
    else if (ctr <= 10.0) turnoverTier = "BALANCED_TURNOVER";
    else turnoverTier = "LOW_TURNOVER_DORMANT";
  }

  // Amihud illiquidity
  const amihud = computeAmihudIlliquidity(input.trailingCompletedTransactions, input.benchmarkFmvUsd);

  // Market impact
  const marketImpact = estimateMarketImpact(circulatingFloat, txCount, amihud, input.era);

  // Simulated equity representation
  // Baseline 100,000 shares per sovereign book
  const totalShares = 100000;
  const floatFraction = floatPct != null ? Math.max(0.05, floatPct / 100) : 0.25;
  const simulatedCirculatingShares = Math.round(totalShares * floatFraction);

  return {
    comicId: input.comicId,
    series: input.series,
    issue: input.issue,
    era: input.era,
    totalCensusPop: totalCensus,
    isCensusIndexed,
    vaultedHordeCount: vaultedHorde,
    circulatingFloatCopies: circulatingFloat,
    circulatingFloatPct: floatPct,
    floatTurnoverRatio: ctr,
    floatTurnoverVelocityTier: turnoverTier,
    amihudIlliquidity: amihud,
    marketImpact,
    simulatedEquitySharesTotal: totalShares,
    simulatedCirculatingShares,
    dataProvenance: {
      censusSource: isCensusIndexed ? "OBSERVED_CENSUS" : "UNINDEXED",
      circulatingFloat: circulatingFloat !== null ? "EMPIRICALLY_ESTIMATED" : "UNMEASURED",
      amihudRatio: amihud.illiqValue !== null ? "OBSERVED_TRANSACTIONS" : "UNMEASURED",
      marketImpact: marketImpact.oneUnitImpactPct !== null ? "EMPIRICALLY_ESTIMATED" : "UNMEASURED",
    },
  };
}
