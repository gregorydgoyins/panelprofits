import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });

describe("read-only eBay sold-history access", () => {
  it("reports missing credentials without requesting listings", async () => {
    vi.stubEnv("EBAY_CLIENT_ID", ""); vi.stubEnv("EBAY_CLIENT_SECRET", "");
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const { searchEbaySold } = await import("../lib/sniper/ebay-sold");
    const result = await searchEbaySold("Amazing Spider-Man 300 CGC 9.8");
    expect(result.available).toBe(false);
    expect(result.items).toEqual([]);
    expect(result.code).toBe("missing_credentials");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects sandbox data as real completed sales", async () => {
    vi.stubEnv("EBAY_CLIENT_ID", "test-only"); vi.stubEnv("EBAY_CLIENT_SECRET", "test-only"); vi.stubEnv("EBAY_ENV", "sandbox");
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const { searchEbaySold } = await import("../lib/sniper/ebay-sold");
    expect((await searchEbaySold("Amazing Spider-Man 300 CGC 9.8")).code).toBe("sandbox");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("preserves invalid_scope and never falls back to active Browse prices", async () => {
    vi.stubEnv("EBAY_CLIENT_ID", "test-only"); vi.stubEnv("EBAY_CLIENT_SECRET", "test-only"); vi.stubEnv("EBAY_ENV", "production");
    const fetcher = vi.fn().mockResolvedValue(Response.json({ error: "invalid_scope", error_description: "The requested scope is invalid, unknown, or malformed" }, { status: 400 }));
    vi.stubGlobal("fetch", fetcher);
    const { searchEbaySold } = await import("../lib/sniper/ebay-sold");
    const result = await searchEbaySold("Amazing Spider-Man 300 CGC 9.8");
    expect(result).toMatchObject({ available: false, stage: "oauth", status: 400, code: "invalid_scope", items: [] });
    await searchEbaySold("Batman 423 CGC 9.8");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0][0])).not.toContain("browse");
  });
});
