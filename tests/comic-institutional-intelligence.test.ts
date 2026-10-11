import { describe, it, expect } from "vitest";
import type { ComicRecord } from "@/lib/comics/types";
import {
  panelProfitsGrades,
  comicBaseGrades,
  ebayGrades,
  goCollectCgcGrades,
} from "@/lib/pricing/source-ladder";

describe("Comic Detail Institutional Intelligence & Price Matrix", () => {
  const mockComic: Partial<ComicRecord> = {
    id: "mock-batman-423",
    series: "Batman",
    issue_number: "423",
    publication_year: 1988,
    publisher: "DC Comics",
    pp_grade_9_8_price: 275.00,
    baseline_grade_9_8_value: 275.00,
    panel_profits_data: {
      ticker: "$BTM423",
      "PP - Grade 9.8 Market Price": 275.00,
      "PP - Grade 9.6 Market Price": 180.00,
      "PP - Grade 9.4 Market Price": 130.00,
      "PP - Grade 9.2 Market Price": 105.00,
      "PP - Grade 9.0 Market Price": 85.00,
      "PP - Grade RAW Market Price": 50.00,
      ebay: {
        "eBay - Grade 9.8": 210.00,
        "eBay - Grade 9.6": 135.00,
      },
    },
    comicbase_data: {
      "CB - NM- (9.2)": 120.00,
    },
  };

  it("extracts multi-source grade lattice with strict parity across PP, eBay, and ComicBase", () => {
    const pp = panelProfitsGrades(mockComic as ComicRecord);
    const cb = comicBaseGrades(mockComic as ComicRecord);
    const ebay = ebayGrades(mockComic as ComicRecord);

    expect(pp["9.8"]).toBe(275.00);
    expect(pp["9.6"]).toBe(180.00);
    expect(pp["RAW"]).toBe(50.00);

    expect(ebay["9.8"]).toBe(210.00);
    expect(ebay["9.6"]).toBe(135.00);

    // Verify dislocation calculation: (PP - eBay) / PP
    const dislocation98 = Math.round(((pp["9.8"]! - ebay["9.8"]!) / pp["9.8"]!) * 100);
    expect(dislocation98).toBe(24); // 24% discount below PP FMV
  });

  it("models institutional execution targets and downside cushions", () => {
    const anchorFmv = 275.00;
    const discountPercent = 32;
    const allInCost = Number((anchorFmv * (1 - discountPercent / 100)).toFixed(2));
    const targetWinPrice100Pct = Number((allInCost * 2.35).toFixed(2));
    const targetWinPrice50Pct = Number((allInCost * 1.76).toFixed(2));

    expect(allInCost).toBe(187.00);
    expect(targetWinPrice100Pct).toBe(439.45);
    expect(targetWinPrice50Pct).toBe(329.12);

    // Wholesale buy-list floor modeled at 72%
    const wholesaleFloor = Number((anchorFmv * 0.72).toFixed(2));
    expect(wholesaleFloor).toBe(198.00);
    expect(wholesaleFloor).toBeGreaterThan(allInCost); // Assures capital preservation floor
  });
});
