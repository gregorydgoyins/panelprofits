import { describe, it, expect } from "vitest";
import { resolveComicPricing } from "../lib/pricing/baseline";
import { ComicRecord } from "../lib/comics/types";

describe("Pricing Fallback Engine", () => {
  it("uses promoted pp_grade_9_8_price when available", () => {
    const comic: Partial<ComicRecord> = {
      pp_grade_9_8_price: 450.0,
      panel_profits_data: {
        "PP - Grade 9.8 Market Price": "300.00",
      },
    };
    const result = resolveComicPricing(comic);
    expect(result.panelProfitsPrice98).toBe(450.0);
    expect(result.panelProfitsPriceSource).toBe("Panel Profits Promoted Grade 9.8");
  });

  it("falls back to panel_profits_data['PP - Grade 9.8 Market Price'] when pp_grade_9_8_price is null", () => {
    const comic: Partial<ComicRecord> = {
      pp_grade_9_8_price: null,
      panel_profits_data: {
        "PP - Grade 9.8 Market Price": "$350.50",
      },
    };
    const result = resolveComicPricing(comic);
    expect(result.panelProfitsPrice98).toBe(350.5);
    expect(result.panelProfitsPriceSource).toBe("Panel Profits Historical Grade 9.8");
  });

  it("resolves baseline value from panel_profits_data when promoted column is null", () => {
    const comic: Partial<ComicRecord> = {
      baseline_grade_9_8_value: null,
      panel_profits_data: {
        "Panel Profits Baseline Grade 9.8 Value": "1250.00",
        "Panel Profits Baseline Grade 9.8 Sources": "Auction Sales Consensus",
        "Panel Profits Baseline Grade 9.8 Observation Count": "42",
      },
    };
    const result = resolveComicPricing(comic);
    expect(result.baselinePrice98).toBe(1250.0);
    expect(result.baselineSource).toBe("Auction Sales Consensus");
    expect(result.observationCount).toBe(42);
  });

  it("keeps comicbase_price isolated and leaves baselinePrice98 null when 9.8 pricing is missing", () => {
    const comic: Partial<ComicRecord> = {
      baseline_grade_9_8_value: null,
      panel_profits_data: null,
      comicbase_price: 24.95,
    };
    const result = resolveComicPricing(comic);
    expect(result.baselinePrice98).toBeNull();
    expect(result.comicbasePrice).toBe(24.95);
    expect(result.baselineSource).toBeNull();
  });

  it("recovers historical PP pricing when empty promoted columns are zero", () => {
    const result = resolveComicPricing({
      pp_grade_9_8_price: 0,
      baseline_grade_9_8_value: 0,
      panel_profits_data: {
        "PP - Grade 9.8 Market Price": "$350.50",
        "Panel Profits Baseline Grade 9.8 Value": "300.00",
      },
      comicbase_price: 24.95,
    });
    expect(result.panelProfitsPrice98).toBe(350.5);
    expect(result.baselinePrice98).toBe(300);
    expect(result.comicbasePrice).toBe(24.95);
  });

  it("keeps 9.8 baseline unpriced if historical baseline text is not a price, isolating ComicBase", () => {
    const result = resolveComicPricing({
      baseline_grade_9_8_value: null,
      panel_profits_data: { "Panel Profits Baseline Grade 9.8 Value": "unavailable" },
      comicbase_price: 24.95,
    });
    expect(result.baselinePrice98).toBeNull();
    expect(result.comicbasePrice).toBe(24.95);
    expect(result.baselineSource).toBeNull();
  });

  it("gracefully handles complete absence of pricing data", () => {
    const comic: Partial<ComicRecord> = {
      pp_grade_9_8_price: null,
      comicbase_price: null,
      baseline_grade_9_8_value: null,
      panel_profits_data: null,
    };
    const result = resolveComicPricing(comic);
    expect(result.panelProfitsPrice98).toBeNull();
    expect(result.comicbasePrice).toBeNull();
    expect(result.baselinePrice98).toBeNull();
    expect(result.baselineSource).toBeNull();
  });
});
