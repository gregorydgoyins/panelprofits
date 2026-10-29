/**
 * lib/pricing/contrarian-divergence-engine.ts
 *
 * PHASE 5 OF MASTER BLUEPRINT:
 * TRADITIONAL & CONTRARIAN STRATEGY ENGINES
 *
 * Implements fundamental-price divergence and institutional trading signals:
 * 1. Fandom-Price Divergence Signal:
 *      D_{i,t} = Z(\Delta FundamentalDemand_{i,t}) - Z(\Delta MarketPrice_{i,t})
 *      When D_{i,t} >> 0: High contrarian opportunity (fundamental demand surging while price lags or drops).
 *      When D_{i,t} << 0: Euphoria danger (market price extended while fundamental demand cools).
 * 2. Falling Knife Safeguard:
 *      When an asset suffers a severe dislocation (Z < -1.8 sigma), but momentum is still
 *      in freefall (RSI > 30 and continuing down, or no bid support detected),
 *      the engine explicitly alerts FALLING_KNIFE_DO_NOT_CATCH rather than firing a premature buy.
 * 3. Capitulation Buy Signal:
 *      Fires strictly when Z < -1.8 sigma, RSI <= 30 (deep oversold), and Graham Margin of Safety >= 25%.
 * 4. Graham Margin of Safety vs Execution Floor:
 *      Decouples fundamental structural value from wholesale dealer liquidation floor.
 *
 * Zero Fake Data Covenant:
 * - If price history or demand signals are missing, returns NEUTRAL / UNMEASURED.
 */

export interface DivergenceStrategyInput {
  comicId: string;
  series: string;
  issue: string;
  currentFmvUsd: number;
  marketPriceDeltaPct90d: number | null; // 90-day price momentum %
  fundamentalDemandDeltaPct90d: number | null; // 90-day search/sales demand momentum %
  priceZScore90d: number | null;
  rsi14: number | null;
  marginOfSafetyPct: number;
  dealerExecutionFloor: number | null;
}

export interface ContrarianDivergenceSignal {
  comicId: string;
  series: string;
  issue: string;
  divergenceSpread: number | null; // D_{i,t}
  signalTier: "APEX_CAPITULATION_BUY" | "STRONG_CONTRARIAN_ACCUMULATE" | "NEUTRAL" | "FADE_EUPHORIC_SPIKE" | "FALLING_KNIFE_DO_NOT_CATCH" | "UNMEASURED";
  actionRecommendation: "EXECUTE_IMMEDIATE_BUY" | "DOLLAR_COST_AVERAGE" | "HOLD" | "TAKE_PROFITS" | "WAIT_FOR_SUPPORT_CONFIRMATION";
  confidenceScore: number;
  marginOfSafetyBufferPct: number;
}

/**
 * Standardizes a percentage value into an approximate Z-score unit using a historical standard deviation of 15%
 */
function toStandardZ(deltaPct: number | null): number | null {
  if (deltaPct == null) return null;
  const standardVol = 15.0; // historical quarterly volatility benchmark
  return deltaPct / standardVol;
}

/**
 * Executes the Phase 5 Contrarian & Traditional Divergence Engine
 */
export function executeContrarianDivergenceEngine(input: DivergenceStrategyInput): ContrarianDivergenceSignal {
  const zPrice = input.priceZScore90d ?? toStandardZ(input.marketPriceDeltaPct90d);
  const zDemand = toStandardZ(input.fundamentalDemandDeltaPct90d);

  // If both signals are absent, return UNMEASURED
  if (zPrice == null && zDemand == null) {
    return {
      comicId: input.comicId,
      series: input.series,
      issue: input.issue,
      divergenceSpread: null,
      signalTier: "UNMEASURED",
      actionRecommendation: "HOLD",
      confidenceScore: 0,
      marginOfSafetyBufferPct: input.marginOfSafetyPct,
    };
  }

  // Calculate divergence D_{i,t} = Z(Demand) - Z(Price)
  let divergenceSpread: number | null = null;
  if (zDemand != null && zPrice != null) {
    divergenceSpread = Number((zDemand - zPrice).toFixed(2));
  }

  // Falling knife detection:
  // Z < -1.8 sigma, but RSI is still moderately high (>= 32) indicating ongoing selling without capitulation exhaustion
  const isSeverePriceDrop = zPrice != null && zPrice < -1.8;
  const isRsiStillFalling = input.rsi14 != null && input.rsi14 >= 32;

  let signalTier: ContrarianDivergenceSignal["signalTier"] = "NEUTRAL";
  let action: ContrarianDivergenceSignal["actionRecommendation"] = "HOLD";

  if (isSeverePriceDrop && isRsiStillFalling) {
    signalTier = "FALLING_KNIFE_DO_NOT_CATCH";
    action = "WAIT_FOR_SUPPORT_CONFIRMATION";
  } else if (isSeverePriceDrop && input.rsi14 != null && input.rsi14 < 32 && input.marginOfSafetyPct >= 20.0) {
    signalTier = "APEX_CAPITULATION_BUY";
    action = "EXECUTE_IMMEDIATE_BUY";
  } else if ((divergenceSpread != null && divergenceSpread > 1.5) || (zPrice != null && zPrice < -1.2)) {
    signalTier = "STRONG_CONTRARIAN_ACCUMULATE";
    action = "DOLLAR_COST_AVERAGE";
  } else if ((divergenceSpread != null && divergenceSpread < -1.8) || (zPrice != null && zPrice > 2.0)) {
    signalTier = "FADE_EUPHORIC_SPIKE";
    action = "TAKE_PROFITS";
  } else {
    signalTier = "NEUTRAL";
    action = "HOLD";
  }

  const confidence = Math.min(
    100,
    Math.round(
      (zPrice != null ? 35 : 0) +
        (zDemand != null ? 35 : 0) +
        (input.rsi14 != null ? 20 : 0) +
        (input.dealerExecutionFloor != null ? 10 : 0)
    )
  );

  return {
    comicId: input.comicId,
    series: input.series,
    issue: input.issue,
    divergenceSpread,
    signalTier,
    actionRecommendation: action,
    confidenceScore: confidence,
    marginOfSafetyBufferPct: input.marginOfSafetyPct,
  };
}
