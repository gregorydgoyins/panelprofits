import { describe, expect, it } from "vitest";
import {
  comicBaseGrades,
  comicBaseReference,
  getHighestGradedPrice,
  GRADES,
  panelProfitsGrades,
} from "@/lib/pricing/source-ladder";

describe("distinct grade evidence", () => {
  it("includes RAW as the first grade tier in GRADES", () => {
    expect(GRADES[0]).toBe("RAW");
  });

  it("uses only explicitly stored Panel Profits market grades including RAW", () => {
    const prices = panelProfitsGrades({
      panel_profits_data: {
        "PP - Ungraded Market Price": "28.50",
        "PP - Grade 4.0 Market Price": "$2,500",
        "PP - Grade 9.8 Market Price": "746000",
        "PP - Grade 6.0 Buy Price": "1000",
        "PP - Grade 10.0 Market Price": "0",
      },
      pp_grade_9_8_price: null,
      comicbase_price: 1300000,
    });
    expect(prices["RAW"]).toBe(28.5);
    expect(prices["4.0"]).toBe(2500);
    expect(prices["9.8"]).toBe(746000);
    expect(prices["6.0"]).toBeUndefined();
    expect(prices["10.0"]).toBeUndefined();
    expect(Object.keys(prices)).toHaveLength(3);
  });

  it("extracts RAW ungraded price when available", () => {
    const prices = panelProfitsGrades({
      panel_profits_data: {
        "PP - Ungraded Market Price": "14.99",
        "PP - Grade 8.0 Market Price": "45.00",
      },
    });
    expect(prices["RAW"]).toBe(14.99);
    expect(prices["8.0"]).toBe(45);
    expect(prices["9.8"]).toBeUndefined();
    expect(prices["9.9"]).toBeUndefined();
  });

  it("determines authentic highest graded price without guessing 9.8", () => {
    const pp = panelProfitsGrades({
      panel_profits_data: {
        "PP - Ungraded Market Price": "10.00",
        "PP - Grade 4.0 Market Price": "25.00",
        "PP - Grade 7.5 Market Price": "80.00",
      },
    });
    const highest = getHighestGradedPrice({ "Panel Profits": pp });
    expect(highest).not.toBeNull();
    expect(highest?.grade).toBe("7.5");
    expect(highest?.price).toBe(80);
    expect(highest?.isRaw).toBe(false);
  });

  it("falls back to RAW when only ungraded market price exists", () => {
    const pp = panelProfitsGrades({
      panel_profits_data: {
        "PP - Ungraded Market Price": "12.50",
      },
    });
    const highest = getHighestGradedPrice({ "Panel Profits": pp });
    expect(highest).not.toBeNull();
    expect(highest?.grade).toBe("RAW");
    expect(highest?.price).toBe(12.5);
    expect(highest?.isRaw).toBe(true);
  });

  it("does not project the ComicBase reference onto a certified grade", () => {
    const comic = { comicbase_price: 1300000, panel_profits_data: null };
    expect(comicBaseReference(comic)).toBe(1300000);
    expect(panelProfitsGrades(comic)).toEqual({});
  });
});

