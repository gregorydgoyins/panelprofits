/**
 * Panel Profits canon pricing formulas — pure, deterministic, no I/O.
 * Sources: Panel_Profits_Equity_Math_Canon, I.1.9 Bonds, I.1.10 Bonds Subdivided, I.1.11 Derivatives,
 * I.1.12 Funds, I.1.14 Options, I.1.18 Indices, I.1.28 Tokenization, Developmental Blueprints.
 * Parameters come from canon-params.ts (PP_Parameter_Spec_v1.0.0_LOCKED).
 */
import {
  ANNUALIZATION_A,
  FUND,
  GAME_DESIGN,
  OPTION,
  SPREAD,
  bondLiquiditySpread,
  treasuryYield,
  type LiquidityState,
} from "./canon-params";

// ─── numerics ────────────────────────────────────────────────────────────────

/** Standard normal CDF (Abramowitz & Stegun 26.2.17, |err| < 7.5e-8). */
export function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}

export function logReturns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const a = prices[i - 1];
    const b = prices[i];
    if (a > 0 && b > 0) out.push(Math.log(b / a));
  }
  return out;
}

/** Sample variance (n − 1). Needs at least two observations. */
export function sampleVariance(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
}

/**
 * σ_real = √Var(log returns) · √A, with A the number of return periods per year
 * (252 for daily series, 1 for annual series such as ComicBase yearly values).
 */
export function realizedVolatility(prices: number[], periodsPerYear: number = ANNUALIZATION_A): number | null {
  const v = sampleVariance(logReturns(prices));
  return v == null ? null : Math.sqrt(v) * Math.sqrt(periodsPerYear);
}

/**
 * Realised volatility on an irregularly dated series (PriceCharting nightly snapshots, eBay/graded sale prints):
 * A = periods per year = 365 days / mean gap in days. Needs at least three points (two returns).
 */
export function realizedVolatilityDated(points: { t: number; v: number }[]): number | null {
  const pts = points.filter((p) => p.v > 0 && Number.isFinite(p.t)).sort((a, b) => a.t - b.t);
  if (pts.length < 3) return null;
  const spanDays = (pts[pts.length - 1].t - pts[0].t) / 86_400_000;
  if (spanDays <= 0) return null;
  const A = 365 / (spanDays / (pts.length - 1));
  return realizedVolatility(pts.map((p) => p.v), A);
}

/**
 * Several independent price sources each give their own σ (ComicBase yearly, PriceCharting nightly, sale prints).
 * Prices are never blended; the conservative (largest) available σ is used, floored by the tier prior.
 */
export function combineSourceVolatilities(sigmas: (number | null | undefined)[], floor: number): { sigma: number; fromHistory: boolean } {
  const live = sigmas.filter((s): s is number => typeof s === "number" && Number.isFinite(s) && s > 0);
  const hist = live.length ? Math.max(...live) : 0;
  return { sigma: Math.max(hist, floor), fromHistory: hist >= floor && hist > 0 };
}

/**
 * News shock. Narrative entropy (Developmental Blueprints): Λ_eff = Λ_base · (1 + ln(1 + V_window)).
 * V_window = mentions in the last 48h in excess of twice the per-day baseline. Factor is capped at 2.5.
 */
export function newsShockMultiplier(last48h: number, baselinePerDay: number): number {
  const excess = Math.max(0, last48h - 2 * baselinePerDay);
  return Math.min(2.5, 1 + Math.log(1 + excess));
}

/** σ_eff = σ_real · φ(L). */
export function effectiveVolatility(sigmaReal: number, state: LiquidityState): number {
  return sigmaReal * OPTION.sigmaEffPhi[state];
}

// ─── options (I.1.14) ───────────────────────────────────────────────────────

export interface BlackScholesResult {
  call: number;
  put: number;
  d1: number;
  d2: number;
  callDelta: number;
  putDelta: number;
  gamma: number;
  /** vega per 1.00 of σ (divide by 100 for per-vol-point) */
  vega: number;
  /** theta per year (divide by 365 for per-day) */
  callTheta: number;
  putTheta: number;
  callRho: number;
  putRho: number;
}

export function blackScholes(S: number, K: number, T: number, r: number, sigma: number): BlackScholesResult | null {
  if (!(S > 0 && K > 0 && T > 0 && sigma > 0) || !Number.isFinite(r)) return null;
  const sq = sigma * Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / sq;
  const d2 = d1 - sq;
  const disc = Math.exp(-r * T);
  const pdf = 0.3989422804014327 * Math.exp((-d1 * d1) / 2);
  const call = S * normCdf(d1) - K * disc * normCdf(d2);
  const put = K * disc * normCdf(-d2) - S * normCdf(-d1);
  return {
    call,
    put,
    d1,
    d2,
    callDelta: normCdf(d1),
    putDelta: normCdf(d1) - 1,
    gamma: pdf / (S * sq),
    vega: S * pdf * Math.sqrt(T),
    callTheta: (-S * pdf * sigma) / (2 * Math.sqrt(T)) - r * K * disc * normCdf(d2),
    putTheta: (-S * pdf * sigma) / (2 * Math.sqrt(T)) + r * K * disc * normCdf(-d2),
    callRho: K * T * disc * normCdf(d2),
    putRho: -K * T * disc * normCdf(-d2),
  };
}

// ─── bonds (I.1.9 / I.1.10) ─────────────────────────────────────────────────

/** y_req = y_rf(T_remaining) + s_credit + s_liq. */
export function requiredYield(yearsRemaining: number, sCredit: number, sLiq: number): number {
  return treasuryYield(yearsRemaining) + sCredit + sLiq;
}

