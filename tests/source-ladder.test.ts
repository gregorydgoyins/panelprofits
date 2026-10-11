import { describe, expect, it } from "vitest";
import {
  comicBaseGrades,
  comicBaseReference,
  ebayGrades,
  egsGrades,
  getHighestGradedPrice,
  goCollectCbcsGrades,
  goCollectCgcGrades,
  goCollectPsaGrades,
  GRADES,
  panelProfitsGrades,
  pgxGrades,
  priceChartingGrades,
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

  it("extracts PriceCharting grades independently without polluting Panel Profits or ComicBase", () => {
    const comic = {
      pricecharting_data: {
        raw: 45.0,
        grade_8_0: 120.0,
        grade_9_8: 850.0,
      },
      comicbase_price: 25.0,
      pp_grade_9_8_price: null,
    };
    const pc = priceChartingGrades(comic);
    expect(pc["RAW"]).toBe(45.0);
    expect(pc["8.0"]).toBe(120.0);
    expect(pc["9.8"]).toBe(850.0);
    expect(panelProfitsGrades(comic)).toEqual({});
  });

  it("extracts eBay sold ladders from dictionary and transaction arrays without guessing missing grades", () => {
    const comicWithDict = {
      ebay_data: {
        raw: 18.5,
        "eBay - Grade 9.4": 125.0,
        ebay_grade_9_8_price: 350.0,
      },
    };
    const ladderDict = ebayGrades(comicWithDict as any);
    expect(ladderDict["RAW"]).toBe(18.5);
    expect(ladderDict["9.4"]).toBe(125.0);
    expect(ladderDict["9.8"]).toBe(350.0);
    expect(ladderDict["9.6"]).toBeUndefined();

    // From sales transaction array
    const comicWithArray = {
      ebay_sales: [
        { grade: "RAW", price: 22.0 },
        { grade: "9.6", price: 210.0 },
        { grade: "9.8", price: 420.0 },
      ],
    };
    const ladderArray = ebayGrades(comicWithArray as any);
    expect(ladderArray["RAW"]).toBe(22.0);
    expect(ladderArray["9.6"]).toBe(210.0);
    expect(ladderArray["9.8"]).toBe(420.0);
    expect(ladderArray["9.2"]).toBeUndefined();
  });

  it("extracts GoCollect certified ladders for CGC, CBCS, and PSA strictly without RAW contamination", () => {
    const comic = {
      panel_profits_data: {
        gocollect_cgc: { "GoCollect - CGC - Grade 9.8": "1500" },
        cbcs_grades: { cbcs_9_6: "450" },
        psa_grades: { psa_9_8: "1200" },
      },
    };

    const cgc = goCollectCgcGrades(comic);
    expect(cgc["9.8"]).toBe(1500);
    expect(cgc["RAW"]).toBeUndefined();

    const cbcs = goCollectCbcsGrades(comic);
    expect(cbcs["9.6"]).toBe(450);
    expect(cbcs["RAW"]).toBeUndefined();

    const psa = goCollectPsaGrades(comic);
    expect(psa["9.8"]).toBe(1200);
    expect(psa["RAW"]).toBeUndefined();
  });

  it("extracts PGX and EGS/EGA certified ladders strictly from authentic stored rows without RAW bleed", () => {
    const comic = {
      panel_profits_data: {
        pgx: { "PGX - Grade 9.4": "175", pgx_grade_9_8_price: "550" },
        egs: { "EGS - Grade 9.6": "220", ega_grade_9_8_price: "480" },
      },
    };

    const pgx = pgxGrades(comic);
    expect(pgx["9.4"]).toBe(175);
    expect(pgx["9.8"]).toBe(550);
    expect(pgx["RAW"]).toBeUndefined();

    const egs = egsGrades(comic);
    expect(egs["9.6"]).toBe(220);
    expect(egs["9.8"]).toBe(480);
    expect(egs["RAW"]).toBeUndefined();
  });
});

