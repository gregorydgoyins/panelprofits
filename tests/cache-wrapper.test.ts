import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCachedQuery, withCache, cacheManager } from "@/lib/cache/wrapper";

describe("Cache Wrapper (lib/cache/wrapper)", () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  it("caches query results and delivers sub-millisecond responses on cache hit", async () => {
    let callCount = 0;
    const fetchCatalog = async (category: string) => {
      callCount++;
      return { category, count: 42 };
    };

    const cachedFetch = createCachedQuery(fetchCatalog, "test-catalog", { ttlSeconds: 60 });

    const result1 = await cachedFetch("marvel");
    expect(result1).toEqual({ category: "marvel", count: 42 });
    expect(callCount).toBe(1);

    const t0 = performance.now();
    const result2 = await cachedFetch("marvel");
    const elapsed = performance.now() - t0;

    expect(result2).toEqual({ category: "marvel", count: 42 });
    expect(callCount).toBe(1); // No second execution
    expect(elapsed).toBeLessThan(10); // Typically < 0.1ms
  });

  it("coalesces in-flight requests to eliminate thundering herd / stampede effect", async () => {
    let executionCount = 0;
    const slowQuery = async () => {
      executionCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { timestamp: Date.now() };
    };

    const cachedQuery = createCachedQuery(slowQuery, "slow-query", { ttlSeconds: 60 });

    // 5 concurrent requests hit the cold cache simultaneously
    const results = await Promise.all([
      cachedQuery(),
      cachedQuery(),
      cachedQuery(),
      cachedQuery(),
      cachedQuery(),
    ]);

    expect(executionCount).toBe(1); // Exactly one underlying DB execution
    expect(results[0]).toEqual(results[1]);
    expect(results[0]).toEqual(results[4]);

    const stats = cacheManager.getStats();
    expect(stats.dedupedRequests).toBe(4);
    expect(stats.misses).toBe(1);
  });

  it("supports Stale-While-Revalidate (SWR) returning stale value immediately", async () => {
    let count = 100;
    const counterQuery = async () => {
      count++;
      return count;
    };

    // 1 ms TTL, 2000 ms SWR
    const cachedCounter = createCachedQuery(counterQuery, "counter", {
      ttlSeconds: 0.001,
      staleWhileRevalidateSeconds: 2,
    });

    const first = await cachedCounter();
    expect(first).toBe(101);

    // Wait 10ms so it exceeds fresh TTL (0.001s = 1ms) but is within SWR
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Stale hit: should immediately return stale value (101) without waiting for refresh
    const t0 = performance.now();
    const staleResult = await cachedCounter();
    const elapsed = performance.now() - t0;

    expect(staleResult).toBe(101);
    expect(elapsed).toBeLessThan(10);

    // Allow background refresh to finish
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Next call gets updated value
    const freshResult = await cachedCounter();
    expect(freshResult).toBe(102);
  });

  it("invalidates cache by key and by tag", async () => {
    let callA = 0;
    let callB = 0;

    const queryA = async () => {
      callA++;
      return "A";
    };
    const queryB = async () => {
      callB++;
      return "B";
    };

    const cachedA = createCachedQuery(queryA, "query-a", { tags: ["comics"] });
    const cachedB = createCachedQuery(queryB, "query-b", { tags: ["pricing"] });

    await cachedA();
    await cachedB();
    expect(callA).toBe(1);
    expect(callB).toBe(1);

    // Invalidate tag "comics"
    cacheManager.invalidateTag("comics");

    await cachedA();
    expect(callA).toBe(2); // Invalidation caused re-query

    await cachedB();
    expect(callB).toBe(1); // Unaffected tag did not re-query
  });

  it("handles direct withCache helper", async () => {
    let calls = 0;
    const fetchSummary = async () => {
      calls++;
      return { total: 100 };
    };

    const res1 = await withCache("direct-summary", fetchSummary, { ttlSeconds: 60 });
    const res2 = await withCache("direct-summary", fetchSummary, { ttlSeconds: 60 });

    expect(res1).toEqual({ total: 100 });
    expect(res2).toEqual({ total: 100 });
    expect(calls).toBe(1);
  });
});
