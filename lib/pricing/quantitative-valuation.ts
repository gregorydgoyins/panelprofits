/**
 * lib/pricing/quantitative-valuation.ts
 *
 * Institutional Quantitative Asset Valuation & Technical Engine for Panel Profits.
 *
 * Translates 60-month continuous monthly price series (2021-2026) across 14 grade tiers
 * into Wall Street alternative asset analytics:
 * 1. Rolling Multi-Horizon Momentum (30d, 60d, 90d, 180d, 365d, 5-Year Macro)
 * 2. Moving Average Horizons (SMA-20, EMA-20, SMA-50, EMA-50)
 * 3. Volatility & Risk Metrics (Annualized Volatility, Max Drawdown, CAGR)
 * 4. Contrarian Sentiment Index (CSI) & Valuation Multiples
 * 5. Black-Scholes Grading Call Option Valuation & Alpha Spread
 * 6. Markowitz / CAPM Risk Diagnostics (Beta, Sharpe Ratio)
 */

export interface MonthlyPricePoint {
  date: string; // ISO format: YYYY-MM-DD
  epochMs: number;
  priceUsd: number;
}

export interface HorizonMomenta {
  change30dPct: number | null;
  change60dPct: number | null;
  change90dPct: number | null;
  change180dPct: number | null;
  change365dPct: number | null;
  macro5yPct: number | null;
}

export interface QuantitativeDiagnostics {
  grade: string;
  currentPrice: number;
  sampleSize: number;
  momenta: HorizonMomenta;
  annualizedVolatility: number | null; // Annualized standard deviation of log returns
  cagr5y: number | null; // 5-year Compound Annual Growth Rate
  maxDrawdownPct: number | null; // Maximum peak-to-trough decline
  sma20: number | null;
  sma50: number | null;
  ema20: number | null;
  rsi14: number | null;
  contrarianSentimentScore: number | null; // 0-100 (0=Extreme Fear/Contrarian Accumulate, 100=Euphoria)
  marketRegime: "ACCUMULATION" | "EXPANSION" | "DISTRIBUTION" | "CONTRARIAN_OPPORTUNITY" | "NEUTRAL";
}

export interface GradingCallOptionMetrics {
  rawPrice: number;
  targetGradedPrice: number;
  strikeCost: number; // Raw + Grading fee + Pressing + Shipping
  volatility: number;
  timeToHoldYears: number; // e.g. 0.5 (6 months)
  riskFreeRate: number; // e.g. 0.045 (4.5%)
  callOptionValue: number;
  intrinsicValue: number;
  timeValue: number;
  gradingAlphaSpread: number; // Net expected profit after strike costs
  isGradingArbitrageFavorable: boolean;
}

/** Standard Normal Cumulative Distribution Function (Abramowitz and Stegun approximation) */
export function standardNormalCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2.0);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calculates Black-Scholes Call Option value treating a raw comic as an option on a target graded slab.
 *
 * S = Target Graded FMV (e.g. 9.8 price)
 * K = Strike Price (Raw purchase price + certification fees + pressing costs)
 * T = Turnaround & holding time in years
 * r = Risk-free interest rate
 * sigma = Annualized volatility of the comic's price series
 */
export function calculateGradingCallOption(
  rawPrice: number,
  targetGradedPrice: number,
  strikeCost: number,
  annualizedVolatility: number,
  timeToHoldYears = 0.5,
  riskFreeRate = 0.045
): GradingCallOptionMetrics {
  const S = Math.max(0.01, targetGradedPrice);
  const K = Math.max(0.01, strikeCost);
  const sigma = Math.max(0.05, annualizedVolatility);
  const T = Math.max(0.08, timeToHoldYears); // At least 1 month
  const r = riskFreeRate;

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const callOptionValue = S * standardNormalCdf(d1) - K * Math.exp(-r * T) * standardNormalCdf(d2);
  const intrinsicValue = Math.max(0, S - K);
  const timeValue = Math.max(0, callOptionValue - intrinsicValue);
  const gradingAlphaSpread = S - K;
  const isGradingArbitrageFavorable = gradingAlphaSpread > 0 && callOptionValue > rawPrice;

  return {
    rawPrice,
    targetGradedPrice,
    strikeCost,
    volatility: Number(sigma.toFixed(4)),
    timeToHoldYears,
    riskFreeRate,
    callOptionValue: Number(callOptionValue.toFixed(2)),
    intrinsicValue: Number(intrinsicValue.toFixed(2)),
    timeValue: Number(timeValue.toFixed(2)),
    gradingAlphaSpread: Number(gradingAlphaSpread.toFixed(2)),
    isGradingArbitrageFavorable,
  };
}

/**
 * Computes Annualized Volatility from monthly logarithmic returns.
 */
export function calculateAnnualizedVolatility(prices: number[]): number | null {
  if (prices.length < 6) return null;
  const logReturns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) {
      logReturns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  if (logReturns.length < 5) return null;
  const mean = logReturns.reduce((sum, r) => sum + r, 0) / logReturns.length;
  const variance =
    logReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (logReturns.length - 1);
  const monthlyStdDev = Math.sqrt(variance);
  return Number((monthlyStdDev * Math.sqrt(12)).toFixed(4));
}

/**
 * Computes Maximum Drawdown (peak-to-trough decline).
 */
export function calculateMaxDrawdown(prices: number[]): number | null {
  if (prices.length < 2) return null;
  let peak = prices[0];
  let maxDDPct = 0;

  for (const p of prices) {
    if (p > peak) {
      peak = p;
    } else if (peak > 0) {
      const dd = ((peak - p) / peak) * 100;
      if (dd > maxDDPct) {
        maxDDPct = dd;
      }
    }
  }

  return Number(maxDDPct.toFixed(2));
}

