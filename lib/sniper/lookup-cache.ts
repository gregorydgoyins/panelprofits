/**
 * Per-process cache for exact lookups (census / GoCollect comps). Census rows change rarely, so a warm server only queries
 * listings it hasn't resolved yet. "Not found" is cached too (as null) so a miss is not re-queried on every request.
 */
const stores = new Map<string, Map<string, { at: number; value: unknown | null }>>();

export async function cachedBatch<Q extends { key: string }, V>(
  name: string,
  ttlMs: number,
  queries: Q[],
  idOf: (q: Q) => string,
  fn: (misses: Q[]) => Promise<Map<string, V>>,
): Promise<Map<string, V>> {
  const store = stores.get(name) ?? new Map();
  stores.set(name, store);
  const now = Date.now();
  const out = new Map<string, V>();
  const misses: Q[] = [];
  for (const q of queries) {
    const hit = store.get(idOf(q));
    if (hit && now - hit.at < ttlMs) { if (hit.value != null) out.set(q.key, hit.value as V); }
    else misses.push(q);
  }
  if (misses.length) {
    const found = await fn(misses); // throws on failure -> nothing cached, caller handles
    for (const q of misses) {
      const v = found.get(q.key);
      store.set(idOf(q), { at: now, value: v ?? null });
      if (v != null) out.set(q.key, v);
    }
  }
  if (store.size > 20000) store.clear();
  return out;
}
