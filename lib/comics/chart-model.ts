/**
 * Chart maths for the detail page. Every output comes from observed prices only:
 * no padding, no invented wicks, no filler values.
 */

export type PricePoint = [number, number]; // [epoch ms, USD]
export type Candle = [number, number, number, number, number]; // [epoch ms, open, high, low, close]

/**
 * Monthly candles built from the real observations inside each calendar month (UTC):
 * open = first observation, close = last, high = max, low = min. A month with a single
 * observation is a flat candle. Months with no observation produce no candle.
 */
export function monthlyCandles(points: PricePoint[]): Candle[] {
  const buckets = new Map<string, PricePoint[]>();
  for (const p of [...points].sort((a, b) => a[0] - b[0])) {
    if (!(p[1] > 0) || !Number.isFinite(p[0])) continue;
    const key = new Date(p[0]).toISOString().slice(0, 7);
    const arr = buckets.get(key);
    if (arr) arr.push(p);
    else buckets.set(key, [p]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, arr]) => {
      const prices = arr.map((x) => x[1]);
      return [
        Date.parse(`${key}-01T00:00:00Z`),
        arr[0][1],
        Math.max(...prices),
        Math.min(...prices),
        arr[arr.length - 1][1],
      ] as Candle;
    });
}

/** Wilder RSI(14). null for every index before 15 prices exist; never filled. */
export function rsi14(prices: number[]): (number | null)[] {
  const out: (number | null)[] = prices.map(() => null);
  if (prices.length < 15) return out;
  const ch = prices.slice(1).map((v, i) => v - prices[i]);
  let g = ch.slice(0, 14).filter((c) => c > 0).reduce((a, b) => a + b, 0) / 14;
  let l = ch.slice(0, 14).filter((c) => c < 0).reduce((a, b) => a - b, 0) / 14;
  out[14] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
  for (let i = 14; i < ch.length; i++) {
    g = (g * 13 + (ch[i] > 0 ? ch[i] : 0)) / 14;
    l = (l * 13 + (ch[i] < 0 ? -ch[i] : 0)) / 14;
    out[i + 1] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
  }
  return out;
}

/** Recorded sales per calendar day for one grade, as [epoch ms, count]. */
export function salesPerDay(sales: Array<{ grade: string; date: string }>, grade: string): PricePoint[] {
  const m = new Map<string, number>();
  for (const s of sales) {
    if (s.grade !== grade || !s.date) continue;
    const d = s.date.slice(0, 10);
    m.set(d, (m.get(d) ?? 0) + 1);
  }
  return [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([d, n]) => [Date.parse(`${d}T00:00:00Z`), n] as PricePoint);
}

/** One point per UTC day (the last observation of that day wins), ascending. */
export function dailyLastPoints(points: PricePoint[]): PricePoint[] {
  const m = new Map<string, PricePoint>();
  for (const p of [...points].sort((a, b) => a[0] - b[0])) {
    if (p[1] > 0) m.set(new Date(p[0]).toISOString().slice(0, 10), p);
  }
  return [...m.values()];
}

export interface GradeStats {
  grade: string;
  latest: { priceUsd: number; date: string };
  change30dPct: number | null;
  low: number;
  high: number;
  first: string;
  count: number;
}

/**
 * Plain statistics of the dated prices on file for one grade (the one with the most prices; 9.8 wins ties).
 * change30dPct compares the latest price with the newest price that is at least 30 days older; null when none is.
 */
export function gradeStats(history: Array<{ grade: string; priceUsd: number; observedAt: string }>): GradeStats | null {
  const by = new Map<string, Array<{ t: number; p: number; d: string }>>();
  for (const h of history) {
    const t = Date.parse(h.observedAt);
    if (!(h.priceUsd > 0) || !Number.isFinite(t)) continue;
    const arr = by.get(h.grade) ?? [];
    arr.push({ t, p: h.priceUsd, d: h.observedAt });
    by.set(h.grade, arr);
  }
  if (by.size === 0) return null;
  const grade = [...by.entries()].sort((a, b) => b[1].length - a[1].length || (a[0] === "9.8" ? -1 : b[0] === "9.8" ? 1 : 0))[0][0];
  const pts = (by.get(grade) ?? []).sort((a, b) => a.t - b.t);
  const latest = pts[pts.length - 1];
  const older = pts.filter((p) => p.t <= latest.t - 30 * 86_400_000);
  const base = older.length ? older[older.length - 1] : null;
  return {
    grade,
    latest: { priceUsd: latest.p, date: latest.d },
    change30dPct: base ? Number((((latest.p - base.p) / base.p) * 100).toFixed(2)) : null,
    low: Math.min(...pts.map((p) => p.p)),
    high: Math.max(...pts.map((p) => p.p)),
    first: pts[0].d,
    count: pts.length,
  };
}
