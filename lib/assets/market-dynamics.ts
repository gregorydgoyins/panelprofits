/**
 * Market texture: what keeps a simulated market from being a lookup table.
 *
 * - VALUE is not MARKET PRICE. Market price wanders around value as a mean-reverting process with fat-tailed,
 *   volatility-clustered shocks, so every instrument moves a little every day even with no news.
 * - Transmission is uncertain. The same headline hits two linked entities by different amounts, sometimes the
 *   other way (a threat that "fizzles" is a relief rally; hyped news gets sold).
 * - Effects have shape in time: overshoot then reversal for scares, a slow build for real damage, run-up and fade for hype.
 * - Stress begets more sensitivity (regimes).
 *
 * Everything is a pure function of (key, time), seeded by hash, so every client sees the same market and tests are exact.
 * Nothing here is random in the Math.random sense.
 */

export function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normal(r: () => number): number {
  const u = Math.max(r(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

/** Student-t with 4 degrees of freedom, scaled to unit variance: fat tails. */
export function studentT4(r: () => number): number {
  const z = normal(r);
  let chi = 0;
  for (let i = 0; i < 4; i++) chi += normal(r) ** 2;
  return z / Math.sqrt(chi / 4) / Math.SQRT2;
}

const DAY = 86_400_000;

/**
 * Market-price factor around value: exp(x), x an Ornstein–Uhlenbeck path with daily fat-tailed shocks whose size
 * clusters (today's scale rises after a big move). Intraday jitter is seeded per 15-minute bucket.
 */
export function marketFactor(key: string, now: number, sigmaAnnual: number, opts: { phi?: number; days?: number; cluster?: number } = {}): number {
  const phi = opts.phi ?? 0.9;
  const days = opts.days ?? 60;
  const cluster = opts.cluster ?? 0.35;
  const day0 = Math.floor(now / DAY);
  const sd = sigmaAnnual / Math.sqrt(252);
  let x = 0;
  let scale = 1;
  for (let d = day0 - days; d <= day0; d++) {
    const r = rng(hash32(`${key}|d|${d}`));
    const z = studentT4(r);
    x = phi * x + sd * scale * z;
    scale = 1 + cluster * Math.min(3, Math.abs(z)) - cluster * 0.8; // clusters: big |z| today → bigger shocks tomorrow
    scale = Math.max(0.6, Math.min(2, scale));
  }
  const bucket = Math.floor(now / (15 * 60_000));
  const intraday = (sd / Math.sqrt(26)) * normal(rng(hash32(`${key}|i|${bucket}`)));
  return Math.exp(x + intraday);
}

/**
 * How strongly one event reaches one node, and in which direction. Same headline, different nodes, different answers.
 * Sometimes bad news does nothing: it was priced in, or the market has seen it before (`prior` = similar recent events
 * at the same entities breeds fatigue). Sometimes it is just bad news and lands in full.
 */
export function transmissionDraw(eventId: string, nodeId: string, kind: string, prior = 0): number {
  const r = rng(hash32(`${eventId}|${nodeId}`));
  const lognormal = Math.min(1.8, Math.max(0.4, Math.exp(0.35 * normal(r))));
  const u = r();
  const fatigue = 1 / (1 + 0.35 * prior);
  const pIgnore = 0.22 + 0.4 * (1 - fatigue);
  if (r() < pIgnore) return 0.04 * lognormal; // doesn't move the needle
  if (kind === "SCARE" && u < 0.25) return -0.6 * lognormal; // fizzles: relief
  if (kind === "HYPE" && u < 0.2) return -0.5 * lognormal; // sold on the news
  return lognormal * (0.5 + 0.5 * fatigue); // familiar events land softer
}

/** Shape of an event's effect in time (age in days). Not a simple decay. */
export function timeKernel(kind: string, ageDays: number): number {
  const t = Math.max(0, ageDays);
  switch (kind) {
    case "SCARE": // immediate overshoot, then a small reversal as it fades
      return 1.4 * Math.exp(-t / 1.5) - 0.4 * Math.exp(-t / 6);
    case "DAMAGE": { // some at once, the rest builds as audits and claims land, then slow recovery
      const ramp = (t / 3) * Math.exp(1 - t / 3);
      return (0.45 + 0.55 * ramp) * Math.exp(-t / 20);
    }
    case "HYPE": { // run-up into and just after, then fades faster than it rose
      const ramp = (t / 2) * Math.exp(1 - t / 2);
      return (0.3 + 0.7 * ramp) * Math.exp(-t / 5);
    }
    case "MARKET":
      return Math.exp(-t / 7 * Math.LN2 * 1);
    default:
      return Math.exp(-t / 10 * Math.LN2 * 1);
  }
}

/** Stressed markets transmit more (correlations rise): 1 → ~1.4. */
export function regimeMultiplier(totalIntensity: number): number {
  return 1 + 0.4 * Math.tanh(totalIntensity / 2);
}
