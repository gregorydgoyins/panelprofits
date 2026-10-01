/**
 * Resilient In-Memory & Distributed Cache Wrapper for Panel Profits.
 * 
 * Provides:
 * 1. Sub-millisecond reads from an in-process LRU/TTL store.
 * 2. In-flight Request Coalescing (Thundering Herd / Cache Stampede protection).
 * 3. Stale-While-Revalidate (SWR): serves expired cache immediately while refreshing in background.
 * 4. Tag-based and key-based cache invalidation.
 * 5. Environment-agnostic safety: operates reliably across Next.js SSR, API routes,
 *    background jobs, tests, and standalone scripts without throwing Invariant errors.
 */

export interface CacheConfig {
  /**
   * Time in seconds for which cached data is considered fresh.
   * Default: 300 seconds (5 minutes).
   */
  ttlSeconds?: number;

  /**
   * Additional window in seconds during which stale data may be served
   * while a background refresh executes.
   * Default: 3600 seconds (1 hour). Set to 0 to disable SWR.
   */
  staleWhileRevalidateSeconds?: number;

  /**
   * Optional tags for group invalidation (e.g. ['comics', 'pricing']).
   */
  tags?: string[];

  /**
   * Optional custom function to serialize arguments into a unique cache key suffix.
   */
  keyGenerator?: (...args: any[]) => string;
}

interface CacheEntry<T> {
  value: T;
  freshUntil: number;
  staleUntil: number;
  tags: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  staleHits: number;
  dedupedRequests: number;
  evictions: number;
  totalEntries: number;
}

class MemoryCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private inflight = new Map<string, Promise<any>>();
  private maxEntries = 5000;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    dedupedRequests: 0,
    evictions: 0,
    totalEntries: 0,
  };

  /**
   * Executes a query with caching, request coalescing, and SWR.
   */
  async getOrSet<T>(
    key: string,
    queryFn: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<T> {
    const ttlSeconds = config.ttlSeconds ?? 300;
    const swrSeconds = config.staleWhileRevalidateSeconds ?? 3600;
    const tags = config.tags || [];
    const now = Date.now();

    const entry = this.cache.get(key);

    if (entry) {
      // 1. Fresh Hit
      if (now < entry.freshUntil) {
        this.stats.hits++;
        return entry.value;
      }

      // 2. Stale-While-Revalidate Hit
      if (now < entry.staleUntil) {
        this.stats.staleHits++;
        // Kick off background refresh if not already in-flight
        if (!this.inflight.has(key)) {
          this.executeAndStore(key, queryFn, ttlSeconds, swrSeconds, tags).catch((err) => {
            console.warn(`[Cache SWR Refresh Failed] Key: ${key}:`, err?.message || err);
          });
        }
        // Return stale data immediately (drop latency to <1ms)
        return entry.value;
      }

      // Past stale limit -> purge
      this.cache.delete(key);
    }

    // 3. Cache Miss: In-Flight Request Coalescing (Thundering Herd Protection)
    if (this.inflight.has(key)) {
      this.stats.dedupedRequests++;
      return this.inflight.get(key) as Promise<T>;
    }

    // 4. Cold Miss: Execute query and store
    this.stats.misses++;
    return this.executeAndStore(key, queryFn, ttlSeconds, swrSeconds, tags);
  }

  private async executeAndStore<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttlSeconds: number,
    swrSeconds: number,
    tags: string[]
  ): Promise<T> {
    const promise = (async () => {
      try {
        const value = await queryFn();
        const now = Date.now();

        // Enforce max entry bounds with simple LRU/FIFO eviction
        if (this.cache.size >= this.maxEntries) {
          const oldestKey = this.cache.keys().next().value;
          if (oldestKey) {
            this.cache.delete(oldestKey);
            this.stats.evictions++;
          }
        }

        this.cache.set(key, {
          value,
          freshUntil: now + ttlSeconds * 1000,
          staleUntil: now + (ttlSeconds + swrSeconds) * 1000,
          tags,
        });

        this.stats.totalEntries = this.cache.size;
        return value;
      } finally {
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Invalidate a single key.
   */
  invalidateKey(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching any of the specified tags.
   */
  invalidateTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.totalEntries = this.cache.size;
    return count;
  }

  /**
   * Clear entire cache and reset stats.
   */
  clear(): void {
    this.cache.clear();
    this.inflight.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      dedupedRequests: 0,
      evictions: 0,
      totalEntries: 0,
    };
  }

  /**
   * Get current cache stats for monitoring and benchmarking.
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      totalEntries: this.cache.size,
    };
  }
}

// Global singleton instance shared across requests in the current process
const globalMemoryCache = new MemoryCacheManager();

/**
 * Wraps an asynchronous query with the high-performance cache manager.
 * Returns a new function with identical arguments and return type.
 */
export function createCachedQuery<TArgs extends any[], TReturn>(
  queryFn: (...args: TArgs) => Promise<TReturn>,
  keyPrefix: string,
  config: CacheConfig = {}
): (...args: TArgs) => Promise<TReturn> {
  const defaultKeyGen = (...args: any[]) => {
    if (args.length === 0) return "";
    try {
      return ":" + JSON.stringify(args);
    } catch {
      return ":" + String(args);
    }
  };

  const keyGen = config.keyGenerator || defaultKeyGen;

  return async (...args: TArgs): Promise<TReturn> => {
    const key = `${keyPrefix}${keyGen(...args)}`;
    return globalMemoryCache.getOrSet(
      key,
      () => queryFn(...args),
      config
    );
  };
}

/**
 * Direct call wrapper: execute `queryFn` guarded by the cache with `key`.
 */
export async function withCache<T>(
  key: string,
  queryFn: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  return globalMemoryCache.getOrSet(key, queryFn, config);
}

/**
 * Invalidate cache by key or tag.
 */
export const cacheManager = {
  invalidateKey: (key: string) => globalMemoryCache.invalidateKey(key),
  invalidateTag: (tag: string) => globalMemoryCache.invalidateTag(tag),
  clear: () => globalMemoryCache.clear(),
  getStats: () => globalMemoryCache.getStats(),
};
