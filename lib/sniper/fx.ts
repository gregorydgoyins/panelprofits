/**
 * Real exchange rates for converting foreign eBay prices to USD.
 * Source: the European Central Bank reference rates via frankfurter.app (free, no key), cached for 6 hours.
 * If the rates can't be fetched, callers skip foreign marketplaces for that run instead of guessing a rate.
 */
let cache: { at: number; usdPer: Record<string, number> } | null = null;
const TTL_MS = 6 * 3600_000;

export async function usdPerUnit(code: string): Promise<number | null> {
  if (code === "USD") return 1;
  const now = Date.now();
  if (!cache || now - cache.at > TTL_MS) {
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=GBP,CAD,EUR,AUD", { signal: AbortSignal.timeout(6000), cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        const usdPer: Record<string, number> = {};
        for (const [cur, perUsd] of Object.entries(j.rates ?? {})) {
          const n = Number(perUsd);
          if (n > 0) usdPer[cur] = 1 / n; // rates are units of `cur` per 1 USD; we want USD per 1 unit
        }
        if (Object.keys(usdPer).length) cache = { at: now, usdPer };
      }
    } catch {}
  }
  // A cache older than its TTL is still the last real rate; use it rather than nothing, but never invent one.
  return cache?.usdPer[code] ?? null;
}
