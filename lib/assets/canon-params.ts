/**
 * Panel Profits canon parameters — transcribed from
 * lib/assets/canon/PP_Parameter_Spec_v1.0.0_LOCKED.json (spec 1.0.0, effective 2026-01-21).
 * tests/canon-formulas.test.ts asserts these match the JSON, so the two cannot drift.
 *
 * GAME_DESIGN below holds the parameters the locked spec does NOT fix (carry, storage,
 * volatility floors, provenance/liquidity haircuts). They are in-universe design values,
 * labelled as such, and live in one place so they can be tuned without touching formulas.
 */

export type LiquidityState = "OPEN" | "THIN" | "STRESSED" | "LOCKED";
export type EraKey =
  | "GOLDEN"
  | "SILVER"
  | "EARLY_BRONZE"
  | "LATE_BRONZE_COPPER"
  | "MODERN_MAINSTREAM_KEY"
  | "INDEPENDENT_ELIGIBLE";
export type PublisherCapTier = "MAJOR_X10" | "UPPER_INDIE_X6" | "MID_X4" | "MICRO_X3";
export type FundType = "INDEX" | "ACTIVE" | "HEDGED" | "THEMATIC";

export const ANNUALIZATION_A = 252;
export const ROUND_LOT = 100;
export const OPTION_CONTRACT_SIZE_Q = 100;

/** Treasury curve y_rf(T): step function by tenor in years. */
export function treasuryYield(tYears: number): number {
  if (tYears <= 1) return 0.035;
  const y = Math.ceil(tYears);
  if (y <= 2) return 0.038;
  if (y <= 5) return 0.04;
  if (y <= 10) return 0.042;
  return 0.044;
}

export const CREDIT_SPREAD_INSTITUTIONAL: Record<EraKey, number> = {
  GOLDEN: 0.0025,
  SILVER: 0.004,
  EARLY_BRONZE: 0.006,
  LATE_BRONZE_COPPER: 0.0075,
  MODERN_MAINSTREAM_KEY: 0.01,
  INDEPENDENT_ELIGIBLE: 0.0125,
};
export const CREDIT_SPREAD_PUBLISHER: Record<PublisherCapTier, number> = {
  MAJOR_X10: 0.003,
  UPPER_INDIE_X6: 0.0055,
  MID_X4: 0.0075,
  MICRO_X3: 0.01,
};
export const RECOVERY_INST_ISSUE: Record<EraKey, number> = {
  GOLDEN: 0.75,
  SILVER: 0.72,
  EARLY_BRONZE: 0.68,
  LATE_BRONZE_COPPER: 0.65,
  MODERN_MAINSTREAM_KEY: 0.6,
  INDEPENDENT_ELIGIBLE: 0.55,
};

export const BOND = {
  issuanceCapFraction: 0.4,
  aveVolatilityMax: 0.15,
  wavConfidenceMin: 0.7,
  censusConfidenceMin: 0.6,
  couponFrequency: "ANNUAL" as const,
};

/** s_liq = L_trades + L_float + L_duration, in decimal (bps / 10,000). */
export function bondLiquiditySpread(trades30d: number, floatUtilization: number, yearsRemaining: number): number {
  const lTrades = trades30d >= 20 ? 0 : trades30d >= 10 ? 50 : trades30d >= 5 ? 100 : 200;
  const lFloat = floatUtilization <= 0.5 ? 0 : floatUtilization <= 0.75 ? 50 : 100;
  const lDur = yearsRemaining >= 7 ? 50 : yearsRemaining >= 3 ? 0 : -25;
  return (lTrades + lFloat + lDur) / 10000;
}

export const OPTION = {
  sigmaEffPhi: { OPEN: 1.0, THIN: 1.15, STRESSED: 1.35, LOCKED: 1.0 } as Record<LiquidityState, number>,
  windowDays: 30,
  gates: {
    disallowStates: ["LOCKED"] as LiquidityState[],
    wavConfidenceMin: 0.7,
    censusConfidenceMin: 0.6,
    aveVolatilityMax: 0.45,
    lastTradeDaysMax: 365,
  },
  seniorPartnerNotionalCap: 500_000,
};

