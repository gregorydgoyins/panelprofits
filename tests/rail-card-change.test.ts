import { describe, it, expect } from "vitest";
import { mapCoveredBook } from "@/lib/equity/covered-books";

const base = {
  rail_seq: 1, comics_id: "x", age: "silver", origin_era: "silver", origin_year: 1960, edition_form: "DIRECT", printing: "1",
  variant_label: null, publisher: "P", series: "Test Series", issue_number: "1", year: 1960, pp_id: null,
  pp_ladder: null as Record<string, number> | null, cb_price: null as number | null, cb_values: null as Record<string, number> | null,
  cover_url: "https://example.com/c.jpg", scarcity_tier: null,
};

describe("rail card change = two real ComicBase values", () => {
  it("NOW vs latest yearly value", () => {
    const it = mapCoveredBook({ ...base, cb_price: 110, cb_values: { "2023": 90, "2024": 100 } })!;
    expect(it.change?.fromLabel).toBe("’24");
    expect(it.change?.toLabel).toBe("NOW");
    expect(it.change?.pct).toBeCloseTo(10, 5);
  });
  it("latest yearly vs previous yearly when there is no NOW price", () => {
    const it = mapCoveredBook({ ...base, pp_ladder: { "9.8": 50 }, cb_values: { "2023": 100, "2024": 80 } })!;
    expect(it.change?.pct).toBeCloseTo(-20, 5);
  });
  it("no change when fewer than two published values", () => {
    expect(mapCoveredBook({ ...base, pp_ladder: { "9.8": 50 }, cb_values: { "2024": 80 } })!.change).toBeNull();
    expect(mapCoveredBook({ ...base, cb_price: 5 })!.change).toBeNull();
  });
  it("flat is exactly zero", () => {
    expect(mapCoveredBook({ ...base, cb_price: 100, cb_values: { "2024": 100 } })!.change?.pct).toBe(0);
  });
});
