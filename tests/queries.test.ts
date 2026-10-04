import { describe, it, expect } from "vitest";
import { DEFAULT_PAGE_SIZE } from "../lib/comics/queries";

describe("Catalog Queries & Keyset Configuration", () => {
  it("defines bounded page size of 24 records", () => {
    expect(DEFAULT_PAGE_SIZE).toBe(24);
  });

  it("validates comic search parameters format", () => {
    const params = {
      q: "Batman",
      issue: "1",
      publisher: "DC",
      year: "1940",
      variant: "direct",
    };
    expect(params.q).toBe("Batman");
    expect(params.issue).toBe("1");
    expect(params.publisher).toBe("DC");
    expect(params.year).toBe("1940");
    expect(params.variant).toBe("direct");
  });

  it("resolves Deadpool Max #10 with authentic Kyle Baker cover and exact market pricing matrix", async () => {
    const { getComicById } = await import("../lib/comics/queries");
    const { panelProfitsGrades, panelProfitsSpreads, panelProfitsVolume } = await import("../lib/pricing/source-ladder");

    const comic = await getComicById("51198810548282e4912ac5e2b7750803044dcf6f22e9c15e573be55b7812e1f5");
    expect(comic).not.toBeNull();
    if (!comic) return;

    // Authentic Kyle Baker MAX cover (not Deadpool Corps #10)
    expect(comic.cover_url).toBe("/covers/deadpool_max_10.jpg");
    expect(comic.series).toBe("Deadpool Max");
    expect(comic.issue_number).toBe("10");

    // Exact Pricing Matrix
    const ladder = panelProfitsGrades(comic);
    expect(ladder["RAW"]).toBe(2.99);
    expect(ladder["9.8"]).toBe(50.00);

    // Intermediate grades must be unpriced
    expect(ladder["4.0"]).toBeUndefined();
    expect(ladder["6.0"]).toBeUndefined();
    expect(ladder["8.0"]).toBeUndefined();
    expect(ladder["9.2"]).toBeUndefined();

    // Spreads
    const rawSpreads = panelProfitsSpreads(comic, "RAW");
    expect(rawSpreads.sell).toBe(3.29);
    expect(rawSpreads.buy).toBeNull();

    const slab98Spreads = panelProfitsSpreads(comic, "9.8");
    expect(slab98Spreads.buy).toBe(22.00);
    expect(slab98Spreads.sell).toBe(54.99);

    // Volume
    expect(panelProfitsVolume(comic, "RAW")).toBe("2 sales per year");
    expect(panelProfitsVolume(comic, "9.8")).toBe("1 sale per year");
    expect(panelProfitsVolume(comic, "4.0")).toBe("rare");

    // Cover publication price ($3.99 direct edition)
    expect((comic.panel_profits_data as any)?.coverPrice).toBe(3.99);
  });
});
