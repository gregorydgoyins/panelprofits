import { describe, it, expect } from "vitest";
import {
  toSaleList, lastSale, countSalesByGrade, delta24hPct, ppSpreadAnchors,
  censusNinePlus, buildCompleteness, buildProvenanceLedger, buildQuote, pickQuoteGrade,
} from "@/lib/comics/detail-model";

const sale = (p: any, d: any, g: any, v: any = "heritage") => ({ sale_price: p, sale_date: d, native_grade_text: g, venue: v });

describe("detail-model", () => {
  it("drops sales missing price, date or grade and sorts newest first", () => {
    const rows = [sale(100, "2024-01-01", "CGC 9.8"), sale(null, "2024-02-01", "CGC 9.8"), sale(50, null, "CGC 9.8"), sale(75, "2025-03-01", "CGC 9.6"), sale(10, "2025-04-01", "")];
    const out = toSaleList(rows);
    expect(out.map((s) => s.priceUsd)).toEqual([75, 100]);
    expect(lastSale(rows)?.date).toBe("2025-03-01");
    expect(lastSale([])).toBeNull();
    expect(countSalesByGrade(rows).get("CGC 9.8")).toBe(1);
  });

  it("24h delta only when the two latest snapshots are exactly one day apart", () => {
    const o = (d: string, a: number) => ({ amount: a, observed_at: d, grade_label: "9.8" });
    expect(delta24hPct([o("2026-10-10", 100), o("2026-10-11", 110)], "9.8")).toBe(10);
    expect(delta24hPct([o("2026-10-08", 100), o("2026-10-11", 110)], "9.8")).toBeNull();
    expect(delta24hPct([o("2026-10-11", 110)], "9.8")).toBeNull();
  });

  it("spread anchors need both stored sides", () => {
    const a = ppSpreadAnchors({ "9.8": { buy: 80, sell: 100 }, RAW: { buy: 5 }, "6.0": { buy: 30, sell: 20 } });
    expect(Object.keys(a)).toEqual(["9.8"]);
    expect(a["9.8"].spread).toBe(0.2);
    expect(ppSpreadAnchors(null)).toEqual({});
    expect(pickQuoteGrade(a)).toBe("9.8");
    expect(pickQuoteGrade({})).toBeNull();
    expect(buildQuote("9.8", 100, a, "2026-10-11")).toMatchObject({ buyUsd: 80, sellUsd: 100, fmvUsd: 100 });
    expect(buildQuote("9.8", 0, {}, null)).toMatchObject({ buyUsd: null, sellUsd: null, fmvUsd: null });
  });

  it("census 9.0+ is null with no rows", () => {
    expect(censusNinePlus([])).toBeNull();
    expect(censusNinePlus([{ grade_numeric: 9.8, count_at_grade: 10 }, { grade_numeric: 9.0, count_at_grade: 5 }, { grade_numeric: 8.0, count_at_grade: 99 }])).toBe(15);
  });

  it("completeness and ledger reflect only present data", () => {
    const c = buildCompleteness({ cover: true, census: false, gradeLattice: true, priceHistory: false, recentSales: false, liquidity: false });
    expect(c.score).toBe(33);
    expect(c.grade).toBe("F");
    expect(buildProvenanceLedger({ fmv98: null, ppSnapshotDate: null, ppSnapshotCount: 0, ppSourceId: null, census: null, sales: null, cover: null })).toEqual([]);
  });
});