/** Price = Σ_{k=1..T} cP/(1+y)^k + P/(1+y)^T, annual coupons, integer T. */
export function bondPrice(principal: number, couponRate: number, y: number, yearsRemaining: number): number {
  let pv = 0;
  for (let k = 1; k <= yearsRemaining; k++) pv += (couponRate * principal) / (1 + y) ** k;
  return pv + principal / (1 + y) ** yearsRemaining;
}

export function bondLiquiditySpreadFor(state: LiquidityState, yearsRemaining: number): number {
  return bondLiquiditySpread(
    GAME_DESIGN.trades30dByState[state],
    GAME_DESIGN.floatUtilizationByState[state],
    yearsRemaining,
  );
}

// ─── futures (I.1.11) ───────────────────────────────────────────────────────

/** F0 = S0 · e^{(r + u − y)T}. */
export function futuresPrice(S0: number, r: number, u: number, y: number, T: number): number {
  return S0 * Math.exp((r + u - y) * T);
}

// ─── indices and funds (I.1.12 / I.1.18) ────────────────────────────────────

export interface Constituent {
  /** current price p_i(t) */
  price: number;
  /** base price p_i(0) */
  basePrice: number;
  /** weight w_i (sums to 1) */
  weight: number;
}

/** I(t) = I(0) · Σ w_i · p_i(t)/p_i(0). */
export function indexLevel(i0: number, cs: Constituent[]): number {
  return i0 * cs.reduce((s, c) => s + c.weight * (c.price / c.basePrice), 0);
}

/** NAV(t) = Σ q_i p_i − Fees − Liabilities. */
export function fundNav(holdings: { q: number; p: number }[], fees: number, liabilities = 0): number {
  return holdings.reduce((s, h) => s + h.q * h.p, 0) - fees - liabilities;
}

/** Fees accrued linearly: Fees(t+dt) = Fees(t) + NAV · ER · dt (dt in years). */
export function accruedFees(nav0: number, expenseRatio: number, years: number): number {
  return nav0 * expenseRatio * years;
}

/** Index-like fund seeded at base prices: q_i = w_i · NAV0 / p_i(0). Returns FSP = NAV / shares. */
export function indexFundSharePrice(
  cs: Constituent[],
  nav0: number,
  shares: number,
  expenseRatio: number,
  years: number,
): { nav: number; fsp: number; fees: number } {
  const holdings = cs.map((c) => ({ q: (c.weight * nav0) / c.basePrice, p: c.price }));
  const fees = accruedFees(nav0, expenseRatio, years);
  const nav = fundNav(holdings, fees);
  return { nav, fsp: nav / shares, fees };
}

/** Redemption gating: g = LC / V_R when V_R > LC. */
export function redemptionGate(requested: number, liquidationCapacity: number): { paid: number; deferred: number; g: number } {
  if (requested <= liquidationCapacity) return { paid: requested, deferred: 0, g: 1 };
  const g = liquidationCapacity / requested;
  return { paid: g * requested, deferred: (1 - g) * requested, g };
}

export function liquidationCapacity(holdingValueAtBid: number, state: LiquidityState): number {
  return holdingValueAtBid * FUND.haircut[state];
}

// ─── tokenization (I.1.28) ──────────────────────────────────────────────────

/** P_NFT = P_underlying · λ_provenance · λ_liquidity. */
export function nftPrice(underlying: number, state: LiquidityState): number {
  return underlying * GAME_DESIGN.lambdaProvenance * GAME_DESIGN.lambdaLiquidityByState[state];
}

// ─── equity bid/ask spread (spec equity.spread_model) ───────────────────────

export function equitySpread(trades30d: number, daysSinceTrade: number, aveVolatility: number, asymmetry = 0): number {
  const sTrades = trades30d >= 50 ? 0.005 : trades30d >= 20 ? 0.01 : trades30d >= 10 ? 0.02 : trades30d >= 5 ? 0.04 : 0.08;
  const sDays =
    daysSinceTrade <= 7 ? 0 : daysSinceTrade <= 30 ? 0.01 : daysSinceTrade <= 180 ? 0.03 : daysSinceTrade <= 365 ? 0.06 : 0.12;
  const sVol = Math.min(0.4, Math.max(0, 0.8 * aveVolatility));
  const sAsym = Math.min(0.1, Math.max(0, 0.1 * asymmetry));
  return Math.min(SPREAD.max, Math.max(SPREAD.min, SPREAD.base + sTrades + sDays + sVol + sAsym));
}

// ─── private capital (design formula, Greg: wealth of heroes and villains) ──

/**
 * Private-capital unit value for a benefactor vehicle.
 *   NAV_unit = [ W · (1 − k) · (1 − d_illiq) + Σ q_i · S_i · (1 − d_illiq) ] / U
 * W = lore net worth (USD), k = fraction of wealth tied up in operating assets and excluded from the vehicle,
 * d_illiq = private-market illiquidity discount, q_i · S_i = the benefactor's collection marked at real equity prices,
 * U = units outstanding. Collection exposure therefore moves with the comic market.
 */
export function privateCapitalUnitValue(args: {
  netWorth: number;
  operatingFraction: number;
  illiquidityDiscount: number;
  holdings: { q: number; price: number }[];
  units: number;
}): number {
  const { netWorth, operatingFraction, illiquidityDiscount, holdings, units } = args;
  const liquid = netWorth * (1 - operatingFraction);
  const collection = holdings.reduce((s, h) => s + h.q * h.price, 0);
  return ((liquid + collection) * (1 - illiquidityDiscount)) / units;
}

// ─── commodities from comic lore (design formula) ───────────────────────────

/** P = P0 · (D/S)^ε — lore unit price scaled by demand/supply pressure with elasticity ε. */
export function commodityPrice(p0: number, demand: number, supply: number, elasticity: number): number {
  return p0 * (demand / supply) ** elasticity;
}
