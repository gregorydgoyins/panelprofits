import { describe, expect, it } from "vitest";
import { buildCandles, bucketStart, dedupeSales, gradesTraded, pickBucket, saleStats, seriesKey, type SaleObs } from "../lib/sniper/candles";

const s = (date: string, price: number, grade: number | null = 9.8, confirmed = false, source = "x"): SaleObs => ({
  date, price, grade, venue: "ebay", source, confirmed,
});

describe("sniper candles come only from recorded sales", () => {
  it("opens on the first sale, closes on the last, and volume is the count", () => {
    const c = buildCandles([s("2026-10-05", 100), s("2026-10-06", 140), s("2026-10-07", 90), s("2026-10-08", 120)], "week");
    expect(c.length).toBe(1);
    expect(c[0].time).toBe("2026-10-05");
    expect(c[0].open).toBe(100);
    expect(c[0].close).toBe(120);
    expect(c[0].high).toBe(140);
    expect(c[0].low).toBe(90);
    expect(c[0].volume).toBe(4);
    expect(c[0].dollars).toBe(450);
  });

  it("makes no candle for a period with no sales", () => {
    const c = buildCandles([s("2026-01-10", 50), s("2026-04-10", 60)], "month");
    expect(c.map((x) => x.time).join(",")).toBe("2026-01-01,2026-04-01");
  });

  it("counts one sale once when two sources report it, keeping the confirmed record", () => {
    const d = dedupeSales([s("2026-10-05", 100, 9.8, false, "ebay_last_bid"), s("2026-10-05", 100, 9.8, true, "ebay_insights")]);
    expect(d.length).toBe(1);
    expect(d[0].confirmed).toBe(true);
  });

  it("ignores zero prices and bad dates", () => {
    expect(dedupeSales([s("2026-10-05", 0), s("nope", 10)]).length).toBe(0);
  });

  it("weeks start Monday and quarters start on the first of the quarter", () => {
    expect(bucketStart("2026-10-08", "week")).toBe("2026-10-05"); // Thursday -> Monday
    expect(bucketStart("2026-11-20", "quarter")).toBe("2026-10-01");
    expect(bucketStart("2026-11-20", "year")).toBe("2026-01-01");
  });

  it("picks coarser periods when sales are sparse", () => {
    const sparse = [s("2022-03-01", 10), s("2023-06-01", 12), s("2024-09-01", 15), s("2026-01-01", 20)];
    expect(pickBucket(sparse) === "day" || pickBucket(sparse) === "week").toBe(false);
    const dense = Array.from({ length: 60 }, (_, i) => s(`2026-09-${String((i % 28) + 1).padStart(2, "0")}`, 100 + i));
    expect(pickBucket(dense) === "year").toBe(false);
  });

  it("lists grades by how often they trade", () => {
    const g = gradesTraded([s("2026-01-01", 1, 9.8), s("2026-01-02", 2, 9.8), s("2026-01-03", 3, 9.4)]);
    expect(g[0].grade).toBe(9.8);
    expect(g[0].count).toBe(2);
  });

  it("reports median, range and the last sale, and says nothing when there are none", () => {
    const st = saleStats([s("2026-09-01", 100), s("2026-09-20", 300), s("2026-10-01", 200)], new Date("2026-10-12"));
    expect(st.n).toBe(3);
    expect(st.median).toBe(200);
    expect(st.low).toBe(100);
    expect(st.high).toBe(300);
    expect(st.last?.price).toBe(200);
    expect(st.median90d).toBe(200);
    const none = saleStats([]);
    expect(none.n).toBe(0);
    expect(none.last).toBe(null);
    expect(none.median).toBe(null);
  });

  it("normalises series names so eBay titles and sales records meet", () => {
    expect(seriesKey("The Amazing Spider-Man (1963)", "#300")).toBe(seriesKey("Amazing Spider-Man", "300"));
  });
});
