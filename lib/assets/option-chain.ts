/**
 * Option chains: strikes × expiries priced with Black–Scholes at a skewed, term-structured σ_eff,
 * with Greeks, implied-vol skew, open interest and put/call ratio. Pure — all inputs come from the underlying.
 */
import { GAME_DESIGN, OPTION, OPTION_CONTRACT_SIZE_Q, treasuryYield } from "./canon-params";
import { blackScholes, effectiveVolatility } from "./canon-formulas";
import type { Underlying } from "./underlyings";

export interface ChainLeg {
  type: "CALL" | "PUT";
  expiryDays: number;
  T: number;
  moneyness: number;
  strike: number;
  iv: number;
  premium: number; // per share
  contractPremium: number; // per contract (× Q)
  delta: number;
  gamma: number;
  vega: number;
  thetaPerDay: number;
  rho: number;
  openInterest: number;
}

export interface OptionChain {
  underlyingId: string;
  S: number;
  atmIv30: number;
  legs: ChainLeg[];
  openInterestCalls: number;
  openInterestPuts: number;
  putCallRatio: number | null;
}

export function skewedSigma(sigmaEff: number, moneyness: number, expiryDays: number): number {
  const lm = Math.log(moneyness);
  const t0 = GAME_DESIGN.chainExpiryDays[0];
  const factor =
    1 + GAME_DESIGN.skewSlope * lm + GAME_DESIGN.smileCurve * lm * lm + GAME_DESIGN.termSlope * Math.log(expiryDays / t0);
  return sigmaEff * Math.max(0.5, factor);
}

export function openInterest(u: Pick<Underlying, "state">, moneyness: number, expiryDays: number): number {
  const w = GAME_DESIGN.openInterestKernelWidth;
  const lm = Math.log(moneyness);
  const kernel = Math.exp(-(lm * lm) / (2 * w * w));
  const decay = GAME_DESIGN.chainExpiryDays[0] / expiryDays;
  return Math.round(GAME_DESIGN.openInterestBase * GAME_DESIGN.openInterestStateFactor[u.state] * kernel * (0.5 + 0.5 * decay));
}

export function buildChain(u: Underlying): OptionChain | null {
  if (OPTION.gates.disallowStates.includes(u.state) || u.sigma > OPTION.gates.aveVolatilityMax) return null;
  const sigmaEff = effectiveVolatility(u.sigma, u.state);
  const legs: ChainLeg[] = [];
  let oiC = 0;
  let oiP = 0;
  let atm30 = sigmaEff;
  for (const days of GAME_DESIGN.chainExpiryDays) {
    const T = days / 252;
    const r = treasuryYield(T);
    for (const m of GAME_DESIGN.chainMoneyness) {
      const K = Math.max(1, Math.round(u.price * m));
      const iv = skewedSigma(sigmaEff, K / u.price, days);
      const bs = blackScholes(u.price, K, T, r, iv);
      if (!bs) continue;
      if (days === GAME_DESIGN.chainExpiryDays[0] && m === 1) atm30 = iv;
      const oi = openInterest(u, K / u.price, days);
      const mk = (type: "CALL" | "PUT"): ChainLeg => {
        const call = type === "CALL";
        const prem = call ? bs.call : bs.put;
        return {
          type, expiryDays: days, T, moneyness: K / u.price, strike: K, iv,
          premium: prem, contractPremium: prem * OPTION_CONTRACT_SIZE_Q,
          delta: call ? bs.callDelta : bs.putDelta, gamma: bs.gamma, vega: bs.vega / 100,
          thetaPerDay: (call ? bs.callTheta : bs.putTheta) / 365, rho: (call ? bs.callRho : bs.putRho) / 100,
          // calls carry more interest above spot, puts below
          openInterest: Math.round(oi * (call ? (K >= u.price ? 1 : 0.6) : K <= u.price ? 1 : 0.6)),
        };
      };
      const c = mk("CALL");
      const p = mk("PUT");
      oiC += c.openInterest;
      oiP += p.openInterest;
      legs.push(c, p);
    }
  }
  if (legs.length === 0) return null;
  return { underlyingId: u.id, S: u.price, atmIv30: atm30, legs, openInterestCalls: oiC, openInterestPuts: oiP, putCallRatio: oiC > 0 ? oiP / oiC : null };
}