export const FUND = {
  expenseRatioMin: 0.0,
  expenseRatioMax: 0.05,
  /** Draft-doc ER by fund type (spec only bounds ER to [0, 0.05]). */
  expenseRatioByType: { INDEX: 0.0025, ACTIVE: 0.004, HEDGED: 0.0035, THEMATIC: 0.003 } as Record<FundType, number>,
  haircut: { OPEN: 0.95, THIN: 0.7, STRESSED: 0.5, LOCKED: 0.0 } as Record<LiquidityState, number>,
  stressCorrelationPsi: { OPEN: 1.0, THIN: 1.1, STRESSED: 1.25, LOCKED: 1.4 } as Record<LiquidityState, number>,
};

/** Equity spread model constants (spec equity.spread_model). */
export const SPREAD = { min: 0.005, max: 0.5, base: 0.005 };

/**
 * In-universe design parameters the locked spec leaves open.
 * Everything here is a game-design choice, not a market observation.
 */
export const GAME_DESIGN = {
  /** Volatility floor by scarcity tier — a book with a flat ComicBase history is not risk-free. */
  sigmaFloorByTier: { common: 0.08, uncommon: 0.1, rare: 0.14, epic: 0.17, legendary: 0.2, mythic: 0.28 } as Record<string, number>,
  /** Storage / slabbing / insurance cost u (annual, fraction of price) by era. */
  storageCostByEra: {
    GOLDEN: 0.012, SILVER: 0.01, EARLY_BRONZE: 0.008, LATE_BRONZE_COPPER: 0.006,
    MODERN_MAINSTREAM_KEY: 0.005, INDEPENDENT_ELIGIBLE: 0.005,
  } as Record<EraKey, number>,
  /** Convenience yield y (annual): the premium for holding the physical book now — rarer books pay more. */
  convenienceYieldByTier: { common: 0.0, uncommon: 0.005, rare: 0.012, epic: 0.018, legendary: 0.025, mythic: 0.04 } as Record<string, number>,
  /** Liquidity state by scarcity tier (fewer copies → thinner market). LOCKED is reserved for explicitly vaulted/frozen markets, not rarity. */
  stateByTier: { common: "OPEN", uncommon: "OPEN", rare: "THIN", epic: "THIN", legendary: "STRESSED", mythic: "STRESSED" } as Record<string, LiquidityState>,
  /** Trades per 30 days implied by each state, used for bond liquidity bands. */
  trades30dByState: { OPEN: 25, THIN: 12, STRESSED: 6, LOCKED: 2 } as Record<LiquidityState, number>,
  /** Float utilisation implied by each state. */
  floatUtilizationByState: { OPEN: 0.4, THIN: 0.6, STRESSED: 0.8, LOCKED: 0.95 } as Record<LiquidityState, number>,
  /** I.1.28 tokenization: P_NFT = P × λ_provenance × λ_liquidity. */
  lambdaProvenance: 1.0,
  lambdaLiquidityByState: { OPEN: 0.92, THIN: 0.85, STRESSED: 0.75, LOCKED: 0.6 } as Record<LiquidityState, number>,
  /** Option chain shape: strikes as moneyness K/S, expiries in trading days. */
  chainMoneyness: [0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2],
  chainExpiryDays: [30, 60, 90],
  /** Volatility skew: σ(m,T) = σ·[1 + skewSlope·ln m + smileCurve·(ln m)² + termSlope·ln(T/T0)] — downside strikes richer. */
  skewSlope: -0.35,
  smileCurve: 1.2,
  termSlope: 0.06,
  /** Open interest: contracts at the money for an OPEN market; scaled by state, moneyness kernel and expiry decay. */
  openInterestBase: 1500,
  openInterestStateFactor: { OPEN: 1, THIN: 0.5, STRESSED: 0.2, LOCKED: 0 } as Record<LiquidityState, number>,
  openInterestKernelWidth: 0.1,
  /** Futures term structure expiries in years. */
  futuresExpiryYears: [0.25, 0.5, 1],
  /** Index / fund inception base. */
  indexBase: 100,
  fundInitialNav: 1_000_000,
  fundInitialSharePrice: 100,
};