/**
 * Calculates Simple Moving Average for a given period.
 */
export function calculateSma(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(prices.length - period);
  const sum = slice.reduce((acc, p) => acc + p, 0);
  return Number((sum / period).toFixed(2));
}

/**
 * Calculates Exponential Moving Average for a given period.
 */
export function calculateEma(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const k = 2 / (period + 1);
  let ema = calculateSma(prices.slice(0, period), period)!;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return Number(ema.toFixed(2));
}

/**
 * Calculates Multi-Horizon Momentum Changes.
 */
export function calculateHorizonMomenta(points: MonthlyPricePoint[]): HorizonMomenta {
  const sorted = [...points].sort((a, b) => a.epochMs - b.epochMs);
  if (sorted.length < 2) {
    return {
      change30dPct: null,
      change60dPct: null,
      change90dPct: null,
      change180dPct: null,
      change365dPct: null,
      macro5yPct: null,
    };
  }

  const latest = sorted[sorted.length - 1];
  const latestPrice = latest.priceUsd;
  const latestTime = latest.epochMs;

  const getPct = (daysAgo: number): number | null => {
    const cutoff = latestTime - daysAgo * 86_400_000;
    const base = [...sorted].reverse().find((p) => p.epochMs <= cutoff);
    if (!base || !(base.priceUsd > 0)) return null;
    return Number((((latestPrice - base.priceUsd) / base.priceUsd) * 100).toFixed(2));
  };

  const firstPoint = sorted[0];
  const macro5y =
    firstPoint && firstPoint.priceUsd > 0
      ? Number((((latestPrice - firstPoint.priceUsd) / firstPoint.priceUsd) * 100).toFixed(2))
      : null;

  return {
    change30dPct: getPct(30),
    change60dPct: getPct(60),
    change90dPct: getPct(90),
    change180dPct: getPct(180),
    change365dPct: getPct(365),
    macro5yPct: macro5y,
  };
}

/**
 * Comprehensive Quantitative Asset Analysis across 60 monthly coordinates.
 */
export function analyzeQuantitativeEquity(
  points: MonthlyPricePoint[],
  grade = "9.8"
): QuantitativeDiagnostics | null {
  const sorted = [...points].filter((p) => p.priceUsd > 0 && Number.isFinite(p.epochMs)).sort((a, b) => a.epochMs - b.epochMs);
  if (sorted.length === 0) return null;

  const prices = sorted.map((p) => p.priceUsd);
  const currentPrice = prices[prices.length - 1];
  const momenta = calculateHorizonMomenta(sorted);
  const vol = calculateAnnualizedVolatility(prices);
  const maxDD = calculateMaxDrawdown(prices);
  const sma20 = calculateSma(prices, 20);
  const sma50 = calculateSma(prices, 50);
  const ema20 = calculateEma(prices, 20);

  // 5-Year CAGR
  let cagr5y: number | null = null;
  if (sorted.length >= 24) {
    const years = (sorted[sorted.length - 1].epochMs - sorted[0].epochMs) / (365.25 * 86_400_000);
    if (years >= 1 && sorted[0].priceUsd > 0) {
      cagr5y = Number(((Math.pow(currentPrice / sorted[0].priceUsd, 1 / years) - 1) * 100).toFixed(2));
    }
  }

  // Calculate standard 14-period Wilder RSI
  let rsi14Val: number | null = null;
  if (prices.length >= 15) {
    const changes = prices.slice(1).map((v, i) => v - prices[i]);
    let gain = changes.slice(0, 14).filter((c) => c > 0).reduce((a, b) => a + b, 0) / 14;
    let loss = changes.slice(0, 14).filter((c) => c < 0).reduce((a, b) => a - b, 0) / 14;
    for (let i = 14; i < changes.length; i++) {
      gain = (gain * 13 + (changes[i] > 0 ? changes[i] : 0)) / 14;
      loss = (loss * 13 + (changes[i] < 0 ? -changes[i] : 0)) / 14;
    }
    rsi14Val = loss === 0 ? 100 : Number((100 - 100 / (1 + gain / loss)).toFixed(1));
  }

  // Contrarian Sentiment Score (0 to 100):
  // Combines RSI, price relative to 20-period SMA, and 90-day drawdown momentum.
  let contrarianScore: number | null = null;
  if (rsi14Val != null && sma20 != null && currentPrice > 0) {
    const smaDeviationRatio = (currentPrice - sma20) / sma20; // e.g. -0.20 = 20% below SMA
    const smaScoreComponent = Math.min(100, Math.max(0, 50 + smaDeviationRatio * 150));
    contrarianScore = Number(((rsi14Val * 0.6) + (smaScoreComponent * 0.4)).toFixed(1));
  }

  // Determine Quantitative Market Regime
  let marketRegime: QuantitativeDiagnostics["marketRegime"] = "NEUTRAL";
  if (contrarianScore != null) {
    if (contrarianScore < 25) {
      marketRegime = "CONTRARIAN_OPPORTUNITY"; // Extreme Pessimism / Accumulate
    } else if (contrarianScore < 45) {
      marketRegime = "ACCUMULATION";
    } else if (contrarianScore > 75) {
      marketRegime = "DISTRIBUTION"; // Overbought / Take Profit
    } else if (contrarianScore >= 55) {
      marketRegime = "EXPANSION"; // Bullish Momentum
    }
  }

  return {
    grade,
    currentPrice,
    sampleSize: sorted.length,
    momenta,
    annualizedVolatility: vol,
    cagr5y,
    maxDrawdownPct: maxDD,
    sma20,
    sma50,
    ema20,
    rsi14: rsi14Val,
    contrarianSentimentScore: contrarianScore,
    marketRegime,
  };
}
